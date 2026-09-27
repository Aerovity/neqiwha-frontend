import clsx from 'clsx';
import type { ReactNode } from 'react';
import { SproutIcon } from './icons';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/** Friendly empty / error state: icon in a soft disc, Changa title, muted body, optional action. */
export function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div className={clsx('flex flex-col items-center gap-3 px-6 py-10 text-center', className)}>
      <div className="relative mb-1 grid size-20 place-items-center rounded-full bg-brand-soft text-brand">
        <span aria-hidden className="absolute -inset-2 rounded-full border border-dashed border-brand/25" />
        {icon ?? <SproutIcon size={40} />}
      </div>
      <h3 className="font-display text-[22px] font-bold leading-tight text-balance">{title}</h3>
      {body && <p className="max-w-xs text-[15px] leading-relaxed text-muted text-pretty">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
