import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';

type GlassCardProps = PropsWithChildren<{ className?: string }>;

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <section
      className={clsx(
        'rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg',
        className,
      )}
    >
      {children}
    </section>
  );
}
