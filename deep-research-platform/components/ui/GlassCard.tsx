import { clsx } from "clsx";
import type { PropsWithChildren } from "react";

export function GlassCard({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={clsx("glass rounded-2xl", className)}>{children}</section>;
}
