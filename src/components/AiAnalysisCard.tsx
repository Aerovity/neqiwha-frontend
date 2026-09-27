import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { Ban, Info, RotateCw, Sparkles } from 'lucide-react';
import type { PhotoAnalysis } from '../shared/types';
import { Button } from './Button';
import { SproutIcon } from './icons';
import { Skeleton } from './Skeleton';

export interface AiAnalysisCardProps {
  state: 'analyzing' | 'done' | 'error';
  analysis?: PhotoAnalysis | null;
  /** Shown as a "Try again" button in the error state. */
  onRetry?: () => void;
  className?: string;
}

const DIRT_LABEL = ['', 'A bit messy', 'Messy', 'Pretty dirty', 'Very dirty', 'Disaster zone'];

/**
 * Result of POST /ai/analyze-photo: shimmer while analyzing; item chips + dirt level when the photo is accepted;
 * a refusal with the AI's reason when it isn't; a retry when the AI couldn't be reached.
 */
export function AiAnalysisCard({ state, analysis, onRetry, className }: AiAnalysisCardProps) {
  const refused = state === 'done' && !!analysis && !analysis.accepted;
  const view = refused ? 'refused' : state;
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-card p-4 shadow-card',
        refused ? 'bg-danger-soft shadow-[inset_0_0_0_1.5px_rgba(210,16,52,0.25)]' : 'bg-surface',
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-2.5">
        <span
          className={clsx(
            'grid size-8 shrink-0 place-items-center rounded-full text-white',
            refused ? 'bg-danger' : state === 'error' ? 'bg-muted/70' : 'bg-[radial-gradient(circle_at_30%_22%,#9BDB4E,#2FA54C_40%,#006233)]',
          )}
        >
          {refused ? <Ban size={16} /> : <Sparkles size={16} className={clsx(state === 'analyzing' && 'animate-pulse')} />}
        </span>
        <span className={clsx('text-sm font-semibold', refused && 'text-danger')}>{refused ? 'Photo refused' : 'AI check'}</span>
        {view === 'done' && analysis && (
          <span className="ml-auto text-xs font-medium text-muted">{analysis.items.length} things spotted</span>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="mt-3.5"
        >
          {view === 'analyzing' && (
            <div className="flex flex-col gap-3">
              <p className="animate-shimmer bg-[linear-gradient(90deg,#4E5E56_0%,#4E5E56_40%,#9BDB4E_50%,#4E5E56_60%,#4E5E56_100%)] bg-size-[200%_100%] bg-clip-text text-[15px] font-medium text-transparent">
                AI is checking your photo…
              </p>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20 rounded-pill!" />
                <Skeleton className="h-8 w-28 rounded-pill!" />
                <Skeleton className="h-8 w-16 rounded-pill!" />
              </div>
            </div>
          )}

          {view === 'done' && analysis && (
            <div className="flex flex-col gap-4">
              {analysis.items.length > 0 && (
                <ul className="flex flex-wrap gap-1.5" aria-label="Detected items">
                  {analysis.items.map((it, i) => (
                    <motion.li
                      key={it}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * i, type: 'spring', stiffness: 500, damping: 26 }}
                      className="rounded-pill bg-paper px-3 py-1.5 text-[13px] font-medium text-ink first-letter:uppercase shadow-[inset_0_0_0_1px_var(--color-line)]"
                    >
                      {it}
                    </motion.li>
                  ))}
                </ul>
              )}
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-muted">
                  Dirt level · <span className="font-semibold text-ink">{DIRT_LABEL[analysis.dirtLevel]}</span>
                </span>
                <span className="flex gap-0.5" role="img" aria-label={`Dirt level ${analysis.dirtLevel} of 5`}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <SproutIcon key={n} size={22} color={n <= analysis.dirtLevel ? '#006233' : '#D8E1DC'} />
                  ))}
                </span>
              </div>
            </div>
          )}

          {view === 'refused' && analysis && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[15px] font-semibold leading-snug text-ink">{analysis.rejectReason}</p>
              <p className="text-sm leading-snug text-muted">
                Only real littered places can become spots. Retake the photo and show the mess itself.
              </p>
            </div>
          )}

          {view === 'error' && (
            <div className="flex flex-col items-start gap-3">
              <p className="flex gap-2 text-[15px] leading-snug text-muted">
                <Info size={18} className="mt-0.5 shrink-0" />
                The AI couldn't check this photo. Try again in a moment.
              </p>
              {onRetry && (
                <Button size="sm" variant="secondary" icon={<RotateCw size={16} />} onClick={onRetry}>
                  Try again
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
