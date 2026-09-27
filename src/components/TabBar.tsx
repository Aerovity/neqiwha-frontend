import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Plus } from 'lucide-react';

const BAR_HEIGHT = 64;
const BAR_GAP = 12;
/** Space the floating bar takes above the safe area. Pad scrollable screens with `TAB_BAR_SPACE`. */
export const TAB_BAR_HEIGHT = BAR_HEIGHT + BAR_GAP;
export const TAB_BAR_SPACE = `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom) + 16px)`;

/**
 * Icons live in `public/brand/nav/`: `<name>-on.svg` is the dark green glyph (40 px box), `<name>-off.svg` the
 * pale glyph (30 px, except the map glyph which is drawn in a 40 px box). `slot` is the position among the five
 * equal slots of the bar (2 is "Spot a mess").
 */
const TABS: { to: string; label: string; icon: string; offSize: number; slot: number }[] = [
  { to: '/', label: 'Map', icon: 'map', offSize: 40, slot: 0 },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard', offSize: 30, slot: 1 },
  { to: '/shop', label: 'Shop', icon: 'shop', offSize: 30, slot: 3 },
  { to: '/profile', label: 'Profile', icon: 'profile', offSize: 30, slot: 4 },
];

const isActive = (path: string, to: string) => (to === '/' ? path === '/' : path === to || path.startsWith(`${to}/`));

/**
 * Every screen mounts its own TabBar, so the lens remembers where it was and glides from there after a
 * navigation instead of popping into place.
 */
let lastSlot: number | null = null;

/**
 * SVG refraction in `backdrop-filter` only works in Chromium; elsewhere an unknown filter would drop the whole
 * declaration, so other engines get plain frosted glass.
 */
const refracts =
  typeof navigator !== 'undefined' &&
  /(Chrome|Chromium)\//.test(navigator.userAgent) &&
  !/iPhone|iPad|CriOS|FxiOS|EdgiOS/.test(navigator.userAgent);

const GLASS = refracts ? 'url(#nq-glass) blur(5px) saturate(185%)' : 'blur(12px) saturate(185%)';
const LENS_GLASS = refracts ? 'url(#nq-lens) blur(2px) saturate(200%) brightness(1.06)' : 'blur(6px) saturate(200%) brightness(1.06)';
/** Chromium treats the -webkit- alias as the same property, so only Safari-style engines get the prefix. */
const glass = (filter: string) => (refracts ? { backdropFilter: filter } : { backdropFilter: filter, WebkitBackdropFilter: filter });

