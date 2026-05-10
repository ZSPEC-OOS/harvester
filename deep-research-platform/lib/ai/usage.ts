import { prisma } from "@/lib/db";
import { estimateCost } from "@/lib/ai/cost";

export async function logUsageEvent(input: {
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
  const promptTokens = input.promptTokens ?? 0;
  const completionTokens = input.completionTokens ?? 0;
  const computedCost = input.costUsd ?? estimateCost(input.model, promptTokens, completionTokens);

  await prisma.usageEvent.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId,
      eventType: input.eventType,
      provider: input.provider,
      model: input.model,
      promptTokens,
      completionTokens,
      costUsd: computedCost,
      metadata: input.metadata,
    },
  });
}
