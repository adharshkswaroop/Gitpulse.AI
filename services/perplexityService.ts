
import { GroundingSource, GitHubRepo } from '../types';

export class PerplexityService {
    private apiKey: string;
    private baseUrl = 'https://api.perplexity.ai/chat/completions';

    constructor() {
        this.apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY || '';
    }

    async search(query: string, constraints: string[] = [], signal?: AbortSignal): Promise<{ text: string; repos: GitHubRepo[]; sources: GroundingSource[] }> {
        if (!this.apiKey) {
            console.error('Perplexity API key missing');
            return { text: 'Configuration Error: API Key missing. Please check your environment variables.', repos: [], sources: [] };
        }

        const KNOWLEDGE_CONTEXT = `
        DOMAIN KNOWLEDGE (2024-2025 TRENDS):
        - AI/ML Dominance: Prioritize repositories related to Generative AI, LLMs (Large Language Models), Agents (AutoGPT, BabyAGI), and RAG (Retrieval Augmented Generation). Key libraries: LangChain, LlamaIndex, Transformers, DeepSeek-V3, DeepSeek-R1.
        - Languages: Python (AI/Data), TypeScript (Web/Agents), Rust (Performance/Systems), Go (Cloud Native).
        - Cloud Native: Ops, Infrastructure as Code (Terraform, Pulumi), Kubernetes, Docker, Prometheus.
        - Security: DevSecOps, Supply Chain Security, Red Teaming Tools.
        - YouTube Trends: Content Analysis, AI Video Generation, creating "clones" or "agents".
        - Perplexity/DeepSeek: Look for API client libraries, unofficial wrappers covering deepseek-coder, deepseek-v3, perplexity-api.
        
        When searching, bias towards these high-momentum areas if the user query is broad.
        `;

        const constraintPrompt = constraints.length > 0
            ? `\n\nSTRICT SEARCH CONSTRAINTS (Advanced Protocol):
           You must ONLY return results that match the following criteria:
           ${constraints.map(c => `- ${c}`).join('\n')}
           
           If a repository does not match these specific constraints, DO NOT include it.`
            : "";

        const systemPrompt = `You are an expert developer assistant specialized in GitHub exploration.${KNOWLEDGE_CONTEXT}\nReturn a strict JSON object (NO markdown backticks, just raw JSON, NO trailing commas) with the following structure:
{
  "summary": "Brief summary of findings",
  "repos": [
    {
      "owner": "owner_name",
      "name": "repo_name",
      "uri": "https://github.com/owner/repo",
      "description": "detailed paragraph explaining the repository's purpose, key features, and use cases (approx 2-3 sentences)",
      "stars": "1.2k",
      "forks": "120",
      "watchers": "9",
      "updated_at": "2 days ago",
      "language": "TypeScript",
      "license": "MIT",
      "trustScore": 95,
      "fitType": "Production"
    }
  ],
  "videos": [
    {
      "title": "Video Title",
      "uri": "https://youtube.com/watch?v=...",
      "channel": "Channel Name"
    }
  ]
}
Find highly relevant GitHub repositories and YouTube tutorials for: "${query}". Ensure high quality results.
CRITICAL INSTRUCTION: You MUST return a JSON object with a "repos" array containing AT LEAST 10 (TEN) distinct repositories that you are CONFIDENT exist. This allows for validation filtering. Do not stop at 3 or 5. Generating fewer than 10 is a FAILURE.${constraintPrompt}`;

        try {
            const response = await this.fetchWithRetry(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    model: 'sonar-pro',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: query }
                    ],
                    max_tokens: 4000,
                    temperature: 0.1, // Lower temp for compliance
                    top_p: 0.9,
                    return_citations: true,
                    search_domain_filter: ["github.com", "youtube.com"]
                }),
                signal // Pass abort signal
            });

            if (!response.ok) {
                if (response.status === 401) throw new Error('Authentication Error: Invalid API Key');
                if (response.status === 402) throw new Error('Payment Required: Insufficient API Credits');
                if (response.status === 429) throw new Error('Rate Limit Exceeded: Please wait a moment and try again');
                if (response.status >= 500) throw new Error('Service Unavailable: Perplexity API is currently down');
                throw new Error(`API Error: ${response.statusText} (${response.status})`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Define interface for expected JSON structure
            interface PerplexityRepo {
                owner?: string;
                name?: string;
                uri?: string;
                description?: string;
                stars?: string;
                forks?: string;
                watchers?: string;
                updated_at?: string;
                language?: string;
                license?: string;
                trustScore?: number;
                fitType?: string;
            }

            interface PerplexityVideo {
                title?: string;
                uri?: string;
                channel?: string;
            }

            interface PerplexityResponse {
                summary?: string;
                repos?: PerplexityRepo[];
                videos?: PerplexityVideo[];
            }

            // Attempt to parse JSON from the content
            let parsedData: PerplexityResponse = {};
            let cleanContent = content.replace(/```json\n?|```/g, '').trim();

            try {
                // 2. Extract JSON object if wrapped in other text
                const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    cleanContent = jsonMatch[0];
                }

                // 3. Remove trailing commas (common LLM error)
                cleanContent = cleanContent.replace(/,(\s*[}\]])/g, '$1');

                // 4. Try parsing
                parsedData = JSON.parse(cleanContent);

            } catch (e) {
                console.warn('JSON Parse failed, attempting regex extraction', e);

                // Fallback: Manual Regex Extraction
                // Improved regex to capture objects better
                parsedData.repos = [];
                // Match objects that look like repo entries
                const entryRegex = /\{[^{}]*"owner"[^{}]+\}/g;
                const entries = cleanContent.match(entryRegex) || [];

                entries.forEach(entry => {
                    const extract = (key: string) => {
                        // Regex to grab value between quotes, simple but effective for standard JSON output
                        const res = entry.match(new RegExp(`"${key}":\\s*"([^"]+)"`));
                        return res ? res[1] : undefined;
                    };

                    const owner = extract('owner');
                    const name = extract('name');

                    if (owner && name) {
                        parsedData.repos = parsedData.repos || [];
                        parsedData.repos.push({
                            owner: owner,
                            name: name,
                            uri: extract('uri') || `https://github.com/${owner}/${name}`,
                            description: extract('description'),
                            stars: extract('stars'),
                            forks: extract('forks'),
                            language: extract('language'),
                        });
                    }
                });

                if (!parsedData.repos || parsedData.repos.length === 0) {
                    // One last attempt to find ANY url
                    if (content.includes('http')) {
                        return {
                            text: "I found some resources, but the detailed analysis format was incomplete. Here is the raw data:\n\n" + content,
                            repos: [],
                            sources: []
                        };
                    }
                    throw new Error('Failed to parse valid repository data from response');
                }
            }

            const rawRepos: GitHubRepo[] = (parsedData.repos || []).map((r) => ({
                owner: r.owner || 'Unknown',
                name: r.name || 'Unknown',
                uri: (r.uri && (r.uri.startsWith('http') || r.uri.startsWith('https'))) ? r.uri : '#',
                description: r.description || '',
                stars: r.stars,
                forks: r.forks,
                watchers: r.watchers,
                updatedAt: r.updated_at,
                language: r.language,
                trustScore: 90,
                fitType: 'Production'
            }));


            // --- VERIFICATION STEP ---
            const verifiedRepos = await this.verifyRepos(rawRepos);

            // Limited to TOP 6 valid repos
            const repos = verifiedRepos.slice(0, 6);


            const sources: GroundingSource[] = (parsedData.videos || []).map((v) => ({
                title: v.title || 'Video',
                uri: (v.uri && (v.uri.startsWith('http://') || v.uri.startsWith('https://'))) ? v.uri : '#',
                source: 'YouTube'
            }));

            // Also add citations if available and not redundant
            if (data.citations && Array.isArray(data.citations)) {
                data.citations.forEach((cite: string) => {
                    if (!sources.find(s => s.uri === cite) && !repos.find(r => r.uri === cite)) {
                        sources.push({
                            title: 'Citation',
                            uri: (cite && (cite.startsWith('http://') || cite.startsWith('https://'))) ? cite : '#',
                            source: 'Web'
                        });
                    }
                });
            }

            return {
                text: parsedData.summary || "Here are the findings.",
                repos,
                sources
            };

        } catch (error: any) {
            // Check for AbortError first
            if (error.name === 'AbortError') throw error;

            console.error('Perplexity Search Failed:', error);
            // Return the specific error message to be displayed in the UI
            return {
                text: `**System Error:** ${error.message || 'An unexpected error occurred during analysis.'}`,
                repos: [],
                sources: []
            };
        }
    }

    private async verifyRepos(repos: GitHubRepo[]): Promise<GitHubRepo[]> {
        const checkPromises = repos.map(async (repo) => {
            // Only verify github links
            if (!repo.uri.includes('github.com')) return repo;

            // Extract owner/repo
            try {
                const match = repo.uri.match(/github\.com\/([^/]+)\/([^/]+)/);
                if (!match) return null; // Invalid format

                const [_, owner, name] = match;
                const apiUrl = `https://api.github.com/repos/${owner}/${name}`;

                const response = await fetch(apiUrl, {
                    method: 'HEAD', // HEAD request is lighter
                    headers: {
                        'User-Agent': 'GitPulse-AI-Verifier' // Required by GitHub API
                    }
                });

                if (response.ok) {
                    return repo;
                } else if (response.status === 403 || response.status === 429) {
                    console.warn(`Repo verification rate limited for ${repo.uri}. Assuming valid.`);
                    return repo; // Rate limited, fail open to avoid hiding potentially good results
                } else {
                    console.warn(`Repo verification failed for ${repo.uri}: ${response.status}`);
                    return null;
                }
            } catch (e) {
                console.warn(`Repo verification error for ${repo.uri}`, e);
                // In case of network error (e.g. rate limit blocking us), we might default to keeping it?
                // Or be strict. Let's be strict for "Page NOT Found", but lenient on network errors?
                // Actually if we can't reach github api, we probably can't ensure it's not 404.
                // But blindly initializing 'HEAD' might get rate limited if we do it too much.
                // For now, let's return null if we can't verify.
                return null;
            }
        });

        const results = await Promise.all(checkPromises);
        return results.filter((r): r is GitHubRepo => r !== null);
    }

    private async fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
        try {
            const response = await fetch(url, options);
            // Retry on 5xx server errors or 429 rate limits
            if (!response.ok && (response.status >= 500 || response.status === 429)) {
                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, backoff));
                    return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
            }
            return response;
        } catch (error) {
            if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, backoff));
                return this.fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
            throw error;
        }
    }
}

export const perplexity = new PerplexityService();
