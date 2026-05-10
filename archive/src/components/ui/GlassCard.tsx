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
        background: 'rgba(13, 26, 56, 0.90)',
        border: '1px solid rgba(130, 158, 210, 0.22)',
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.07), ' +
          '0 24px 64px rgba(0,0,0,0.48), ' +
          '0 0 64px rgba(15,40,100,0.12)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </section>
  );
}
