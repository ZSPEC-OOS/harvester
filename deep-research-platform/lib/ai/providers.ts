import { z } from "zod";

export interface AIProvider {
  provider: string;
  model: string;
  generateText(prompt: string, system?: string): Promise<string>;
  streamText(prompt: string, system?: string): AsyncGenerator<string, void, unknown>;
  generateObject<T>(prompt: string, system?: string): Promise<T>;
  generateObjectValidated<T>(prompt: string, schema: z.ZodSchema<T>, system?: string): Promise<T>;
}
