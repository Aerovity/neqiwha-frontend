import clsx from 'clsx';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { animate, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from 'motion/react';
import { Check, Hand, LoaderCircle } from 'lucide-react';

export interface HoldButtonProps {
  label: string;
  onComplete: () => void;
  /** ms to hold. */
  duration?: number;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/** Press-and-hold confirm (staff "Hold to mark as used"). Fill + ring progress; releasing early cancels. */
export function HoldButton({ label, onComplete, duration = 1200, disabled, loading, className }: HoldButtonProps) {
  const progress = useMotionValue(0);
  const dash = useTransform(progress, p => `${p * 62.83} 62.83`);
  const anim = useRef<AnimationPlaybackControls | null>(null);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const inactive = disabled || loading || done;

  useEffect(() => () => anim.current?.stop(), []);
  // Re-arm after the action settles (loading goes back to false), or shortly after if no loading state is used.
  useEffect(() => {
    if (!done || loading) return;
    const t = setTimeout(() => {
      setDone(false);
      animate(progress, 0, { duration: 0.3 });
    }, 1200);
    return () => clearTimeout(t);
  }, [done, loading, progress]);

  const start = () => {
    if (inactive) return;
    setHolding(true);
    anim.current?.stop();
    anim.current = animate(progress, 1, {
      duration: (duration * (1 - progress.get())) / 1000,
      ease: 'linear',
      onComplete: () => {
        setHolding(false);
        setDone(true);
        navigator.vibrate?.(40);
        onComplete();
      },
    });
  };
  const cancel = () => {
    if (!holding) return;
    setHolding(false);
    anim.current?.stop();
    anim.current = animate(progress, 0, { duration: 0.25, ease: 'easeOut' });
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
      e.preventDefault();
      start();
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') cancel();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={inactive || undefined}
      aria-busy={loading || undefined}
      onPointerDown={e => {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // capture is best effort (fails for synthetic/inactive pointers)
        }
        start();
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onLostPointerCapture={cancel}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={cancel}
      onContextMenu={e => e.preventDefault()}
      className={clsx(
        'relative isolate flex h-14 w-full touch-none select-none items-center justify-center gap-3 overflow-hidden rounded-pill bg-ink px-6 text-[17px] font-semibold text-white transition-transform duration-150 [-webkit-touch-callout:none]',
        holding && 'scale-[.98]',
        disabled && 'opacity-50',
        className,
      )}
    >
      <motion.span aria-hidden className="absolute inset-0 -z-10 origin-left bg-brand" style={{ scaleX: progress }} />
      <span className="relative grid size-7 place-items-center">
        {loading ? (
          <LoaderCircle size={22} className="animate-spin" />
        ) : done ? (
          <Check size={20} strokeWidth={3} className="animate-pop-in" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90" aria-hidden>
              <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2.5" />
              <motion.circle cx="12" cy="12" r="10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{ strokeDasharray: dash }} />
            </svg>
            <Hand size={13} strokeWidth={2.5} />
          </>
        )}
      </span>
      <span>{holding ? 'Keep holding…' : label}</span>
    </button>
  );
}
