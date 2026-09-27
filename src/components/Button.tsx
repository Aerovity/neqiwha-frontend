import clsx from 'clsx';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { LoaderCircle } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'dark' | 'light';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  className?: string;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-brand hover:bg-brand-strong active:bg-brand-strong',
  secondary: 'bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-line)] hover:bg-paper active:bg-line-soft',
  ghost: 'bg-transparent text-brand hover:bg-brand-soft active:bg-brand-soft',
  danger: 'bg-danger text-white shadow-[0_8px_20px_-8px_rgba(210,16,52,0.6)] hover:bg-[#B20D2B]',
  gold: 'bg-coin text-ink shadow-[0_8px_20px_-8px_rgba(192,138,0,0.8)] hover:bg-[#E5AD00]',
  dark: 'bg-ink text-white hover:bg-night',
  light: 'bg-white text-deep shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] hover:bg-[#EEF7F0]',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-11 gap-1.5 px-4 text-sm',
  md: 'h-12 gap-2 px-5 text-base',
  lg: 'h-14 gap-2.5 px-6 text-[17px]',
};

/** Shared class string so links/anchors can look like buttons: `<a className={buttonClass({ variant: 'secondary' })}>`. */
export function buttonClass({ variant = 'primary', size = 'md', full, className }: StyleProps = {}) {
  return clsx(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-pill font-semibold',
    'transition-[transform,background-color,box-shadow,opacity] duration-150 active:scale-[.97]',
    'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-brand',
    VARIANTS[variant],
    SIZES[size],
    full && 'w-full',
    className,
  );
}

const iconSize = (size: ButtonSize) => (size === 'sm' ? 16 : size === 'lg' ? 22 : 20);

export type ButtonProps = StyleProps & {
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
} & ComponentPropsWithRef<'button'>;

/** Pill button, 44/48/56 px. `loading` shows a spinner and disables it. */
export function Button({
  variant,
  size = 'md',
  full,
  className,
  loading,
  icon,
  iconRight,
  disabled,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, full, className })}
      {...rest}
    >
      {loading ? <LoaderCircle size={iconSize(size)} className="animate-spin" aria-hidden /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  );
}

export type ButtonLinkProps = StyleProps & { icon?: ReactNode; iconRight?: ReactNode } & LinkProps;

/** react-router Link styled as a Button. */
export function ButtonLink({ variant, size, full, className, icon, iconRight, children, ...rest }: ButtonLinkProps) {
  return (
    <Link className={buttonClass({ variant, size, full, className })} {...rest}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
