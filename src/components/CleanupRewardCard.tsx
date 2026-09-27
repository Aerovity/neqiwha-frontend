import clsx from 'clsx';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Button } from './Button';
import { CheckStroke, CoinIcon, XpIcon } from './icons';
import { CountUp } from './CountUp';

export interface CleanupRewardCardProps {
  title: string | null;
  xp: number;
  coins: number;
  onNext: () => void;
  nextLabel?: string;
  ctaExtra?: ReactNode;
  className?: string;
}

/** "Cleanup verified!" card with +XP / +coins counting up. Works on light screens and inside CelebrationOverlay. */
export function CleanupRewardCard({ title, xp, coins, onNext, nextLabel = 'Yallah!', ctaExtra, className }: CleanupRewardCardProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className={clsx('mt-10 w-full max-w-sm rounded-[28px] bg-surface p-6 text-center text-ink shadow-lift', className)}
    >
      <div className="mx-auto -mt-14 mb-3 grid size-20 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_22%,#9BDB4E_0%,#2FA54C_38%,#006233_100%)] shadow-[0_0_0_6px_var(--color-surface),0_14px_30px_-10px_rgba(0,98,51,0.7)]">
        <CheckStroke size={40} strokeWidth={3} />
      </div>
      <h2 className="font-display text-[28px] font-bold leading-tight">Cleanup verified!</h2>
      <p className="mt-1 line-clamp-2 text-[15px] text-muted">{title ?? 'Your cleanup'}</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-card bg-brand-soft px-3 py-4">
          <XpIcon size={26} />
          <span className="font-display text-[32px] font-bold leading-none text-brand-strong tabular-nums">
            +<CountUp value={xp} from={0} />
          </span>
          <span className="text-[13px] font-semibold text-brand-strong/80">XP</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-card bg-coin-soft px-3 py-4">
          <CoinIcon size={26} />
          <span className="font-display text-[32px] font-bold leading-none text-coin-deep tabular-nums">
            +<CountUp value={coins} from={0} />
          </span>
          <span className="text-[13px] font-semibold text-coin-deep/80">coins</span>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Button size="lg" full onClick={onNext}>
          {nextLabel}
        </Button>
        {ctaExtra}
      </div>
    </motion.div>
  );
}
