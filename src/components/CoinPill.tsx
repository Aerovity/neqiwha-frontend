import clsx from 'clsx';
import { CoinIcon } from './icons';
import { CountUp, useBumpOnIncrease } from './CountUp';

export interface CoinPillProps {
  coins: number;
  size?: 'sm' | 'md';
  className?: string;
}

/** Coin balance: gold coin + tabular Changa number; counts up (900 ms) and the coin bounces when it grows. */
export function CoinPill({ coins, size = 'md', className }: CoinPillProps) {
  const bump = useBumpOnIncrease(coins);
  const sm = size === 'sm';
  return (
    <span
      aria-label={`${coins} coins`}
      className={clsx(
        'inline-flex shrink-0 items-center rounded-pill bg-surface font-display font-bold text-ink tabular-nums shadow-[0_0_0_1px_rgba(4,20,13,0.06),0_4px_12px_rgba(4,20,13,0.1)]',
        sm ? 'h-8 gap-1 pl-1 pr-2.5 text-[15px]' : 'h-10 gap-1.5 pl-1.5 pr-3.5 text-lg',
        className,
      )}
    >
      <CoinIcon
        size={sm ? 22 : 26}
        className={clsx('transition-transform duration-300 ease-back-out', bump && 'rotate-[-12deg] scale-125')}
      />
      <CountUp value={coins} className="leading-none" />
    </span>
  );
}
