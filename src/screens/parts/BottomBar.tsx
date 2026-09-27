import clsx from 'clsx';
import type { ReactNode } from 'react';

/** Sticky action area at the bottom of a flex-column screen, fading into the paper background. */
export function BottomBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'sticky bottom-0 z-20 mt-auto bg-[linear-gradient(180deg,rgba(244,247,246,0)_0%,var(--color-paper)_22%)] px-4 pt-6',
        className,
      )}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
    >
      {children}
    </div>
  );
}
