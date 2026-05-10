import { z } from "zod";

export const createSessionSchema = z.object({
  userId: z.string().min(1),
  topic: z.string().trim().min(1).max(500),
  audience: z.string().trim().optional(),
  depthLevel: z.enum(["shallow", "standard", "deep"]).optional(),
  citationStyle: z.enum(["apa", "mla", "chicago", "vancouver", "doi-only"]).optional(),
  sourceCount: z.number().int().min(1).max(100).optional(),
  dateRangeStart: z.string().optional(),
  dateRangeEnd: z.string().optional(),
  projectId: z.string().optional().nullable(),
  domainRestrictions: z.array(z.string()).optional(),
  excludedSourceTypes: z.array(z.string()).optional(),
});

export const exportSchema = z.object({
  userId: z.string().min(1),
  format: z.enum(["markdown", "bibtex", "json", "csv", "docx", "pdf"]),
});

export const apiKeySchema = z.object({
  userId: z.string().min(1),
  provider: z.string().min(1).default("deepseek"),
  apiKey: z.string().min(1),
  modelId: z.string().optional(),
  isDefault: z.boolean().optional().default(true),
});

export const testConnectionSchema = z.object({
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional().default("https://api.deepseek.com"),
  modelId: z.string().optional().default("deepseek-chat"),
});