/** Floating "liquid glass" bottom navigation: icon tabs, a gliding glass lens, and the "Spot a mess" button. */
export function TabBar() {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();
  const activeSlot = TABS.find(t => isActive(pathname, t.to))?.slot ?? null;
  const [from] = useState(() => lastSlot ?? activeSlot);
  useEffect(() => {
    if (activeSlot != null) lastSlot = activeSlot;
  }, [activeSlot]);
  const moved = from != null && activeSlot != null && from !== activeSlot && !reduce;

  const item = (t: (typeof TABS)[number]) => {
    const active = t.slot === activeSlot;
    return (
      <Link
        key={t.to}
        to={t.to}
        aria-label={t.label}
        title={t.label}
        aria-current={active ? 'page' : undefined}
        className="relative z-10 grid min-w-0 flex-1 place-items-center self-stretch"
      >
        <motion.span
          className="grid size-10 place-items-center"
          whileTap={reduce ? undefined : { scale: 0.82 }}
          transition={{ type: 'spring', stiffness: 520, damping: 22 }}
        >
          {active ? (
            <motion.img
              key="on"
              src={`/brand/nav/${t.icon}-on.svg`}
              alt=""
              width={40}
              height={40}
              initial={moved ? { scale: 0.6, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 460, damping: 18, delay: 0.12 }}
            />
          ) : (
            <img key="off" src={`/brand/nav/${t.icon}-off.svg`} alt="" width={t.offSize} height={t.offSize} />
          )}
        </motion.span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Main"
      className="fixed bottom-0 left-1/2 z-40 w-full max-w-[480px] -translate-x-1/2 px-3"
      style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + ${BAR_GAP}px)` }}
    >
      <GlassFilters />
      <div
        className="relative isolate flex items-center rounded-[26px] px-2 shadow-[0_10px_30px_-8px_rgba(4,20,13,0.35),0_2px_6px_rgba(4,20,13,0.08)]"
        style={{ height: BAR_HEIGHT }}
      >
        {/* Glass: refracted, saturated backdrop + milky tint + specular rim + top sheen. */}
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-[inherit] bg-white/40"
          style={glass(GLASS)}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] shadow-[inset_1.5px_1.5px_0_rgba(255,255,255,0.9),inset_-1px_-1px_0_rgba(255,255,255,0.45),inset_0_0_14px_rgba(255,255,255,0.55)] ring-1 ring-black/5"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-3 top-0 -z-10 h-1/2 rounded-t-[inherit] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),rgba(255,255,255,0))]"
        />

        {/* The lens: a glass droplet that glides to the active tab and stretches while it moves. */}
        {activeSlot != null && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-2 z-0 grid w-[calc((100%-16px)/5)] place-items-center"
            initial={{ x: `${(from ?? activeSlot) * 100}%` }}
            animate={{ x: `${activeSlot * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 26, mass: 1 }}
          >
            <motion.span
              className="block h-[50px] w-[58px] rounded-[20px] bg-[rgba(0,120,0,0.16)] shadow-[inset_1.5px_1.5px_0_rgba(255,255,255,0.95),inset_-1px_-1.5px_0_rgba(255,255,255,0.5),inset_0_-6px_12px_rgba(0,101,45,0.12),0_4px_12px_-4px_rgba(0,101,45,0.35)]"
              style={glass(LENS_GLASS)}
              initial={false}
              animate={moved ? { scaleX: [1, 1.38, 0.94, 1], scaleY: [1, 0.84, 1.05, 1] } : { scaleX: 1, scaleY: 1 }}
              transition={{ duration: 0.55, times: [0, 0.35, 0.72, 1], ease: 'easeOut' }}
            />
          </motion.div>
        )}

        {TABS.slice(0, 2).map(item)}
        <Link
          to="/spots/new"
          aria-label="Spot a mess"
          title="Spot a mess"
          aria-current={pathname === '/spots/new' ? 'page' : undefined}
          className="relative z-10 grid flex-1 place-items-center"
        >
          <motion.span
            className="relative grid size-[54px] place-items-center overflow-hidden rounded-full bg-[radial-gradient(circle_at_30%_25%,#1B8200_0%,#0D5000_55%,#083A00_100%)] text-white shadow-[0_0_0_3px_rgba(255,255,255,0.85),0_8px_18px_-4px_rgba(8,58,0,0.65)]"
            whileTap={reduce ? undefined : { scale: 0.86 }}
            whileHover={reduce ? undefined : { scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 520, damping: 20 }}
          >
            {/* Glossy droplet highlight */}
            <span aria-hidden className="absolute inset-x-2 top-1 h-1/2 rounded-full bg-[linear-gradient(180deg,rgba(255,255,255,0.45),rgba(255,255,255,0))]" />
            <Plus size={30} strokeWidth={2.75} className="relative" />
          </motion.span>
        </Link>
        {TABS.slice(2).map(item)}
      </div>
    </nav>
  );
}

/** Displacement maps for the refraction effect (used by Chromium's backdrop-filter; inert elsewhere). */
function GlassFilters() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <filter id="nq-glass" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="11" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2.5" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="28" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="nq-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.03 0.05" numOctaves="1" seed="3" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="1.5" result="map" />
        <feDisplacementMap in="SourceGraphic" in2="map" scale="18" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  );
}
