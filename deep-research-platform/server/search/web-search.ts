import { RawSearchResult } from "@/lib/search/types";

function extractYear(text: string): number | null {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

export async function searchSerper(query: string): Promise<RawSearchResult[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) {
    console.warn("SERPER_API_KEY missing; skipping Serper provider");
    return [];
  }

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-API-KEY": key },
    body: JSON.stringify({ q: query, num: 10 }),
  });

  if (!res.ok) {
    console.warn("Serper request failed", res.status);
    return [];
  }

  const data = (await res.json()) as { organic?: Array<{ title?: string; link?: string; snippet?: string }> };
  return (data.organic ?? []).map((item) => ({
    title: item.title ?? null,
    url: item.link ?? null,
    year: extractYear(item.snippet ?? ""),
    authors: [],
    journal: null,
    doi: null,
    sourceType: "web",
  }));
}
