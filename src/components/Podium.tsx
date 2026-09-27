import clsx from 'clsx';
import { motion, useReducedMotion } from 'motion/react';
import type { LeaderboardEntry } from '../shared/types';
import { formatNumber } from '../lib/format';
import { Avatar } from './Avatar';
import { UserName } from './UserName';

export interface PodiumProps {
  top3: LeaderboardEntry[];
  className?: string;
}

const HEIGHT = { 1: 104, 2: 76, 3: 56 } as Record<number, number>;

/** Top-3 podium (2 · 1 · 3): big framed avatars, crown on #1, pedestals rising in. */
export function Podium({ top3, className }: PodiumProps) {
  const reduce = useReducedMotion();
  const byPos = (p: number) => top3.find(e => e.position === p) ?? top3[p - 1];
  const order = [2, 1, 3].map(byPos);

  return (
    <div className={clsx('grid grid-cols-3 items-end gap-2 px-1 pt-10', className)}>
      {order.map((e, i) => {
        if (!e) return <div key={i} />;
        const pos = e.position;
        const first = pos === 1;
        const size = first ? 76 : 58;
        return (
          <div key={e.user.id} className="flex min-w-0 flex-col items-center">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: first ? 0.25 : 0.1 + i * 0.1 }}
              className="flex w-full min-w-0 flex-col items-center"
            >
              <Avatar
                initials={e.user.initials}
                level={e.user.level}
                seed={e.user.id}
                size={size}
                crown={first}
                label={e.user.displayName}
              />
              <UserName
                name={e.user.displayName}
                level={e.user.level}
                noBadge
                className={clsx('mt-5 justify-center', first ? 'text-[15px]' : 'text-sm')}
              />
              <span className="mt-0.5 text-[13px] font-semibold text-muted tabular-nums">{formatNumber(e.user.xp)} XP</span>
            </motion.div>
            <motion.div
              initial={reduce ? false : { height: 0 }}
              animate={{ height: HEIGHT[pos] ?? 48 }}
              transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.05 * i }}
              className={clsx(
                'mt-3 grid w-full place-items-start justify-center overflow-hidden rounded-t-[18px] pt-2.5',
                first
                  ? 'bg-[linear-gradient(180deg,#17744C,#0B3D2E)] shadow-[inset_0_2px_0_rgba(255,255,255,0.15)]'
                  : 'bg-[linear-gradient(180deg,#2E9E4F,#006233)] shadow-[inset_0_2px_0_rgba(255,255,255,0.15)]',
              )}
            >
              <span className={clsx('font-display font-extrabold leading-none tabular-nums', first ? 'text-[34px] text-coin' : 'text-[26px] text-white')}>
                {pos}
              </span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
