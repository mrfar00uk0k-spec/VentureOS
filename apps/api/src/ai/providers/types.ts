export interface ProviderCompletionParams {
  system: string;
  user: string;
  model: string;
  apiKey: string;
}

export interface ProviderCompletionResult {
  content: string; // raw JSON text from the model
  promptTokens: number;
  completionTokens: number;
}

export interface AiProvider {
  readonly name: string;
  complete(params: ProviderCompletionParams): Promise<ProviderCompletionResult>;
}
