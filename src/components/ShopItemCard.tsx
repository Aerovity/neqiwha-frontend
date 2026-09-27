import clsx from 'clsx';
import { Lock } from 'lucide-react';
import type { ShopItem } from '../shared/types';
import { Button } from './Button';
import { CoinIcon } from './icons';
import { ItemArt } from './VoucherTicket';

export interface ShopItemCardProps {
  item: ShopItem;
  /** Viewer balance. */
  coins: number;
  onGet: () => void;
  loading?: boolean;
  className?: string;
}

/** Shop item: item art, partner, title, description, price; "Get it" or disabled "Need X more coins" + progress. */
export function ShopItemCard({ item, coins, onGet, loading, className }: ShopItemCardProps) {
  const missing = Math.max(0, item.cost - coins);
  const canBuy = missing === 0;
  return (
    <article className={clsx('rounded-card bg-surface p-4 shadow-card', className)}>
      <div className="flex gap-4">
        <ItemArt emoji={item.emoji} tone={item.tone} size={88} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{item.partner}</div>
          <h3 className="mt-0.5 font-display text-[22px] font-bold leading-tight">{item.title}</h3>
          <p className="mt-1 line-clamp-2 text-[13.5px] leading-snug text-muted">{item.description}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="inline-flex shrink-0 items-center gap-1.5 font-display text-xl font-bold text-coin-ink tabular-nums">
          <CoinIcon size={24} />
          {item.cost}
        </span>
        {canBuy ? (
          <Button className="ml-auto min-w-[132px]" onClick={onGet} loading={loading}>
            Get it
          </Button>
        ) : (
          <div className="ml-auto flex min-w-0 flex-col items-end gap-1.5">
            <Button variant="secondary" size="sm" disabled icon={<Lock size={14} />}>
              Need {missing} more coins
            </Button>
            <span className="h-1.5 w-32 overflow-hidden rounded-pill bg-xp-track" aria-hidden>
              <span className="block h-full rounded-pill bg-coin" style={{ width: `${(coins / item.cost) * 100}%` }} />
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
