import { prisma } from "@/lib/db";
import { decryptApiKey } from "@/lib/encryption";
import { DeepSeekProvider } from "./deepseek";

export async function getProviderForUser(userId: string, modelId?: string) {
  const saved = await prisma.userApiKey.findFirst({
    where: { userId, provider: "deepseek" },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

  if (saved) {
    await prisma.userApiKey.update({ where: { id: saved.id }, data: { lastUsedAt: new Date() } });
    return new DeepSeekProvider(decryptApiKey(saved.encryptedKey), baseURL, modelId || saved.modelId || "deepseek-chat");
  }

  if (process.env.DEEPSEEK_API_KEY) {
    return new DeepSeekProvider(process.env.DEEPSEEK_API_KEY, baseURL, modelId || "deepseek-chat");
  }

  throw new Error("No AI key configured. Save a DeepSeek key or set DEEPSEEK_API_KEY.");
}
