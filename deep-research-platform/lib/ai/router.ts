import { DeepSeekProvider } from "./deepseek";

export function getProviderFromConfig(apiKey: string, baseUrl: string, modelId: string) {
  return new DeepSeekProvider(apiKey, baseUrl, modelId);
}
