import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router';
import { CelebrationOverlay } from './CelebrationOverlay';
import { CleanupRewardCard } from './CleanupRewardCard';
import { LevelUpReveal } from './LevelUpReveal';
import { ButtonLink } from './Button';
import { useMe, useRewardsSeen } from '../lib/queries';
import type { RewardEntry } from '../shared/types';

/** Global overlay: queues unseen cleanup + level-up rewards (not on the finish screen). */
export function RewardCelebration() {
  const me = useMe();
  const markSeen = useRewardsSeen();
  const location = useLocation();
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const posted = useRef(false);

  const onFinishRoute = /^\/spots\/[^/]+\/finish\/?$/.test(location.pathname);
  const queue = useMemo(() => buildQueue(me.data?.unseenRewards ?? []), [me.data?.unseenRewards]);

  useEffect(() => {
    if (onFinishRoute || !queue.length) {
      setOpen(false);
      setIndex(0);
      posted.current = false;
      return;
    }
    setOpen(true);
    setIndex(0);
    posted.current = false;
  }, [onFinishRoute, queue]);

  const finish = (q: RewardEntry[]) => {
    if (posted.current || !q.length) return;
    posted.current = true;
    markSeen.mutate(q.map(r => r.id));
    setOpen(false);
  };

  const current = open ? queue[index] : null;
  const isLast = index >= queue.length - 1;
  const shopCta =
    isLast && (me.data?.coins ?? 0) >= 100 ? (
      <ButtonLink to="/shop" variant="secondary" size="lg" full onClick={() => finish(queue)}>
        Spend your coins 🎁
      </ButtonLink>
    ) : undefined;

  const advance = () => {
    if (!isLast) {
      setIndex(i => i + 1);
      return;
    }
    finish(queue);
  };

  if (!current) return null;

  return (
    <AnimatePresence>
      {current.kind === 'cleanup' && (
        <CelebrationOverlay key={current.id} onClose={() => finish(queue)}>
          <CleanupRewardCard
            title={current.eventTitle}
            xp={current.xpDelta}
            coins={current.coinsDelta}
            onNext={advance}
            nextLabel={isLast ? 'Yallah!' : 'Next'}
            ctaExtra={shopCta}
          />
        </CelebrationOverlay>
      )}
      {current.kind === 'level_up' && current.levelAfter != null && (
        <LevelUpReveal
          key={current.id}
          level={current.levelAfter}
          gift={current.coinsDelta}
          onDone={advance}
          doneLabel={isLast ? 'Yallah!' : 'Next'}
          ctaExtra={shopCta}
        />
      )}
    </AnimatePresence>
  );
}

function buildQueue(rows: RewardEntry[]): RewardEntry[] {
  const cleanups = rows.filter(r => r.kind === 'cleanup').sort(byTime);
  const levels = rows.filter(r => r.kind === 'level_up').sort(byTime);
  return [...cleanups, ...levels];
}

const byTime = (a: RewardEntry, b: RewardEntry) =>
  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
