import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { testConnectionSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const parsed = testConnectionSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ ok: false, error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    const { apiKey, baseUrl, modelId } = parsed.data;
    const client = new OpenAI({ apiKey, baseURL: baseUrl });
    await client.chat.completions.create({ model: modelId, messages: [{ role: "user", content: "ping" }], max_tokens: 5 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Connection failed" }, { status: 400 });
  }
}
