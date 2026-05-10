"use client";

import { useEffect } from "react";

export function UserProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initUser = async () => {
      const existing = localStorage.getItem("ds_user_id");
      const res = await fetch("/api/user/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: existing }),
      });

      if (res.ok) {
        const data = (await res.json()) as { userId: string };
        localStorage.setItem("ds_user_id", data.userId);
      }
    };

    void initUser();
  }, []);

  return <>{children}</>;
}
