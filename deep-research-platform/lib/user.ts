import { randomUUID } from "crypto";

const STORAGE_KEY = "ds_user_id";

export function getUserIdFromClient(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function setUserIdInClient(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, id);
}

export async function createAnonymousUser(): Promise<string> {
  return randomUUID();
}
