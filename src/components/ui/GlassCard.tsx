import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';

type GlassCardProps = PropsWithChildren<{ className?: string }>;

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-white/15 bg-[#0b1221]/80 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl',
        className,
      )}
    >
      {children}
    </section>
  );
}
