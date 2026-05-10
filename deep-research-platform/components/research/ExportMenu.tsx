"use client";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { FileCode2, FileJson, FileSpreadsheet, FileText, FileType2, BookMarked, ChevronDown } from "lucide-react";
import type { ExportFormat } from "@/server/export/types";

const FORMATS: Array<{ format: ExportFormat; label: string; description: string; icon: ReactNode }> = [
  { format: "markdown", label: "Markdown", description: "Full report + metadata", icon: <FileText size={14} /> },
  { format: "bibtex", label: "BibTeX", description: "Reference list only", icon: <BookMarked size={14} /> },
  { format: "json", label: "JSON", description: "Complete session data", icon: <FileJson size={14} /> },
  { format: "csv", label: "CSV", description: "Evidence table", icon: <FileSpreadsheet size={14} /> },
  { format: "docx", label: "DOCX", description: "Word document", icon: <FileType2 size={14} /> },
  { format: "pdf", label: "PDF", description: "HTML placeholder", icon: <FileCode2 size={14} /> },
];

export function ExportMenu({ sessionId }: { sessionId: string | null }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ExportFormat | null>(null);

  const triggerDownload = async (format: ExportFormat) => {
    if (!sessionId) return;
    setLoading(format);
    try {
      const userId = localStorage.getItem("ds_user_id");
      const res = await fetch(`/api/research/${sessionId}/export`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, format }) });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const cd = res.headers.get("Content-Disposition") || "";
      const filename = cd.match(/filename="?([^";]+)"?/)?.[1] ?? `${sessionId}.${format}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${format.toUpperCase()} successfully.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Export failed");
    } finally {
      setLoading(null);
      setOpen(false);
    }
  };

  return <div className="relative"><button onClick={() => setOpen((o) => !o)} disabled={!sessionId} className="flex w-full items-center justify-center gap-2 rounded-lg border border-ds-accent/40 bg-ds-accent/10 px-3 py-2 text-sm disabled:opacity-50">Export <ChevronDown size={14} /></button>{open && <div className="absolute z-20 mt-2 w-full rounded-xl border border-ds-border bg-ds-panel p-1 shadow-xl">{FORMATS.map((f) => <button key={f.format} onClick={() => triggerDownload(f.format)} disabled={!!loading} className="flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left hover:bg-ds-bg/70 disabled:opacity-60"><span className="mt-0.5">{f.icon}</span><span className="flex-1"><span className="block text-sm">{f.label}</span><span className="block text-xs text-ds-muted">{loading===f.format?"Generating...":f.description}</span></span></button>)}</div>}</div>;
}
