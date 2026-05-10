import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { encryptApiKey } from "@/lib/encryption";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  const keys = await prisma.userApiKey.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ keys: keys.map((k) => ({ id: k.id, provider: k.provider, modelId: k.modelId, isDefault: k.isDefault })) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, provider = "deepseek", apiKey, modelId, isDefault = true } = body;
  if (!userId || !apiKey) return NextResponse.json({ error: "Missing userId or apiKey" }, { status: 400 });

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
