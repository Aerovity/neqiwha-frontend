import clsx from 'clsx';
import type { ReactNode } from 'react';

export interface NoticeProps {
  tone?: 'success' | 'cleaned' | 'info' | 'danger';
  icon?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const TONES = {
  success: 'bg-brand-soft text-brand-strong',
  cleaned: 'bg-spot-cleaned-soft text-spot-cleaned-ink',
  info: 'bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)]',
  danger: 'bg-danger-soft text-[#8E0B24]',
};

/** Inline banner, e.g. "You're checked in ✓ — rewards land when the spot is verified." */
export function Notice({ tone = 'info', icon, title, children, className }: NoticeProps) {
  return (
    <div role="status" className={clsx('flex gap-3 rounded-md px-4 py-3.5 text-[15px] leading-snug', TONES[tone], className)}>
      {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0">
        {title && <div className="font-semibold">{title}</div>}
        {children && <div className={clsx(title && 'mt-0.5 opacity-85')}>{children}</div>}
      </div>
    </div>
  );
}
