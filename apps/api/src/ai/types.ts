export interface AgentResult<T> {
  success: boolean;
  confidence: number; // 0-100
  data: T | null;
  summary: string;
  error?: string;
}

export interface AgentContext {
  projectId: string;
  sessionId: string;
  idea: string;
  knowledgeBase: Record<string, unknown>;
}

export interface Agent<TOutput = unknown> {
  readonly name: string;
  run(context: AgentContext): Promise<AgentResult<TOutput>>;
}
