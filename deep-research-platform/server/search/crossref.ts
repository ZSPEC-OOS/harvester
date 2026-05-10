import { RawSearchResult } from "@/lib/search/types";

type CrossRefItem = {
  title?: string[];
  DOI?: string;
  URL?: string;
  author?: Array<{ given?: string; family?: string; name?: string }>;
  "container-title"?: string[];
  issued?: { "date-parts"?: number[][] };
  type?: string;
  abstract?: string;
};

function mapType(type?: string): RawSearchResult["sourceType"] {
  if (!type) return "journal";
  if (type.includes("posted-content")) return "preprint";
  if (type.includes("journal")) return "journal";
  if (type.includes("book")) return "book";
  if (type.includes("report")) return "report";
  return "journal";
}

export async function searchCrossRef(query: string): Promise<RawSearchResult[]> {
  const mailto = process.env.CROSSREF_MAILTO;
  if (!mailto) {
    console.warn("CROSSREF_MAILTO missing; skipping CrossRef provider");
    return [];
  }

  const url = `https://api.crossref.org/works?query.bibliographic=${encodeURIComponent(query)}&rows=10`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": `DeepScholar/1.0 (mailto:${mailto})`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    console.warn("CrossRef request failed", res.status);
    return [];
  }

  const data = (await res.json()) as { message?: { items?: CrossRefItem[] } };
  return (data.message?.items ?? []).map((item) => ({
    title: item.title?.[0] ?? null,
    url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : null),
    doi: item.DOI ?? null,
    authors: (item.author ?? []).map((a) => a.name ?? [a.given, a.family].filter(Boolean).join(" ")).filter(Boolean) as string[],
    journal: item["container-title"]?.[0] ?? null,
    year: item.issued?.["date-parts"]?.[0]?.[0] ?? null,
    abstract: item.abstract ?? null,
    sourceType: mapType(item.type),
  }));
}
