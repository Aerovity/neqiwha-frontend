import clsx from 'clsx';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface CheckedInSuccessProps {
  title?: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  className?: string;
}

const BACK_OUT = [0.34, 1.56, 0.64, 1] as const;

/** Big check that pops in (600 ms back-out) + "You're checked in! 🌿". */
export function CheckedInSuccess({ title = "You're checked in! 🌿", body, action, className }: CheckedInSuccessProps) {
  const reduce = useReducedMotion();
  return (
    <div role="status" className={clsx('flex flex-col items-center gap-5 text-center', className)}>
      <div className="relative grid size-32 place-items-center">
        {!reduce && (
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full bg-brand/20"
            initial={{ scale: 0.6, opacity: 1 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.1, delay: 0.35, ease: 'easeOut' }}
          />
        )}
        <motion.div
          className="grid size-28 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_22%,#9BDB4E_0%,#2FA54C_38%,#006233_100%)] shadow-[0_16px_40px_-10px_rgba(0,98,51,0.65)]"
          initial={reduce ? false : { scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, ease: BACK_OUT }}
        >
          <svg viewBox="0 0 24 24" width="60" height="60" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <motion.polyline
              points="4 12.5 9.5 18 20 6.5"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </div>
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
      >
        <h2 className="font-display text-display">{title}</h2>
        {body && <p className="max-w-xs text-[15px] leading-relaxed text-muted">{body}</p>}
      </motion.div>
      {action}
    </div>
  );
}
