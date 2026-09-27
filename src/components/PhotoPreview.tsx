import clsx from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { LoaderCircle, RotateCcw } from 'lucide-react';
import { CheckStroke } from './icons';

export interface PhotoPreviewProps {
  src: string;
  alt: string;
  onRetake?: () => void;
  uploading?: boolean;
  /** 0–1; shows a bar while uploading. */
  progress?: number | null;
  /** Show a small "Uploaded" tick. */
  uploaded?: boolean;
  className?: string;
}

/** Rounded photo with Retake and an upload overlay. */
export function PhotoPreview({ src, alt, onRetake, uploading, progress, uploaded, className }: PhotoPreviewProps) {
  return (
    <div className={clsx('relative aspect-[4/3] w-full overflow-hidden rounded-card bg-line-soft shadow-card', className)}>
      <img src={src} alt={alt} className="size-full object-cover" />
      <AnimatePresence>
        {uploading && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-night/50 text-white backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoaderCircle size={32} className="animate-spin" />
            <span className="text-sm font-semibold">Uploading…</span>
            {progress != null && (
              <span className="h-1.5 w-40 overflow-hidden rounded-pill bg-white/25">
                <span className="block h-full rounded-pill bg-sprout transition-[width] duration-200" style={{ width: `${Math.round(progress * 100)}%` }} />
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {uploaded && !uploading && (
        <span className="absolute bottom-3 left-3 inline-flex h-8 animate-pop-in items-center gap-1.5 rounded-pill bg-night/55 pl-2 pr-3 text-[13px] font-semibold text-white backdrop-blur-md">
          <span className="grid size-5 place-items-center rounded-full bg-brand">
            <CheckStroke size={12} strokeWidth={3.5} />
          </span>
          Uploaded
        </span>
      )}
      {onRetake && !uploading && (
        <button
          type="button"
          onClick={onRetake}
          className="absolute right-3 top-3 inline-flex h-10 items-center gap-1.5 rounded-pill bg-night/45 px-3.5 text-sm font-semibold text-white backdrop-blur-md transition-transform active:scale-[.96]"
        >
          <RotateCcw size={16} strokeWidth={2.4} />
          Retake
        </button>
      )}
    </div>
  );
}
