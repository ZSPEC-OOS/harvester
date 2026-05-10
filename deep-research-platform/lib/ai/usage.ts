import { prisma } from "@/lib/db";

export async function logUsageEvent(input: {
  userId: string;
  sessionId?: string;
  eventType: string;
  provider?: string;
  model?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.usageEvent.create({
    data: {
      userId: input.userId,
      sessionId: input.sessionId,
      eventType: input.eventType,
      provider: input.provider,
      model: input.model,
      metadata: input.metadata,
    },
  });
}
