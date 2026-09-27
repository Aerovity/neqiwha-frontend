import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Logo } from '../../components';

/** Centered auth/onboarding column with logo home link. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper px-5 pb-8 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <Link to="/" aria-label="Back to map" className="mb-8 inline-flex w-fit rounded-pill transition-transform active:scale-[.97]">
        <Logo size={40} />
      </Link>
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">{children}</div>
    </div>
  );
}
