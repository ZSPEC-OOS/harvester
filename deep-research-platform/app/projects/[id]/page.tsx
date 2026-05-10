"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { TopBar } from "@/components/layout/TopBar";
import { Container } from "@/components/layout/Container";
import { SessionList } from "@/components/workspace/SessionList";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [userId, setUserId] = useState("");
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const uid = localStorage.getItem("ds_user_id") || "";
    setUserId(uid);
    if (!uid) return;
    fetch(`/api/projects/${id}?userId=${uid}`).then((r) => r.json()).then(setProject);
  }, [id]);

  return <main className="min-h-screen bg-ds-bg text-ds-text"><TopBar /><Container><div className="space-y-4 py-6"><h2 className="text-xl font-semibold">{project?.name || "Project"}</h2><p className="text-sm text-ds-muted">{project?.description || ""}</p><p className="text-sm text-ds-muted">{project?.sessionCount || 0} sessions</p>{userId && <SessionList userId={userId} projectId={id} limit={50} />}</div></Container></main>;
}
