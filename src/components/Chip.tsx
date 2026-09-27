import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  icon?: ReactNode;
}

/** Selectable pill (meeting-time presets, filters). */
export function Chip({ selected, icon, className, children, type = 'button', ...rest }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={clsx(
        'inline-flex h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-4 text-sm font-semibold transition-[transform,background-color,color,box-shadow] duration-150 active:scale-[.96] disabled:opacity-50',
        selected
          ? 'bg-brand text-white shadow-brand'
          : 'bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-paper',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
