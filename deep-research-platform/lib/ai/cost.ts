const MODEL_PRICING = {
  "deepseek-chat": { inputPerMillion: 0.14, outputPerMillion: 0.28 },
  "deepseek-reasoner": { inputPerMillion: 0.55, outputPerMillion: 2.19 },
} as const;

export function estimateTokensFromChars(charCount: number) {
  return Math.max(0, Math.round(charCount / 4));
}

export function estimateCost(model: string | undefined, promptTokens: number, completionTokens: number) {
  const pricing = model ? MODEL_PRICING[model as keyof typeof MODEL_PRICING] : undefined;
  if (!pricing) return 0;
  const inputCost = (Math.max(0, promptTokens) / 1_000_000) * pricing.inputPerMillion;
  const outputCost = (Math.max(0, completionTokens) / 1_000_000) * pricing.outputPerMillion;
  return Number((inputCost + outputCost).toFixed(6));
}

export const SEARCH_COST_PER_QUERY_USD = 0.001;
