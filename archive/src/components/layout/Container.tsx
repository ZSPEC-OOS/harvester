import type { PropsWithChildren } from 'react';

export function Container({ children }: PropsWithChildren) {
  return <main className="mx-auto max-w-[1360px] px-3 py-5 sm:px-6 sm:py-8">{children}</main>;
}
