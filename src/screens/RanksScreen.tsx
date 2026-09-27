import { Link } from 'react-router';
import { MAX_LEVEL, RANKS } from '../shared/ranks';
import { RankCard, ScreenHeader } from '../components';
import { useMe } from '../lib/queries';

export function RanksScreen() {
  const me = useMe();
  const xp = me.data?.xp ?? null;

  return (
    <div className="min-h-dvh bg-paper pb-8">
      <ScreenHeader title="All ranks" back />
      <div className="flex flex-col gap-4 px-4 pt-2">
        {RANKS.map(r => (
          <RankCard key={r.level} level={r.level} xp={xp} />
        ))}
        <footer className="rounded-card bg-surface px-4 py-4 text-center text-[13px] leading-relaxed text-muted shadow-card">
          <span className="font-semibold text-ink">+100 XP and +100 coins</span> per verified cleanup · organizers get{' '}
          <span className="font-semibold text-ink">+50 / +50</span>
          {xp == null && (
            <>
              {' '}
              ·{' '}
              <Link to="/login" className="font-semibold text-brand underline-offset-2 hover:underline">
                Log in
              </Link>{' '}
              to see your progress
            </>
          )}
        </footer>
        {xp != null && (
          <p className="text-center text-xs text-muted">
            Legend rank ({RANKS[MAX_LEVEL].name}) unlocks at {RANKS[MAX_LEVEL].minXp.toLocaleString()} XP.
          </p>
        )}
      </div>
    </div>
  );
}
