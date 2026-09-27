import clsx from 'clsx';
import type { LeaderboardEntry } from '../shared/types';
import { RANKS } from '../shared/ranks';
import { formatNumber } from '../lib/format';
import { Avatar } from './Avatar';
import { UserName } from './UserName';

export interface LeaderRowProps {
  entry: LeaderboardEntry;
  /** The viewer's own row. */
  highlight?: boolean;
  className?: string;
}

/** Leaderboard row: position, framed avatar, decorated name + rank, XP. */
export function LeaderRow({ entry, highlight, className }: LeaderRowProps) {
  const { position, user } = entry;
  return (
    <div
      className={clsx(
        'flex items-center gap-3 rounded-card py-2.5 pl-3 pr-4',
        highlight ? 'bg-brand-soft ring-1 ring-brand/25' : 'bg-surface',
        className,
      )}
      aria-current={highlight || undefined}
    >
      <span className="w-7 shrink-0 text-center font-display text-lg font-bold text-muted tabular-nums">{position}</span>
      <Avatar initials={user.initials} level={user.level} seed={user.id} size={40} className="mx-2.5 my-1.5" />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <UserName name={user.displayName} level={user.level} className="text-[15px]" />
          {highlight && <span className="shrink-0 rounded-pill bg-brand px-2 py-0.5 text-[11px] font-bold text-white">You</span>}
        </div>
        <div className="truncate text-[12.5px] text-muted">{RANKS[user.level].name}</div>
      </div>
      <div className="shrink-0 text-right leading-none">
        <span className="font-display text-lg font-bold tabular-nums">{formatNumber(user.xp)}</span>
        <span className="ml-1 text-xs font-semibold text-muted">XP</span>
      </div>
    </div>
  );
}
