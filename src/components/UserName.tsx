import clsx from 'clsx';
import type { RankLevel } from '../shared/types';
import { RankBadge } from './RankBadge';

export interface UserNameProps {
  name: string;
  level: RankLevel;
  className?: string;
  /** `dark` for deep/night backgrounds (QR ticket, level-up). */
  tone?: 'light' | 'dark';
  /** Hide the rank badge (e.g. when a RankBadge is already shown next to it). */
  noBadge?: boolean;
}

const LIGHT = [
  'font-medium text-ink',
  'font-medium text-ink',
  'font-semibold text-ink',
  'font-bold text-brand',
  'font-bold bg-[linear-gradient(90deg,#006233_0%,#0E7A3E_45%,#8F6500_100%)] bg-clip-text text-transparent',
];
const DARK = [
  'font-medium text-white',
  'font-medium text-white',
  'font-semibold text-white',
  'font-bold text-sprout',
  'font-bold bg-[linear-gradient(90deg,#9BDB4E_0%,#CFE8A0_40%,#FFD84A_100%)] bg-clip-text text-transparent',
];

/** Display name with rank decoration: L1–L2 badge, L3 green + shield, L4 green→gold gradient + seal. Truncates. */
export function UserName({ name, level, className, tone = 'light', noBadge }: UserNameProps) {
  return (
    <span className={clsx('inline-flex min-w-0 max-w-full items-center gap-[0.35em]', className)}>
      <span className={clsx('min-w-0 truncate', (tone === 'dark' ? DARK : LIGHT)[level])}>{name}</span>
      {level > 0 && !noBadge && <RankBadge level={level} size="1.1em" decorative />}
    </span>
  );
}
