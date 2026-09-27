import clsx from 'clsx';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

export interface BeforeAfterProps {
  beforeUrl: string;
  afterUrl: string;
  /** Spot title, used in alt texts. */
  alt?: string;
  className?: string;
}

/** Drag (or arrow-key) compare slider. BEFORE is revealed on the left. */
export function BeforeAfter({ beforeUrl, afterUrl, alt = 'the spot', className }: BeforeAfterProps) {
  const box = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState(50);
  const [dragging, setDragging] = useState(false);

  const moveTo = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    setPct(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  const onDown = (e: PointerEvent) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // capture is best effort (fails for synthetic/inactive pointers)
    }
    setDragging(true);
    moveTo(e.clientX);
  };
  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 20 : 5;
    const map: Record<string, number> = { ArrowLeft: pct - step, ArrowRight: pct + step, Home: 0, End: 100 };
    if (e.key in map) {
      e.preventDefault();
      setPct(Math.min(100, Math.max(0, map[e.key])));
    }
  };

  return (
    <div
      ref={box}
      className={clsx(
        'relative aspect-[4/3] w-full touch-pan-y select-none overflow-hidden rounded-card bg-line-soft shadow-card',
        className,
      )}
      onPointerDown={onDown}
      onPointerMove={e => dragging && moveTo(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <img src={afterUrl} alt={`After photo of ${alt}`} draggable={false} loading="lazy" className="absolute inset-0 size-full object-cover" />
      <img
        src={beforeUrl}
        alt={`Before photo of ${alt}`}
        draggable={false}
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      />
      <Label className="left-3" hidden={pct < 18}>
        Before
      </Label>
      <Label className="right-3" hidden={pct > 82}>
        After
      </Label>
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pct}%` }}>
        <span className="absolute inset-y-0 -left-px w-[3px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.35)]" />
        <span
          role="slider"
          tabIndex={0}
          aria-label="Compare before and after"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          aria-valuetext={`${Math.round(pct)}% before`}
          onKeyDown={onKey}
          className={clsx(
            'pointer-events-auto absolute top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-white text-ink shadow-[0_4px_14px_rgba(4,20,13,0.35)] transition-transform duration-150',
            dragging && 'scale-110',
          )}
        >
          <ChevronsLeftRight size={22} strokeWidth={2.4} />
        </span>
      </div>
    </div>
  );
}

function Label({ children, className, hidden }: { children: string; className: string; hidden: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'pointer-events-none absolute top-3 rounded-pill bg-night/55 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md transition-opacity duration-200',
        hidden && 'opacity-0',
        className,
      )}
    >
      {children}
    </span>
  );
}
