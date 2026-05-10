"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-20 border-b border-ds-border/60 bg-ds-bg/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary shadow-glow" />
            <h1 className="text-lg font-semibold text-ds-text">DeepScholar</h1>
          </div>
          <nav className="flex gap-2 text-sm">
            <Link className={`rounded px-2 py-1 ${isActive('/dashboard') ? 'bg-ds-primary/20 text-blue-200' : 'text-ds-muted'}`} href="/dashboard">Dashboard</Link>
            <Link className={`rounded px-2 py-1 ${isActive('/projects') ? 'bg-ds-primary/20 text-blue-200' : 'text-ds-muted'}`} href="/projects">Projects</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
