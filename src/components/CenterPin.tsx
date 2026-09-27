import clsx from 'clsx';

export interface CenterPinProps {
  /** Lift the pin while the map is moving (shadow shrinks). */
  lifted?: boolean;
  size?: number;
  /** Positioning of the anchor point. Default: centre of the nearest positioned parent. */
  className?: string;
}

/** Location-picker pin (nq-dirA). The pin TIP sits exactly on the anchor point; pointer-events off. */
export function CenterPin({ lifted, size = 48, className = 'absolute left-1/2 top-1/2' }: CenterPinProps) {
  return (
    <div aria-hidden className={clsx('pointer-events-none z-10 size-0', className)}>
      <span
        className={clsx(
          'absolute left-0 top-0 h-[5px] w-3 -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-night/30 transition-all duration-200',
          lifted && 'scale-75 opacity-60',
        )}
      />
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={clsx(
          'absolute overflow-visible drop-shadow-[0_6px_8px_rgba(4,20,13,0.3)] transition-transform duration-200 ease-back-out',
          lifted && '-translate-y-2.5',
        )}
        style={{ left: -size / 2, top: -size * 0.97 }}
      >
        <path
          d="M50 97 C50 97 15 63 15 40 C15 20.7 30.7 5 50 5 C69.3 5 85 20.7 85 40 C85 63 50 97 50 97 Z"
          fill="#fff"
          stroke="#fff"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <use href="#nq-dirA" />
      </svg>
    </div>
  );
}
