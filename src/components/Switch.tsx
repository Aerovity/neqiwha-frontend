import clsx from 'clsx';
import { useId, type ReactNode } from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/** Full-width on/off row (whole card is the tap target). */
export function Switch({ checked, onChange, label, description, icon, className }: SwitchProps) {
  const id = useId();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onClick={() => onChange(!checked)}
      className={clsx(
        'flex min-h-11 w-full items-center gap-3 rounded-card bg-surface p-4 text-left shadow-card transition-transform active:scale-[.99]',
        className,
      )}
    >
      {icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">{icon}</span>
      )}
      <span className="min-w-0 flex-1">
        <span id={`${id}-label`} className="block font-semibold">
          {label}
        </span>
        {description && (
          <span id={`${id}-desc`} className="mt-0.5 block text-[13px] leading-snug text-muted">
            {description}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span aria-hidden className={clsx('text-xs font-bold uppercase', checked ? 'text-brand' : 'text-muted')}>
          {checked ? 'Yes' : 'No'}
        </span>
        <span
          aria-hidden
          className={clsx(
            'relative h-7 w-12 rounded-pill transition-colors duration-200',
            checked ? 'bg-brand' : 'bg-line',
          )}
        >
          <span
            className={clsx(
              'absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow-float transition-transform duration-200 ease-out motion-reduce:transition-none',
              checked && 'translate-x-5',
            )}
          />
        </span>
      </span>
    </button>
  );
}
