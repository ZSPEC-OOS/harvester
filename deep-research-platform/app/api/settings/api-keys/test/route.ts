import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { testConnectionSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const parsed = testConnectionSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid request parameters" }, { status: 400 });
    }

    const { apiKey, baseUrl, modelId } = parsed.data;
    const client = new OpenAI({ apiKey, baseURL: baseUrl, timeout: 15_000, maxRetries: 0 });

    await client.chat.completions.create({
      model: modelId,
      messages: [{ role: "user", content: "Hi" }],
      max_tokens: 1,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
