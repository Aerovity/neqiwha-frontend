import clsx from 'clsx';
import { Sticker } from 'lucide-react';
import type { HistoryEntry } from '../shared/types';
import { RANKS } from '../shared/ranks';
import { formatNumber, formatRelative } from '../lib/format';
import { RankBadge } from './RankBadge';
import { SproutIcon } from './icons';

export interface HistoryRowProps {
  entry: HistoryEntry;
  className?: string;
}

const signed = (n: number) => `${n < 0 ? '−' : '+'}${formatNumber(Math.abs(n))}`;

/** Ledger line: cleanup (+XP · +coins — title), level up (→ rank · +gift), purchase (−coins — voucher). */
export function HistoryRow({ entry, className }: HistoryRowProps) {
  const { kind, xpDelta, coinsDelta } = entry;
  const rankName = entry.levelAfter != null ? RANKS[entry.levelAfter].name : null;
  const label =
    kind === 'cleanup'
      ? entry.eventTitle ?? 'Cleanup'
      : kind === 'level_up'
        ? `Level up → ${rankName ?? 'new rank'}`
        : entry.voucherTitle ?? 'Shop purchase';

  return (
    <div className={clsx('flex items-center gap-3.5 py-3', className)}>
      <span
        className={clsx(
          'grid size-11 shrink-0 place-items-center rounded-full',
          kind === 'cleanup' && 'bg-brand-soft',
          kind === 'level_up' && 'bg-deep',
          kind === 'purchase' && 'bg-coin-soft text-coin-deep',
        )}
        aria-hidden
      >
        {kind === 'cleanup' && <SproutIcon size={24} />}
        {kind === 'level_up' && entry.levelAfter != null && <RankBadge level={entry.levelAfter} size={30} decorative />}
        {kind === 'purchase' && <Sticker size={20} strokeWidth={2.2} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 font-display text-[17px] font-bold leading-tight tabular-nums">
          {xpDelta !== 0 && <span className="text-success">{signed(xpDelta)} XP</span>}
          {xpDelta !== 0 && coinsDelta !== 0 && <span className="text-line">·</span>}
          {coinsDelta !== 0 && (
            <span className={coinsDelta > 0 ? 'text-coin-ink' : 'text-ink'}>{signed(coinsDelta)} coins</span>
          )}
        </div>
        <div className="mt-0.5 truncate text-sm text-muted">{label}</div>
      </div>
      <span className="shrink-0 self-start pt-0.5 text-xs text-muted">{formatRelative(entry.createdAt)}</span>
    </div>
  );
}
