import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, baseUrl = "https://api.deepseek.com", modelId = "deepseek-chat" } = await req.json();
    if (!apiKey) return NextResponse.json({ ok: false, error: "Missing apiKey" }, { status: 400 });
    const client = new OpenAI({ apiKey, baseURL: baseUrl });
    await client.chat.completions.create({ model: modelId, messages: [{ role: "user", content: "ping" }], max_tokens: 5 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Connection failed" }, { status: 400 });
  }
}
