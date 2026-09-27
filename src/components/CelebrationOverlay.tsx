import clsx from 'clsx';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';

export interface CelebrationOverlayProps {
  children: ReactNode;
  /** Esc key handler. */
  onClose?: () => void;
  /** Gold glow instead of green (legend moments). */
  gold?: boolean;
  className?: string;
}

/** Full-screen deep → night stage inside the column, for level-ups and reward cards. Wrap in AnimatePresence for exit. */
export function CelebrationOverlay({ children, onClose, gold, className }: CelebrationOverlayProps) {
  useEffect(() => {
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-y-0 left-1/2 z-[60] w-full max-w-[480px] -translate-x-1/2 overflow-y-auto bg-[linear-gradient(170deg,#0B3D2E_0%,#04140D_75%)] text-white"
    >
      <div
        aria-hidden
        className={clsx(
          'pointer-events-none absolute left-1/2 top-[8%] size-[520px] -translate-x-1/2 rounded-full blur-3xl',
          gold ? 'bg-[radial-gradient(circle,rgba(242,183,5,0.35),rgba(242,183,5,0)_65%)]' : 'bg-[radial-gradient(circle,rgba(155,219,78,0.25),rgba(155,219,78,0)_65%)]',
        )}
      />
      <div
        className={clsx('relative flex min-h-full flex-col items-center justify-center px-6', className)}
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 32px)', paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)' }}
      >
        {children}
      </div>
    </motion.div>,
    document.body,
  );
}
