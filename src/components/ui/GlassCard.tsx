import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';

type GlassCardProps = PropsWithChildren<{ className?: string }>;

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <section
      className={clsx(
        'ds-panel',
        className,
      )}
    >
      {children}
    </section>
  );
}
