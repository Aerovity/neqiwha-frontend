import type { SVGProps } from 'react';

type IconProps = { size?: number } & Omit<SVGProps<SVGSVGElement>, 'width' | 'height'>;

/** Gold coin with the check-stroke emboss (brand board 07). */
export function CoinIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden {...rest}>
      <circle cx="12" cy="12" r="10.5" fill="#F2B705" />
      <circle cx="12" cy="12" r="7.8" fill="none" stroke="#C08A00" strokeWidth="1.3" />
      <path
        d="M-13 -3 L-3 7 L14 -12"
        fill="none"
        stroke="#8A6100"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(12 12.4) scale(.27)"
      />
    </svg>
  );
}

/** XP: double chevron in xp green. */
export function XpIcon({ size = 20, color = '#2E9E4F', ...rest }: IconProps & { color?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <path d="M6 13 L12 7 L18 13" />
      <path d="M6 19 L12 13 L18 19" />
    </svg>
  );
}

/** The sprout from the mark, with the check vein cut out. Needs BrandSprite (mask `nq-m-check`). */
export function SproutIcon({ size = 20, color = '#006233', ...rest }: IconProps & { color?: string }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden {...rest}>
      <g fill={color} transform="translate(50 52) scale(1.05) translate(-50.5 -53.5)">
        <use href="#nq-sprout" />
      </g>
    </svg>
  );
}

/** The brand check stroke (markers, chips, success ticks). */
export function CheckStroke({ size = 14, color = '#fff', strokeWidth = 3.5, ...rest }: IconProps & { color?: string; strokeWidth?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...rest}
    >
      <polyline points="4 12.5 9.5 18 20 6.5" />
    </svg>
  );
}
