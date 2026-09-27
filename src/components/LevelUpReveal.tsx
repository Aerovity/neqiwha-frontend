import { useEffect, useRef, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import type { RankLevel } from '../shared/types';
import { RANKS } from '../shared/ranks';
import { CelebrationOverlay } from './CelebrationOverlay';
import { RankBadge } from './RankBadge';
import { Button } from './Button';
import { CheckStroke, CoinIcon } from './icons';
import { CountUp } from './CountUp';
import { leafConfetti } from './confetti';

export interface LevelUpRevealProps {
  level: RankLevel;
  gift: number;
  onDone: () => void;
  /** Extra actions under "Yallah!" (e.g. "Get your sticker 🎁"). */
  ctaExtra?: ReactNode;
  doneLabel?: string;
}

/** Full-screen "Mabrouk! You're now {rank}" with a spring badge (2.4 s), perks, coin gift and leaf confetti. */
export function LevelUpReveal({ level, gift, onDone, ctaExtra, doneLabel = 'Yallah!' }: LevelUpRevealProps) {
  const rank = RANKS[level];
  const reduce = useReducedMotion();
  const btn = useRef<HTMLButtonElement>(null);
  const legend = level === 4;

  useEffect(() => {
    const t = setTimeout(() => leafConfetti({ y: 0.35 }), 450);
    const f = setTimeout(() => btn.current?.focus({ preventScroll: true }), 600);
    return () => {
      clearTimeout(t);
      clearTimeout(f);
    };
  }, []);

  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.45, ease: 'easeOut' as const } };

  return (
    <CelebrationOverlay onClose={onDone} gold={legend}>
      <div className="flex w-full max-w-sm flex-col items-center text-center" aria-labelledby="nq-levelup-title">
        <motion.h2 id="nq-levelup-title" className="font-display text-display-xl tracking-[-0.01em]" {...rise(0.1)}>
          Mabrouk!
        </motion.h2>

        <div className="relative my-5 grid size-[148px] place-items-center">
          <span
            aria-hidden
            className="absolute -inset-14 animate-spin-slow rounded-full opacity-60 [mask:radial-gradient(circle,#000_30%,transparent_68%)]"
            style={{
              background: `repeating-conic-gradient(from 0deg, ${legend ? 'rgba(255,216,74,0.35)' : 'rgba(155,219,78,0.28)'} 0deg 9deg, transparent 9deg 24deg)`,
            }}
          />
          <motion.div
            initial={reduce ? false : { scale: 0, rotate: -35 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 2.4, bounce: 0.45, delay: 0.2 }}
            className="relative drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
          >
            <RankBadge level={level} size={140} />
          </motion.div>
        </div>

        <motion.div {...rise(0.55)}>
          <div className="text-[15px] font-medium text-mist">You're now</div>
          <div className={`mt-1 font-display text-[34px] font-bold leading-[1.05] text-balance ${legend ? 'text-coin' : 'text-white'}`}>
            {rank.name}
          </div>
          <p className="mt-2 text-[15px] leading-snug text-mist">{rank.tagline}</p>
        </motion.div>

        {rank.perks.length > 0 && (
          <motion.ul className="mt-5 flex w-full flex-col gap-2 rounded-card bg-white/6 px-4 py-3.5 text-left ring-1 ring-white/10" {...rise(0.8)}>
            {rank.perks.map(p => (
              <li key={p} className="flex items-center gap-3 text-[15px]">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sprout/20">
                  <CheckStroke size={13} color="#9BDB4E" strokeWidth={3.5} />
                </span>
                {p}
              </li>
            ))}
          </motion.ul>
        )}

        {gift > 0 && (
          <motion.div className="mt-5 inline-flex items-center gap-2.5 font-display text-[32px] font-bold leading-none text-coin tabular-nums" {...rise(1.05)}>
            <CoinIcon size={34} />
            <span>
              +<CountUp value={gift} from={0} /> coins
            </span>
          </motion.div>
        )}

        <motion.div className="mt-6 flex w-full flex-col gap-2" {...rise(1.25)}>
          <Button ref={btn} variant="light" size="lg" full onClick={onDone}>
            {doneLabel}
          </Button>
          {ctaExtra}
        </motion.div>
      </div>
    </CelebrationOverlay>
  );
}
