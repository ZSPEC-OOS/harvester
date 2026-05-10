import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — DeepScholar",
};

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-ds-bg text-ds-text">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">DeepScholar</h1>
          <p className="mt-1 text-sm text-ds-muted">AI-powered deep research platform</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <div className="glass rounded-xl p-4">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-ds-muted">Search Configuration</h2>
              <p className="text-xs text-ds-muted">Configuration cards will be mounted here in the next step.</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="glass rounded-xl p-4">
              <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-ds-muted">Research Console</h2>
              <p className="text-xs text-ds-muted">Live research feed will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
