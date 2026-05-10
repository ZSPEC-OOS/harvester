"use client";

import { useEffect, useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Container } from "@/components/layout/Container";
import { ProjectCard } from "@/components/workspace/ProjectCard";
import type { ProjectSummary } from "@/types/research";

function getUid(): string {
  return localStorage.getItem("ds_user_id") || "";
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const uid = getUid();
    if (!uid) return;
    const data = await fetch(`/api/projects?userId=${uid}`).then((r) => r.json());
    setProjects(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    const uid = getUid();
    if (!uid) return;
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: uid, name, description }),
    });
    setName("");
    setDescription("");
    load();
  };

  const del = async (id: string) => {
    const uid = getUid();
    await fetch(`/api/projects/${id}?userId=${uid}`, { method: "DELETE" });
    load();
  };

  return (
    <main className="min-h-screen bg-ds-bg text-ds-text">
      <TopBar />
      <Container>
        <div className="space-y-4 py-6">
          <h2 className="text-xl font-semibold">Projects</h2>
          <div className="grid gap-2 rounded-lg border border-ds-border p-3 md:grid-cols-3">
            <input
              className="input-recessed rounded px-3 py-2 text-sm"
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
            <input
              className="input-recessed rounded px-3 py-2 text-sm"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
            <button
              onClick={create}
              disabled={!name.trim()}
              className="rounded bg-ds-primary px-3 py-2 text-sm font-medium disabled:opacity-50"
            >
              New Project
            </button>
          </div>
          {projects.length === 0 ? (
            <p className="text-ds-muted">No projects yet.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => <ProjectCard key={p.id} project={p} onDelete={del} />)}
            </div>
          )}
        </div>
      </Container>
    </main>
  );
}
