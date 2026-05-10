export interface AIProvider {
  provider: string;
  model: string;
  generateText(prompt: string, system?: string): Promise<string>;
  streamText(prompt: string, system?: string): AsyncGenerator<string, void, unknown>;
  generateObject<T>(prompt: string, system?: string): Promise<T>;
}
