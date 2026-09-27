import clsx from 'clsx';
import type { CSSProperties } from 'react';

export interface SkeletonProps {
  shape?: 'block' | 'line' | 'circle';
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

/** Shimmering placeholder. `line` = text line, `circle` = avatar, `block` = card/photo. */
export function Skeleton({ shape = 'block', width, height, className, style }: SkeletonProps) {
  return (
    <span
      aria-hidden
      className={clsx(
        'block animate-shimmer bg-[linear-gradient(90deg,#E6ECE9_0%,#E6ECE9_35%,#F4F7F6_50%,#E6ECE9_65%,#E6ECE9_100%)] bg-size-[200%_100%]',
        shape === 'circle' && 'rounded-full',
        shape === 'line' && 'h-3.5 rounded-pill',
        shape === 'block' && 'rounded-card',
        className,
      )}
      style={{ width, height: height ?? (shape === 'circle' ? width : undefined), ...style }}
    />
  );
}

/** Loading row matching SpotCard. */
export function SpotCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-card bg-surface p-3 shadow-card" aria-busy>
      <Skeleton className="size-[76px] shrink-0 rounded-md!" />
      <div className="flex flex-1 flex-col gap-2.5">
        <Skeleton shape="line" width="85%" />
        <Skeleton shape="line" width="55%" />
        <Skeleton shape="line" width="40%" className="h-6!" />
      </div>
    </div>
  );
}

/** Loading row matching LeaderRow. */
export function LeaderRowSkeleton() {
  return (
    <div className="flex items-center gap-4 px-4 py-3" aria-busy>
      <Skeleton shape="line" width={18} />
      <Skeleton shape="circle" width={40} />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton shape="line" width="50%" />
        <Skeleton shape="line" width="30%" className="h-2.5!" />
      </div>
      <Skeleton shape="line" width={44} />
    </div>
  );
}
