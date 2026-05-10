"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#07090f] via-[#0a0f1a] to-[#07090f] px-6 py-10">
      <div className="mx-auto grid max-w-2xl place-items-center">
        <GlassCard className="w-full border border-white/10 bg-black/35 p-8 text-center shadow-[0_0_50px_rgba(0,180,255,0.15)] backdrop-blur-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
            <AlertTriangle className="h-6 w-6 text-red-300" />
          </div>
          <h2 className="text-xl font-semibold text-white">Unexpected workspace error</h2>
          <p className="mt-2 text-sm text-slate-300">
            We hit a runtime issue while rendering this page. Your saved research data is unchanged.
          </p>
          <button
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/20"
            onClick={() => reset()}
          >
            <RefreshCw className="h-4 w-4" />
            Reload section
          </button>
        </GlassCard>
      </div>
    </main>
  );
}
