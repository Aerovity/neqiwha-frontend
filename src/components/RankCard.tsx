import clsx from 'clsx';
import { Lock } from 'lucide-react';
import type { RankLevel } from '../shared/types';
import { RANKS, levelForXp } from '../shared/ranks';
import { formatNumber } from '../lib/format';
import { RankBadge } from './RankBadge';
import { XpBar } from './XpBar';
import { CheckStroke } from './icons';

export interface RankCardProps {
  level: RankLevel;
  /** Viewer XP; null = logged out (no state shown). */
  xp: number | null;
  className?: string;
}

/** One rank on /ranks: badge, name, tagline, XP needed, perks; state done / current ("You are here") / locked. */
export function RankCard({ level, xp, className }: RankCardProps) {
  const rank = RANKS[level];
  const mine = xp == null ? null : levelForXp(xp);
  const state = mine == null ? 'none' : level < mine ? 'done' : level === mine ? 'current' : 'locked';
  const legend = level === 4;

  return (
    <article
      aria-current={state === 'current' ? 'step' : undefined}
      className={clsx(
        'relative overflow-hidden rounded-card p-5',
        legend ? 'bg-[linear-gradient(180deg,#0B3D2E_0%,#04140D_100%)] text-white' : 'bg-surface shadow-card',
        state === 'current' && !legend && 'ring-2 ring-brand',
        state === 'current' && legend && 'ring-2 ring-coin',
      )}
    >
      {legend && (
        <span aria-hidden className="absolute -right-16 -top-16 size-52 rounded-full bg-[radial-gradient(circle,rgba(242,183,5,0.28),rgba(242,183,5,0)_70%)]" />
      )}
      <div className="relative flex gap-4">
        <RankBadge
          level={level}
          size={68}
          className={clsx('transition-[filter,opacity]', state === 'locked' && !legend && 'opacity-55 grayscale')}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={clsx('text-[13px] font-semibold tabular-nums', legend ? 'text-mist' : 'text-muted')}>
              Level {level} · {formatNumber(rank.minXp)} XP
            </span>
            {state === 'current' && (
              <span className={clsx('rounded-pill px-2.5 py-1 text-xs font-bold', legend ? 'bg-coin text-ink' : 'bg-brand text-white')}>
                You are here
              </span>
            )}
            {state === 'done' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                <span className="grid size-4 place-items-center rounded-full bg-success">
                  <CheckStroke size={10} strokeWidth={4} />
                </span>
                Unlocked
              </span>
            )}
            {state === 'locked' && (
              <span className={clsx('inline-flex items-center gap-1 text-xs font-semibold', legend ? 'text-mist' : 'text-muted')}>
                <Lock size={12} strokeWidth={2.5} /> Locked
              </span>
            )}
          </div>
          <h3 className={clsx('mt-1 font-display text-[24px] font-bold leading-tight', legend && 'text-coin')}>{rank.name}</h3>
          <p className={clsx('mt-0.5 text-sm leading-snug', legend ? 'text-mist' : 'text-muted')}>{rank.tagline}</p>
        </div>
      </div>

      <ul className="relative mt-4 flex flex-wrap gap-1.5">
        {rank.perks.map(p => (
          <li
            key={p}
            className={clsx(
              'rounded-pill px-2.5 py-1 text-[12.5px] font-medium',
              legend ? 'bg-white/8 text-white/90 ring-1 ring-white/10' : 'bg-paper text-ink',
            )}
          >
            {p}
          </li>
        ))}
      </ul>

      {state === 'current' && xp != null && !legend && (
        <div className="relative mt-4 border-t border-line-soft pt-4">
          <XpBar xp={xp} compact />
        </div>
      )}
      {state === 'current' && legend && (
        <div className="relative mt-4 h-2 rounded-pill bg-[linear-gradient(90deg,#FFD84A,#F2B705_60%,#E0A800)]" aria-label="Max rank reached" />
      )}
      {state === 'locked' && xp != null && (
        <p className={clsx('relative mt-3 text-[13px] font-medium', legend ? 'text-mist' : 'text-muted')}>
          {formatNumber(rank.minXp - xp)} XP to go
        </p>
      )}
    </article>
  );
}
