import clsx from 'clsx';

export interface LogoProps {
  /** Mark height in px; the wordmark scales with it. */
  size?: number;
  variant?: 'light' | 'dark';
  wordmark?: boolean;
  className?: string;
}

/** The disc mark + Changa Bold "Naqıwha" wordmark with the sunlit i-dot. `dark` = for deep/night backgrounds. */
export function Logo({ size = 40, variant = 'light', wordmark = true, className }: LogoProps) {
  const flat = size <= 20;
  return (
    <span
      role="img"
      aria-label="Naqiwha"
      className={clsx('inline-flex shrink-0 items-center', className)}
      style={{ gap: Math.round(size * 0.22) }}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="shrink-0">
        <use href={flat ? '#nq-fav' : '#nq-mark'} />
      </svg>
      {wordmark && <Wordmark size={size * 0.93} variant={variant} />}
    </span>
  );
}

export function Wordmark({ size = 32, variant = 'light' }: { size?: number; variant?: 'light' | 'dark' }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'whitespace-nowrap font-display font-bold leading-none tracking-[-0.015em]',
        variant === 'dark' ? 'text-white' : 'text-ink',
      )}
      style={{ fontSize: size }}
    >
      Naq
      <span className="relative inline-block">
        ı
        <span
          className="absolute left-1/2 top-[0.13em] size-[0.15em] -translate-x-1/2 rounded-full"
          style={{ background: variant === 'dark' ? '#9BDB4E' : '#2E9E4F' }}
        />
      </span>
      wha
    </span>
  );
}
