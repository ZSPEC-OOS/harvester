"use client";
import { useRouter } from "next/navigation";

export function ReRunButton({ config }: { config: Record<string, unknown> }) {
  const router = useRouter();
  const run = async () => {
    const userId = localStorage.getItem("ds_user_id");
    if (!userId) return;
    const res = await fetch("/api/research", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, ...config }) });
    const data = await res.json();
    if (data.sessionId) router.push(`/research/${data.sessionId}`);
  };
  return <button onClick={run} className="rounded bg-ds-primary px-3 py-2 text-xs font-semibold">Re-run Research</button>;
}
