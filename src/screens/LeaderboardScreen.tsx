import { LeaderRow, LeaderRowSkeleton, Podium, ScreenHeader, TAB_BAR_HEIGHT, TAB_BAR_SPACE, TabBar } from '../components';
import { useLeaderboard } from '../lib/queries';

export function LeaderboardScreen() {
  const lb = useLeaderboard();
  const top = lb.data?.top ?? [];
  const meRow = lb.data?.me ?? null;
  const top3 = top.filter(e => e.position <= 3);
  const rest = top.filter(e => e.position > 3);
  const showStickyMe = meRow && !top.some(e => e.user.id === meRow.user.id);

  return (
    <div className="min-h-dvh bg-paper" style={{ paddingBottom: showStickyMe ? `calc(${TAB_BAR_SPACE} + 72px)` : TAB_BAR_SPACE }}>
      <ScreenHeader title="Leaderboard" />
      <div className="px-4 pt-2">
        {lb.isPending && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 8 }, (_, i) => (
              <LeaderRowSkeleton key={i} />
            ))}
          </div>
        )}
        {lb.isError && (
          <p className="rounded-card bg-surface p-6 text-center text-muted shadow-card">
            Couldn&apos;t load the leaderboard. Pull to refresh or try again later.
          </p>
        )}
        {lb.isSuccess && top.length === 0 && (
          <p className="rounded-card bg-surface p-8 text-center text-muted shadow-card">No heroes on the board yet — be the first!</p>
        )}
        {lb.isSuccess && top.length > 0 && (
          <>
            {top3.length > 0 && <Podium top3={top3} className="mb-4" />}
            <div className="flex flex-col gap-2">
              {rest.map(e => (
                <LeaderRow key={e.user.id} entry={e} />
              ))}
            </div>
          </>
        )}
      </div>

      {showStickyMe && meRow && (
        <div
          className="fixed left-1/2 z-35 w-full max-w-[480px] -translate-x-1/2 border-t border-line/70 bg-paper/95 px-4 py-2 backdrop-blur-md"
          style={{ bottom: `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom))` }}
        >
          <LeaderRow entry={meRow} highlight />
        </div>
      )}

      <TabBar />
    </div>
  );
}
