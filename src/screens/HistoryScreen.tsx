import { useMemo } from 'react';
import { History } from 'lucide-react';
import { EmptyState, HistoryRow, ScreenHeader, Skeleton } from '../components';
import { useHistory } from '../lib/queries';
import { groupByDay } from './parts/groupByDay';

export function HistoryScreen() {
  const history = useHistory();

  const groups = useMemo(() => {
    if (!history.data) return [];
    const sorted = [...history.data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    return groupByDay(sorted);
  }, [history.data]);

  return (
    <div className="min-h-dvh bg-paper">
      <ScreenHeader back="/profile" title="History" />

      <div className="px-4 pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        {history.isPending && (
          <div className="rounded-card bg-surface px-4 shadow-card">
            {[0, 1, 2, 3].map(i => (
              <Skeleton key={i} shape="line" className="my-4 h-12!" />
            ))}
          </div>
        )}
        {history.isError && (
          <p className="rounded-card bg-surface p-6 text-center text-[15px] text-muted shadow-card">
            Couldn&apos;t load your history. Try again in a moment.
          </p>
        )}
        {history.isSuccess && groups.length === 0 && (
          <EmptyState
            icon={<History size={34} />}
            title="No history yet"
            body="Join a cleanup or grab a sticker — your XP and coins will show up here."
          />
        )}
        {history.isSuccess && groups.length > 0 && (
          <div className="flex flex-col gap-5">
            {groups.map(g => (
              <section key={g.key}>
                <h2 className="mb-2 px-1 font-display text-sm font-bold uppercase tracking-[0.06em] text-muted">{g.label}</h2>
                <div className="divide-y divide-line-soft rounded-card bg-surface px-4 shadow-card">
                  {g.items.map(entry => (
                    <HistoryRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
