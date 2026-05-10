import { z } from "zod";
import OpenAI from "openai";
import { AIProvider } from "./providers";

export class DeepSeekProvider implements AIProvider {
  provider = "deepseek";
  model: string;
  private client: OpenAI;

  constructor(apiKey: string, baseURL: string, model = "deepseek-chat") {
    this.client = new OpenAI({ apiKey, baseURL, timeout: 10000 });
    this.model = model;
  }

  async generateText(prompt: string, system?: string): Promise<string> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: prompt },
      ],
      temperature: 0.2,
    });
    return completion.choices[0]?.message?.content ?? "";
  }

  async *streamText(prompt: string, system?: string): AsyncGenerator<string, void, unknown> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      stream: true,
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: prompt },
      ],
      temperature: 0.2,
    });

    for await (const part of stream) {
      const token = part.choices?.[0]?.delta?.content;
      if (token) yield token;
    }
  }

  async generateObject<T>(prompt: string, system?: string): Promise<T> {
    const text = await this.generateText(prompt, system);
    return JSON.parse(text) as T;
  }

  async generateObjectValidated<T>(prompt: string, schema: z.ZodSchema<T>, system?: string): Promise<T> {
    const text = await this.generateText(prompt, system);
    const jsonText = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonText);
    const validated = schema.safeParse(parsed);
    if (!validated.success) throw new Error("Model output failed schema validation");
    return validated.data;
  }
}
