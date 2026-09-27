import clsx from 'clsx';
import { useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { animate, useReducedMotion } from 'motion/react';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Called once all 6 digits are filled. */
  onComplete?: (value: string) => void;
  disabled?: boolean;
  /** true or a message; a new message (or false → true) shakes the boxes. */
  error?: string | boolean | null;
  autoFocus?: boolean;
  length?: number;
}

/** 6-box one-time-code input: numeric keypad, SMS/email autofill, paste, backspace/arrow navigation. */
export function OtpInput({ value, onChange, onComplete, disabled, error, autoFocus = true, length = 6 }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const row = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const digits = value.replace(/\D/g, '').slice(0, length);

  useEffect(() => {
    if (autoFocus) refs.current[Math.min(digits.length, length - 1)]?.focus();
  }, []);

  useEffect(() => {
    if (!error || !row.current) return;
    if (!reduce) animate(row.current, { x: [0, -10, 10, -7, 7, -3, 0] }, { duration: 0.42 });
    refs.current[length - 1]?.focus();
  }, [error, reduce, length]);

  const commit = (next: string, focusIndex: number) => {
    const clean = next.replace(/\D/g, '').slice(0, length);
    onChange(clean);
    refs.current[Math.min(focusIndex, length - 1)]?.focus();
    if (clean.length === length && clean !== digits) onComplete?.(clean);
  };

  const onInput = (i: number, raw: string) => {
    const typed = raw.replace(/\D/g, '');
    if (!typed) return;
    // Autofill/paste lands the whole code in one box.
    if (typed.length > 1) return commit(digits.slice(0, i) + typed, i + typed.length);
    const arr = digits.padEnd(length, ' ').split('');
    arr[i] = typed.slice(-1);
    commit(arr.join('').replace(/ /g, ''), i + 1);
  };

  const onKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      if (digits[i]) commit(digits.slice(0, i) + digits.slice(i + 1), i);
      else if (i > 0) commit(digits.slice(0, i - 1) + digits.slice(i), i - 1);
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault();
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (i: number, e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '');
    if (!text) return;
    e.preventDefault();
    commit(text.length >= length ? text : digits.slice(0, i) + text, Math.min(length - 1, i + text.length));
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div ref={row} className="flex w-full max-w-[360px] justify-center gap-2" role="group" aria-label="6-digit code">
        {Array.from({ length }, (_, i) => {
          const filled = !!digits[i];
          return (
            <input
              key={i}
              ref={el => {
                refs.current[i] = el;
              }}
              value={digits[i] ?? ''}
              onChange={e => onInput(i, e.target.value)}
              onKeyDown={e => onKeyDown(i, e)}
              onPaste={e => onPaste(i, e)}
              onFocus={e => e.target.select()}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              aria-label={`Digit ${i + 1} of ${length}`}
              aria-invalid={!!error || undefined}
              disabled={disabled}
              className={clsx(
                'h-14 w-0 min-w-0 max-w-[52px] flex-1 rounded-md border-[1.5px] bg-surface text-center font-display text-[26px] font-bold text-ink caret-brand tabular-nums outline-none transition-[border-color,box-shadow,transform] duration-150',
                'focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-60',
                error ? 'border-danger bg-danger-soft/50' : filled ? 'border-ink/70' : 'border-line',
                filled && !error && 'animate-pop-in',
              )}
            />
          );
        })}
      </div>
      {typeof error === 'string' && error && (
        <p role="alert" className="text-center text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
