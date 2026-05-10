"use client";
export default function GlobalError({ reset }: { error: Error; reset: () => void }) { return <html><body className="min-h-screen flex items-center justify-center"><div className="text-center space-y-3"><h2>Critical application error.</h2><button className="px-4 py-2 bg-blue-600 rounded" onClick={() => reset()}>Try Again</button></div></body></html>; }
