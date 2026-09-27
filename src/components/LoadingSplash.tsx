import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

const FRAMES = [1, 2, 3, 4].map(n => `/splash/frame-${n}.webp`);
const FRAME_MS = 260;
const HOLD_MS = 350;
const FADE_MS = 450;

/**
 * Boot animation, shown on every page load: the leaf fills in frame by frame, then the splash fades out once
 * the app is `ready` (and never before the animation has finished). On wide screens the portrait frames sit on
 * the square backdrop with soft edges.
 */
export function LoadingSplash({ ready }: { ready: boolean }) {
  const reduce = useReducedMotion();
  const last = FRAMES.length - 1;
  const [frame, setFrame] = useState(reduce ? last : 0);
  const [phase, setPhase] = useState<'playing' | 'leaving' | 'gone'>('playing');

  useEffect(() => {
    if (frame >= last) return;
    const t = setTimeout(() => setFrame(f => f + 1), FRAME_MS);
    return () => clearTimeout(t);
  }, [frame, last]);

  useEffect(() => {
    if (!ready || frame < last || phase !== 'playing') return;
    const t = setTimeout(() => setPhase('leaving'), reduce ? 0 : HOLD_MS);
    return () => clearTimeout(t);
  }, [ready, frame, last, phase, reduce]);

  useEffect(() => {
    if (phase !== 'leaving') return;
    document.getElementById('boot-splash')?.remove();
    const t = setTimeout(() => setPhase('gone'), FADE_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === 'gone') return null;
  return (
    <div
      role="status"
      aria-label="Loading Naqiwha"
      className="fixed inset-0 z-[100] bg-[#6FD83C] bg-cover bg-center transition-opacity ease-out"
      style={{
        backgroundImage: 'url(/splash/backdrop.webp)',
        opacity: phase === 'leaving' ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      <div className="absolute inset-y-0 left-1/2 w-full max-w-[480px] -translate-x-1/2 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] max-[480px]:[mask-image:none]">
        {FRAMES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full object-cover"
            style={{ opacity: i === frame ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}
