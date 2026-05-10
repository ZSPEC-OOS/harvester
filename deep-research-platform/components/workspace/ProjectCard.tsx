"use client";

import Link from "next/link";
import type { ProjectSummary } from "@/types/research";

export function ProjectCard({ project, onDelete }: { project: ProjectSummary; onDelete: (id: string) => void }) {
  return (
    <div className="group rounded-xl border border-ds-border p-4">
      <Link href={`/projects/${project.id}`}>
        <h3 className="font-semibold">{project.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ds-muted">{project.description || "No description"}</p>
        <p className="mt-3 text-xs text-ds-muted">{project.sessionCount} sessions</p>
      </Link>
      <button onClick={() => onDelete(project.id)} className="mt-2 hidden text-xs text-red-300 group-hover:block">Delete</button>
    </div>
  );
}
