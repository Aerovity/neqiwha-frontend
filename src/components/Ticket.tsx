import clsx from 'clsx';
import type { ReactNode } from 'react';

const NOTCH = 14;
const topMask = `radial-gradient(circle ${NOTCH}px at 0 100%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle ${NOTCH}px at 100% 100%, #0000 98%, #000) right / 51% 100% no-repeat`;
const bottomMask = `radial-gradient(circle ${NOTCH}px at 0 0, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle ${NOTCH}px at 100% 0, #0000 98%, #000) right / 51% 100% no-repeat`;

/** Two-part ticket with real (transparent) side notches and a perforation line. Works on any background. */
export function Ticket({
  top,
  bottom,
  topClassName,
  bottomClassName,
  className,
}: {
  top: ReactNode;
  bottom: ReactNode;
  topClassName?: string;
  bottomClassName?: string;
  className?: string;
}) {
  return (
    <div className={clsx('w-full drop-shadow-[0_14px_28px_rgba(4,20,13,0.18)]', className)}>
      <div className={clsx('rounded-t-[26px]', topClassName)} style={{ mask: topMask, WebkitMask: topMask }}>
        {top}
      </div>
      <div className={clsx('relative rounded-b-[26px] bg-surface', bottomClassName)} style={{ mask: bottomMask, WebkitMask: bottomMask }}>
        <span
          aria-hidden
          className="absolute inset-x-5 top-0 border-t-2 border-dashed border-line"
          style={{ left: NOTCH + 8, right: NOTCH + 8 }}
        />
        {bottom}
      </div>
    </div>
  );
}
