"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <GlassCard className="w-full max-w-md p-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
          <AlertTriangle size={22} className="text-red-400" />
        </span>
        <h2 className="mb-2 text-lg font-semibold text-white">Dashboard error</h2>
        <p className="mb-6 text-sm text-ds-muted">{error.message || "Something went wrong loading the dashboard."}</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-ds-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </GlassCard>
    </main>
  );
}
