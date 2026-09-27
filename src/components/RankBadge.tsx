import clsx from 'clsx';
import type { RankLevel } from '../shared/types';
import { RANKS } from '../shared/ranks';

export interface RankBadgeProps {
  level: RankLevel;
  /** px, or any CSS length (e.g. '1.1em'). */
  size?: number | string;
  className?: string;
  /** Decorative badges (next to a visible rank name) should pass `decorative`. */
  decorative?: boolean;
}

/** Rank insignia nq-b0..b4: circle → check → hexagon → shield → gold seal. */
export function RankBadge({ level, size = 28, className, decorative }: RankBadgeProps) {
  return (
    <svg
      viewBox="-4 -4 108 108"
      width={size}
      height={size}
      className={clsx('shrink-0', className)}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : RANKS[level].name}
    >
      <use href={`#nq-b${level}`} />
    </svg>
  );
}
