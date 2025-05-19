export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export interface SearchImage {
  url: string;
  description?: string;
}

export interface Action {
  status: 'idle' | 'thinking' | 'searching' | 'typing' | 'done';
  stepType: string;
  message: string;
  timestamp?: number;
}

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
  files?: {
    name: string;
    type: string;
    size: number;
  }[];
  isIntermediate?: boolean;
  sources?: SearchResult[];
  searchImages?: SearchImage[];
  actions?: Action[];
  currentAction?: string;
  followupQuestions?: string[];
};
