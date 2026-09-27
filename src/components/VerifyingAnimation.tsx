import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface VerifyingAnimationProps {
  beforeUrl: string;
  afterUrl: string;
  /** Default true: fixed full-screen overlay inside the column. */
  fullscreen?: boolean;
  className?: string;
}

const LINES = ['Comparing before and after…', 'Counting bottles…', 'Checking the corners…', 'Almost there…'];

/** AI referee at work: both photos with a scan line (1.6 s linear loop) and rotating status lines. */
export function VerifyingAnimation({ beforeUrl, afterUrl, fullscreen = true, className }: VerifyingAnimationProps) {
  const [line, setLine] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setLine(l => Math.min(l + 1, LINES.length - 1)), 1200);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={clsx(
        'flex flex-col items-center justify-center gap-9 overflow-hidden bg-[linear-gradient(160deg,#0B3D2E_0%,#04140D_78%)] px-6 py-10 text-white',
        fullscreen ? 'fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2' : 'rounded-card',
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-pill bg-white/8 px-3.5 py-1.5 text-[13px] font-semibold text-mist ring-1 ring-white/10">
        <Sparkles size={15} className="text-sprout" />
        AI referee
      </span>

      <div className="grid w-full max-w-[380px] grid-cols-2 gap-3">
        <ScanPhoto src={beforeUrl} label="Before" delay={0} />
        <ScanPhoto src={afterUrl} label="After" delay={0.8} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative h-9 w-full min-w-[280px] overflow-hidden text-center">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p
              key={line}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -24, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="font-display text-2xl font-bold"
            >
              {LINES[line]}
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="flex gap-1.5" aria-hidden>
          {LINES.map((_, i) => (
            <span
              key={i}
              className={clsx('h-1.5 rounded-pill transition-all duration-500', i <= line ? 'w-6 bg-sprout' : 'w-1.5 bg-white/20')}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ScanPhoto({ src, label, delay }: { src: string; label: string; delay: number }) {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] bg-white/5 ring-1 ring-white/15">
      <img src={src} alt={`${label} photo`} className="size-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,13,0)_40%,rgba(4,20,13,0.55))]" />
      <span
        aria-hidden
        className="absolute inset-x-0 h-0.5 animate-scan bg-sprout shadow-[0_0_12px_3px_rgba(155,219,78,0.75)]"
        style={{ animationDelay: `${delay}s` }}
      >
        <span className="absolute inset-x-0 bottom-0.5 h-10 bg-[linear-gradient(0deg,rgba(155,219,78,0.28),rgba(155,219,78,0))]" />
      </span>
      {['left-2 top-2 border-l-2 border-t-2', 'right-2 top-2 border-r-2 border-t-2', 'left-2 bottom-2 border-l-2 border-b-2', 'right-2 bottom-2 border-r-2 border-b-2'].map(c => (
        <span key={c} aria-hidden className={clsx('absolute size-4 rounded-[3px] border-white/80', c)} />
      ))}
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-[0.14em]">{label}</span>
    </div>
  );
}
