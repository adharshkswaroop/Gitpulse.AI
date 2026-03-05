
export interface GitHubRepo {
  owner: string;
  name: string;
  uri: string;
  description: string;
  stars?: string;
  forks?: string;
  license?: string;
  lastCommit?: string;
  trustScore?: number;
  fitType?: 'Production' | 'Prototype' | 'Enterprise';
  language?: string;
  watchers?: string;
  updatedAt?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
  source?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  repos?: GitHubRepo[];
  isThinking?: boolean;
  // Added sources property to store grounding chunks
  sources?: GroundingSource[];
}

export interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  timestamp: number;
}

export interface SavedStack {
  id: string;
  name: string;
  typeId?: string;
  stackId: string; // The URL of the repo
  repos: GitHubRepo[];
  timestamp: number;
}

export enum ModelMode {
  FAST = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview'
}
