import clsx from 'clsx';
import { Link, useLocation } from 'react-router';
import { Map as MapIcon, Plus, Store, Trophy, UserRound, type LucideIcon } from 'lucide-react';

/** Bar height above the safe area. Pad scrollable screens with `TAB_BAR_SPACE`. */
export const TAB_BAR_HEIGHT = 68;
export const TAB_BAR_SPACE = `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom) + 16px)`;

const TABS: { to: string; label: string; icon: LucideIcon }[] = [
  { to: '/', label: 'Map', icon: MapIcon },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/shop', label: 'Shop', icon: Store },
  { to: '/profile', label: 'Profile', icon: UserRound },
];

const isActive = (path: string, to: string) => (to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`));

/** Fixed bottom navigation inside the 480 px column, with the raised "Spot a mess" button in the middle. */
export function TabBar() {
  const { pathname } = useLocation();
  const item = (t: (typeof TABS)[number]) => {
    const active = isActive(pathname, t.to);
    const Icon = t.icon;
    return (
      <Link
        key={t.to}
        to={t.to}
        aria-current={active ? 'page' : undefined}
        className="group flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 active:scale-[.94] transition-transform"
      >
        <span
          className={clsx(
            'grid h-8 w-14 place-items-center rounded-pill transition-colors duration-200',
            active ? 'bg-brand-soft text-brand' : 'text-muted group-hover:text-ink',
          )}
        >
          <Icon size={22} strokeWidth={active ? 2.4 : 2} />
        </span>
        <span className={clsx('text-[11px] leading-4', active ? 'font-semibold text-brand' : 'font-medium text-muted')}>
          {t.label}
        </span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-line/60 bg-surface/92 backdrop-blur-lg"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch px-1" style={{ height: TAB_BAR_HEIGHT }}>
        {TABS.slice(0, 2).map(item)}
        <div className="flex w-[84px] shrink-0 flex-col items-center justify-end pb-1.5">
          <Link
            to="/spots/new"
            aria-label="Spot a mess"
            aria-current={pathname === '/spots/new' ? 'page' : undefined}
            className="group -mt-7 flex flex-col items-center gap-0.5"
          >
            <span className="grid size-[60px] place-items-center rounded-full bg-[radial-gradient(circle_at_30%_22%,#9BDB4E_0%,#2FA54C_38%,#006233_100%)] text-white shadow-[0_0_0_5px_var(--color-surface),0_10px_24px_-6px_rgba(0,98,51,0.7)] transition-transform duration-150 group-active:scale-[.92]">
              <Plus size={30} strokeWidth={2.75} />
            </span>
            <span className="text-[11px] font-semibold leading-4 text-brand">Spot a mess</span>
          </Link>
        </div>
        {TABS.slice(2).map(item)}
      </div>
    </nav>
  );
}
