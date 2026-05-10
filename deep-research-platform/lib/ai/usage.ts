export async function logUsageEvent(_input: {
  userId: string;
  sessionId?: string;
  eventType: string;
  provider?: string;
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  metadata?: Record<string, unknown>;
}) {
  // no-op: usage logging requires a database
}
