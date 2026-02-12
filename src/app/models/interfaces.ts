export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
  latency?: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  totalTokens: number;
}

export interface PromptExecution {
  id: string;
  prompt: string;
  response: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timestamp: Date;
  latency: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  tags?: string[];
}

export interface ComparisonResult {
  id: string;
  prompt: string;
  executions: PromptExecution[];
  createdAt: Date;
}

export interface ModelConfig {
  name: string;
  provider: 'openai' | 'huggingface' | 'anthropic' | 'google';
  displayName: string;
  maxTokens: number;
  supportsStreaming: boolean;
}

export interface EvaluationMetric {
  id: string;
  name: string;
  prompt: string;
  responses: Array<{
    model: string;
    response: string;
    score?: number;
    latency: number;
  }>;
  timestamp: Date;
}

export interface RAGDocument {
  id: string;
  content: string;
  metadata: {
    source: string;
    timestamp: Date;
    [key: string]: any;
  };
  embedding?: number[];
}

export interface RAGQuery {
  query: string;
  topK: number;
  threshold?: number;
}

export interface RAGResponse {
  answer: string;
  sources: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
  model: string;
  latency: number;
}
