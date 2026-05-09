import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';

type GlassCardProps = PropsWithChildren<{ className?: string }>;

export function GlassCard({ className, children }: GlassCardProps) {
  return (
    <section
      className={clsx(
        'rounded-2xl',
        className,
      )}
      style={{
        background: 'rgba(8, 18, 38, 0.92)',
        border: '1px solid rgba(120, 140, 180, 0.14)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.045), ' +
          '0 28px 72px rgba(0,0,0,0.52), ' +
          '0 0 72px rgba(15,40,100,0.10)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </section>
  );
}
