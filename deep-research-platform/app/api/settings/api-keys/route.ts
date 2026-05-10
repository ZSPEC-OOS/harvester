import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptApiKey } from "@/lib/encryption";
import { apiKeySchema } from "@/lib/validation";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const keys = await prisma.userApiKey.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ keys: keys.map((k) => ({ id: k.id, provider: k.provider, modelId: k.modelId, isDefault: k.isDefault })) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = apiKeySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  const { userId, provider, apiKey, modelId, isDefault } = parsed.data;

  if (isDefault) {
    await prisma.userApiKey.updateMany({ where: { userId, provider }, data: { isDefault: false } });
  }

  const created = await prisma.userApiKey.create({
    data: {
      userId,
      provider,
      encryptedKey: encryptApiKey(apiKey),
      modelId,
      isDefault,
    },
  });

  return NextResponse.json({ id: created.id, provider: created.provider, modelId: created.modelId, isDefault: created.isDefault });
}
