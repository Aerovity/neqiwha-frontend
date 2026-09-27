import clsx from 'clsx';
import { Link, useLocation } from 'react-router';
import { Plus } from 'lucide-react';

const BAR_HEIGHT = 64;
const BAR_GAP = 12;
/** Space the floating bar takes above the safe area. Pad scrollable screens with `TAB_BAR_SPACE`. */
export const TAB_BAR_HEIGHT = BAR_HEIGHT + BAR_GAP;
export const TAB_BAR_SPACE = `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom) + 16px)`;

/**
 * Icons live in `public/brand/nav/`: `<name>-on.svg` is the 40 px selected tile, `<name>-off.svg` the bare pale
 * glyph (30 px, except the map glyph which is drawn in a 40 px box).
 */
const TABS: { to: string; label: string; icon: string; offSize: number }[] = [
  { to: '/', label: 'Map', icon: 'map', offSize: 40 },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard', offSize: 30 },
  { to: '/shop', label: 'Shop', icon: 'shop', offSize: 30 },
  { to: '/profile', label: 'Profile', icon: 'profile', offSize: 30 },
];

const isActive = (path: string, to: string) => (to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`));

/** Floating bottom navigation inside the 480 px column: icon tabs around the "Spot a mess" button. */
export function TabBar() {
  const { pathname } = useLocation();
  const item = (t: (typeof TABS)[number]) => {
    const active = isActive(pathname, t.to);
    return (
      <Link
        key={t.to}
        to={t.to}
        aria-label={t.label}
        title={t.label}
        aria-current={active ? 'page' : undefined}
        className="grid min-w-0 flex-1 place-items-center self-stretch transition-transform active:scale-[.9]"
      >
        <span className="grid size-10 place-items-center">
          {active ? (
            <img key="on" src={`/brand/nav/${t.icon}-on.svg`} alt="" width={40} height={40} className="animate-pop-in" />
          ) : (
            <img key="off" src={`/brand/nav/${t.icon}-off.svg`} alt="" width={t.offSize} height={t.offSize} />
          )}
        </span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-3"
      style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + ${BAR_GAP}px)` }}
    >
      <div
        className="flex items-center rounded-[22px] bg-surface/95 px-2 shadow-[0_6px_18px_-4px_rgba(4,20,13,0.22),0_1px_3px_rgba(4,20,13,0.08)] backdrop-blur-lg"
        style={{ height: BAR_HEIGHT }}
      >
        {TABS.slice(0, 2).map(item)}
        <Link
          to="/spots/new"
          aria-label="Spot a mess"
          title="Spot a mess"
          aria-current={pathname === '/spots/new' ? 'page' : undefined}
          className="group grid flex-1 place-items-center"
        >
          <span
            className={clsx(
              'grid size-[54px] place-items-center rounded-full text-white transition-transform duration-150 group-active:scale-[.92]',
              'bg-[radial-gradient(circle_at_30%_25%,#1B8200_0%,#0D5000_55%,#083A00_100%)]',
              'shadow-[0_0_0_4px_var(--color-surface),0_6px_16px_-4px_rgba(8,58,0,0.6)]',
            )}
          >
            <Plus size={30} strokeWidth={2.75} />
          </span>
        </Link>
        {TABS.slice(2).map(item)}
      </div>
    </nav>
  );
}
