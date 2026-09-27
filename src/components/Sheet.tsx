import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';
import clsx from 'clsx';

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Extra classes for the content area. */
  className?: string;
  /** Prevent closing via backdrop/Esc/drag (e.g. while a mutation is pending). */
  dismissible?: boolean;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';

/** Bottom sheet inside the 480 px column: backdrop, spring slide-up, drag-to-close handle, Esc, focus trap. */
export function Sheet({ open, onClose, title, children, className, dismissible = true }: SheetProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const drag = useDragControls();
  const reduce = useReducedMotion();
  const close = () => dismissible && onClose();
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      const first = panel.current?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.current;
      first?.focus({ preventScroll: true });
    }, 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
      }
      if (e.key === 'Tab' && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (!items.length) return e.preventDefault();
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-y-0 left-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-night/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-sheet bg-surface shadow-sheet outline-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={reduce ? { duration: 0 } : { type: 'spring', damping: 32, stiffness: 380 }}
            drag={dismissible ? 'y' : false}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.9 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 600) close();
            }}
          >
            <div
              className="flex shrink-0 cursor-grab touch-none flex-col items-center px-5 pt-2.5 active:cursor-grabbing"
              onPointerDown={e => dismissible && drag.start(e)}
            >
              <span aria-hidden className="h-1.5 w-11 rounded-pill bg-line" />
              {title && (
                <h2 id={titleId} className="mt-3 w-full text-center font-display text-[22px] font-bold leading-tight">
                  {title}
                </h2>
              )}
            </div>
            <div
              className={clsx('min-h-0 overflow-y-auto overscroll-contain px-5 pt-4', className)}
              style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
