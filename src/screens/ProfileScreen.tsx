import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Avatar,
  Button,
  CoinPill,
  ConfirmSheet,
  RankBadge,
  SpotCard,
  SpotCardSkeleton,
  TAB_BAR_SPACE,
  TabBar,
  UserName,
  XpBar,
} from '../components';
import { ApiError } from '../lib/api';
import { formatNumber } from '../lib/format';
import { useLogout, useMe, useMyEvents } from '../lib/queries';
import { RANKS } from '../shared/ranks';
import { ChevronRight, History, LogOut, Medal, QrCode, ShieldCheck, Wallet } from 'lucide-react';

function ActionRow({ to, icon, label, desc }: { to: string; icon: ReactNode; label: string; desc?: string }) {
  return (
    <Link
      to={to}
      className="flex min-h-11 items-center gap-3 rounded-card bg-surface px-4 py-3 shadow-card transition-transform active:scale-[.98]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{label}</div>
        {desc && <div className="text-[13px] text-muted">{desc}</div>}
      </div>
      <ChevronRight size={20} className="shrink-0 text-muted/70" />
    </Link>
  );
}

export function ProfileScreen() {
  const navigate = useNavigate();
  const me = useMe();
  const events = useMyEvents();
  const logout = useLogout();
  const [confirmOut, setConfirmOut] = useState(false);

  // `me.data` can briefly go null here mid-logout (its query is cleared before this screen
  // unmounts) — render nothing rather than crash; RequireUser redirects on the same tick.
  if (!me.data) return null;
  const user = me.data;
  const rank = RANKS[user.level];
  const spots = useMemo(() => {
    const all = [...(events.data?.organized ?? []), ...(events.data?.joined ?? [])];
    const seen = new Set<string>();
    return all.filter(p => (seen.has(p.id) ? false : (seen.add(p.id), true))).slice(0, 6);
  }, [events.data]);

  const doLogout = async () => {
    try {
      await logout.mutateAsync();
      setConfirmOut(false);
      navigate('/', { replace: true });
      toast.success('Logged out.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not log out.');
    }
  };

  return (
    <div className="min-h-dvh bg-paper" style={{ paddingBottom: TAB_BAR_SPACE }}>
      <div
        className="relative overflow-hidden bg-[linear-gradient(180deg,#0B3D2E_0%,#04140D_55%,#E9EFEA_100%)] px-4 pb-8 pt-[max(0.75rem,env(safe-area-inset-top))]"
      >
        <div className="flex flex-col items-center pt-6 text-center">
          <Avatar initials={user.initials} level={user.level} seed={user.id} size={96} label={user.displayName} />
          <UserName name={user.displayName} level={user.level} tone="dark" className="mt-4 text-xl" />
          <div className="mt-2 flex items-center gap-2">
            <RankBadge level={user.level} size={28} />
            <span className="font-display text-lg font-bold text-white">{rank.name}</span>
          </div>
          <p className="mt-1 max-w-xs text-sm text-mist">{rank.tagline}</p>
          <Link to="/shop" className="mt-4 transition-transform active:scale-[.96]">
            <CoinPill coins={user.coins} />
          </Link>
        </div>
      </div>

      <div className="relative z-10 -mt-4 flex flex-col gap-5 px-4">
        <section className="rounded-card bg-surface p-4 shadow-card">
          <XpBar xp={user.xp} />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line/60 pt-4">
            <div className="text-center">
              <div className="font-display text-2xl font-bold tabular-nums">{formatNumber(user.stats.cleanups)}</div>
              <div className="text-[13px] font-medium text-muted">Cleanups joined</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold tabular-nums">{formatNumber(user.stats.organized)}</div>
              <div className="text-[13px] font-medium text-muted">Spots organized</div>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-2">
          <ActionRow to="/me/qr" icon={<QrCode size={20} />} label="My QR" desc="Show at check-in" />
          <ActionRow to="/wallet" icon={<Wallet size={20} />} label="Wallet" desc="Your partner vouchers" />
          <ActionRow to="/ranks" icon={<Medal size={20} />} label="All ranks" desc="Perks and progress" />
          <ActionRow to="/history" icon={<History size={20} />} label="History" desc="XP, coins and level-ups" />
          {user.isAdmin && (
            <ActionRow to="/admin" icon={<ShieldCheck size={20} />} label="Admin panel" desc="Moderate spots and manage admins" />
          )}
        </div>

        <section>
          <h2 className="mb-3 px-1 font-display text-lg font-bold">My spots</h2>
          {events.isPending && (
            <div className="flex flex-col gap-2">
              <SpotCardSkeleton />
              <SpotCardSkeleton />
            </div>
          )}
          {events.isSuccess && spots.length === 0 && (
            <p className="rounded-card bg-surface px-4 py-6 text-center text-sm text-muted shadow-card">
              No spots yet — spot a mess or join a cleanup on the map.
            </p>
          )}
          {events.isSuccess && spots.length > 0 && (
            <div className="flex flex-col gap-2">
              {spots.map(p => (
                <SpotCard key={p.id} pin={p} to={`/spots/${p.id}`} />
              ))}
            </div>
          )}
        </section>

        <Button variant="secondary" size="lg" full icon={<LogOut size={20} />} onClick={() => setConfirmOut(true)}>
          Log out
        </Button>
      </div>

      <TabBar />

      <ConfirmSheet
        open={confirmOut}
        title="Log out?"
        body="You'll need a new code to sign back in."
        confirmLabel="Log out"
        tone="danger"
        loading={logout.isPending}
        onConfirm={doLogout}
        onClose={() => !logout.isPending && setConfirmOut(false)}
      />
    </div>
  );
}
