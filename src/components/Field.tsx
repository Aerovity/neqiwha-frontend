import clsx from 'clsx';
import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';

interface BaseProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  /** Shows a "12/60" counter when `maxLength` is set (controlled `value` required). */
  counter?: boolean;
  className?: string;
}

export type FieldProps =
  | (BaseProps & { multiline?: false } & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>)
  | (BaseProps & { multiline: true } & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>);

const control =
  'w-full rounded-md border-[1.5px] bg-surface px-4 text-base text-ink placeholder:text-muted/60 outline-none transition-[border-color,box-shadow] duration-150 focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-60';

/** Label + 52 px input (or textarea) with counter, hint and error. */
export function Field(props: FieldProps) {
  const { label, hint, error, counter = true, className, multiline, ...rest } = props;
  const id = useId();
  const id2 = rest.id ?? id;
  const msgId = `${id2}-msg`;
  const len = typeof rest.value === 'string' ? rest.value.length : null;
  const max = rest.maxLength;
  const cls = clsx(control, error ? 'border-danger focus:border-danger focus:ring-danger/15' : 'border-line');
  const described = error || hint ? msgId : undefined;

  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3 px-1">
        <label htmlFor={id2} className="text-sm font-semibold text-ink">
          {label}
        </label>
        {counter && max != null && len != null && (
          <span className={clsx('text-xs font-medium tabular-nums', len > max * 0.9 ? 'text-coin-ink' : 'text-muted')}>
            {len}/{max}
          </span>
        )}
      </div>
      {multiline ? (
        <textarea
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          id={id2}
          aria-invalid={!!error || undefined}
          aria-describedby={described}
          rows={(rest as TextareaHTMLAttributes<HTMLTextAreaElement>).rows ?? 4}
          className={clsx(cls, 'min-h-[104px] resize-none py-3.5 leading-relaxed')}
        />
      ) : (
        <input
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
          id={id2}
          aria-invalid={!!error || undefined}
          aria-describedby={described}
          className={clsx(cls, 'h-[52px]')}
        />
      )}
      {(error || hint) && (
        <p id={msgId} className={clsx('px-1 text-[13px] leading-snug', error ? 'font-medium text-danger' : 'text-muted')}>
          {error || hint}
        </p>
      )}
    </div>
  );
}
