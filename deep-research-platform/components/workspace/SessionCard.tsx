import Link from "next/link";
import type { SessionSummary } from "@/types/research";

const statusCls: Record<string, string> = {
  complete: "bg-green-500/20 text-green-300",
  failed: "bg-red-500/20 text-red-300",
  planning: "bg-yellow-500/20 text-yellow-300",
  searching: "bg-blue-500/20 text-blue-300",
  synthesizing: "bg-blue-500/20 text-blue-300",
};

export function SessionCard({ session }: { session: SessionSummary }) {
  return (
    <Link href={`/research/${session.id}`} className="block rounded-lg border border-ds-border p-3 hover:border-ds-primary/60">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="line-clamp-2 text-sm font-medium">{session.topic}</p>
        <span className={`rounded px-2 py-0.5 text-[10px] uppercase ${statusCls[session.status] ?? "bg-slate-600/30 text-slate-300"}`}>{session.status}</span>
      </div>
      <p className="text-xs text-ds-muted">{new Date(session.createdAt).toLocaleString()}</p>
      <p className="text-xs text-ds-muted">Sources: {session.sourceCount} {session.projectName ? `• ${session.projectName}` : ""}</p>
    </Link>
  );
}
