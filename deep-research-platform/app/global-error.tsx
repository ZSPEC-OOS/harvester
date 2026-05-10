"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", background: "#050816", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, system-ui, sans-serif" }}>
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "420px", width: "100%", background: "rgba(13,26,56,0.90)", border: "1px solid rgba(130,158,210,0.22)", borderRadius: "1rem", boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>
          <div style={{ margin: "0 auto 1rem", width: "48px", height: "48px", borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertTriangle size={22} color="#f87171" />
          </div>
          <h2 style={{ color: "#F3F6FB", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Critical application error</h2>
          <p style={{ color: "#8AAAC6", fontSize: "0.875rem", marginBottom: "1.5rem" }}>The application encountered an unrecoverable error. Please try reloading.</p>
          <button
            onClick={reset}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#2155D6", color: "#fff", border: "none", borderRadius: "0.5rem", padding: "0.625rem 1.25rem", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}
          >
            <RefreshCw size={14} />
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
