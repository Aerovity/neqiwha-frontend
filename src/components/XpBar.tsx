import clsx from 'clsx';
import { motion } from 'motion/react';
import { rankProgress } from '../shared/ranks';
import { formatNumber } from '../lib/format';

export interface XpBarProps {
  xp: number;
  compact?: boolean;
  className?: string;
}

/** "240 / 400 XP to Nqi w 3lih lklam" + green bar; at max rank a full gold bar "Legend — max rank reached". */
export function XpBar({ xp, compact, className }: XpBarProps) {
  const { next, pct } = rankProgress(xp);
  return (
    <div className={clsx('flex w-full flex-col', compact ? 'gap-1.5' : 'gap-2.5', className)}>
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        {!compact && <span className="shrink-0 font-semibold">XP</span>}
        <span className={clsx('min-w-0 truncate', compact ? 'text-left' : 'text-right')}>
          {next ? (
            <>
              <span className={clsx('font-display font-bold tabular-nums', compact ? 'text-[15px]' : 'text-lg')}>
                {formatNumber(xp)} / {formatNumber(next.minXp)} XP
              </span>{' '}
              <span className={clsx('text-muted', compact ? 'text-[13px]' : 'text-sm')}>to {next.name}</span>
            </>
          ) : (
            <span className={clsx('font-display font-bold text-coin-ink', compact ? 'text-[15px]' : 'text-lg')}>
              Legend — max rank reached
            </span>
          )}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct * 100)}
        aria-label={next ? `Progress to ${next.name}` : 'Max rank reached'}
        className={clsx('overflow-hidden rounded-pill bg-xp-track', compact ? 'h-2' : 'h-3.5')}
      >
        <motion.div
          className={clsx('h-full rounded-pill', next ? 'bg-brand' : 'bg-[linear-gradient(90deg,#FFD84A,#F2B705_60%,#E0A800)]')}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(next ? 3 : 100, pct * 100)}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
