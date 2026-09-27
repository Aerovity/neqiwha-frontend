import confetti from 'canvas-confetti';

const GREENS_GOLD = ['#006233', '#2E9E4F', '#9BDB4E', '#F2B705', '#FFD84A'];
let leaf: confetti.Shape | null = null;

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Leaf + green/gold dot burst (1.4 s, gravity). No-op under prefers-reduced-motion. */
export function leafConfetti(origin: { x?: number; y?: number } = { y: 0.3 }) {
  if (reducedMotion()) return;
  leaf ??= confetti.shapeFromText({ text: '🍃', scalar: 2 });
  const base = { origin, zIndex: 200, disableForReducedMotion: true } as const;
  confetti({ ...base, shapes: [leaf], scalar: 2, particleCount: 36, spread: 75, startVelocity: 38, gravity: 0.9, ticks: 220, flat: false });
  confetti({ ...base, shapes: ['circle'], colors: GREENS_GOLD, scalar: 0.9, particleCount: 70, spread: 95, startVelocity: 45, ticks: 180 });
}

/** Small gold burst for coin moments. */
export function coinConfetti(origin: { x?: number; y?: number } = { y: 0.5 }) {
  if (reducedMotion()) return;
  confetti({ origin, zIndex: 200, disableForReducedMotion: true, shapes: ['circle'], colors: ['#F2B705', '#FFD84A', '#C08A00'], particleCount: 40, spread: 60, startVelocity: 32, scalar: 0.8, ticks: 140 });
}
