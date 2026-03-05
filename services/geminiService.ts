
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, GitHubRepo, ModelMode, GroundingSource } from "../types";

export class GitPulseService {
  /**
   * Generates a streaming response with search grounding.
   * Converts natural English queries into optimized GitHub search syntax.
   */
  async *generateStream(
    prompt: string,
    history: ChatMessage[],
    mode: ModelMode = ModelMode.PRO
  ) {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    // Define local interfaces for the configuration to avoid implicit any
    interface GeminiTool {
      googleSearch: Record<string, never>;
    }

    interface GeminiConfig {
      systemInstruction: string;
      tools?: GeminiTool[];
      thinkingConfig?: { thinkingBudget: number };
    }

    const config: GeminiConfig = {
      systemInstruction: `You are an expert GitHub search engine. Your task is to find the best repositories based on user queries and output them in a high-fidelity, standardized format.

RESPONSE GUIDELINES:
1. Provide a brief opening sentence summarizing the search.
2. For each repository found, follow this EXACT format strictly:

**[Repo Title]**
[Full GitHub URL]
[Brief, high-impact technical description - max 2 sentences]
[Stats: Stars: ~count | Forks: ~count | License: Type | Updated: Timeframe | Language: PrimaryLanguage]

3. Do not include raw source URLs or grounding lists at the end.
4. If the user asks for follow-up details, maintain the same clean aesthetic.
5. Reference Date: Dec 21, 2025.

Example output:
**React Query**
https://github.com/TanStack/query
Powerful asynchronous state management for TS/JS, React, Solid, Vue and Svelte.
[Stats: Stars: ~38K+ | Forks: ~2.1K | License: MIT | Updated: Late 2025 | Language: TypeScript]`,
      tools: [{ googleSearch: {} }],
    };

    if (mode === ModelMode.PRO) {
      config.thinkingConfig = { thinkingBudget: 16000 };
    }

    try {
      const result = await ai.models.generateContentStream({
        model: mode,
        contents,
        config
      });

      let accumulatedText = "";
      let repos: GitHubRepo[] = [];
      let sources: GroundingSource[] = [];

      for await (const chunk of result) {
        const text = chunk.text || "";
        accumulatedText += text;

        // Safely access grounding metadata with type guards or optional chaining
        // We cast to unknown first then to a structure we expect if the SDK types are insufficient
        interface GroundingChunk {
          web?: {
            uri?: string;
            title?: string;
          }
        }

        // Accessing candidates from the chunk object
        // The SDK types might hide some experimental fields, so we access safely
        const candidates = (chunk as unknown as { candidates?: { groundingMetadata?: { groundingChunks?: GroundingChunk[] } }[] }).candidates;
        const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks;

        if (groundingChunks && Array.isArray(groundingChunks)) {
          groundingChunks.forEach((c) => {
            if (c.web && c.web.uri) {
              const uri = (c.web.uri.startsWith('http://') || c.web.uri.startsWith('https://')) ? c.web.uri : '#';
              const title = c.web.title || 'Source';

              const newSource: GroundingSource = {
                uri,
                title
              };
              if (!sources.find(s => s.uri === newSource.uri)) {
                sources.push(newSource);
              }

              if (uri.includes('github.com')) {
                const urlParts = uri.split('/');
                if (urlParts.length >= 5) {
                  const owner = urlParts[3];
                  const name = urlParts[4].split('?')[0].split('#')[0];
                  if (!repos.find(r => r.name === name)) {
                    repos.push({
                      owner,
                      name,
                      uri,
                      description: title,
                      trustScore: 92,
                      fitType: 'Production',
                      stars: "---",
                      forks: "---",
                      license: "---",
                      language: "---"
                    });
                  }
                }
              }
            }
          });
        }

        yield { text: accumulatedText, repos, sources };
      }
    } catch (error) {
      console.error("GitPulse AI Error:", error);
      throw error;
    }
  }
}

export const gitPulse = new GitPulseService();
