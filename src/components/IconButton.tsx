import clsx from 'clsx';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name. */
  label: string;
  /** surface = white floating over maps; blur = translucent dark over photos; ghost = flat; dark = ink. */
  variant?: 'surface' | 'blur' | 'ghost' | 'dark';
  size?: number;
  children: ReactNode;
}

const VARIANTS = {
  surface: 'bg-surface text-ink shadow-float hover:bg-paper',
  blur: 'bg-night/40 text-white backdrop-blur-md hover:bg-night/55 shadow-[0_2px_10px_rgba(0,0,0,0.15)]',
  ghost: 'bg-transparent text-ink hover:bg-ink/6',
  dark: 'bg-ink text-white hover:bg-night shadow-float',
};

/** Round 44 px icon button. */
export function IconButton({ label, variant = 'surface', size = 44, className, children, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={clsx(
        'grid shrink-0 place-items-center rounded-full transition-[transform,background-color] duration-150 active:scale-[.92] disabled:opacity-50',
        VARIANTS[variant],
        className,
      )}
      style={{ width: size, height: size }}
      {...rest}
    >
      {children}
    </button>
  );
}
