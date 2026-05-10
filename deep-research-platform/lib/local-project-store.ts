export interface LocalProject {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const store = new Map<string, LocalProject>();

export const projectStore = {
  create(input: Omit<LocalProject, "createdAt" | "updatedAt">): LocalProject {
    const now = new Date();
    const project: LocalProject = { ...input, createdAt: now, updatedAt: now };
    store.set(project.id, project);
    return project;
  },
  get(id: string): LocalProject | null {
    return store.get(id) ?? null;
  },
  delete(id: string): void {
    store.delete(id);
  },
  listByUser(userId: string): LocalProject[] {
    return Array.from(store.values())
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },
};
