import clsx from 'clsx';

export interface StepsProps {
  /** 0-based index of the current step. */
  current: number;
  labels: string[];
  className?: string;
}

/** Flow step indicator: segmented bar + "Step 2 of 3 · Details". */
export function Steps({ current, labels, className }: StepsProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)} aria-label={`Step ${current + 1} of ${labels.length}`}>
      <div className="flex gap-1.5">
        {labels.map((l, i) => (
          <span key={l} className="h-1.5 flex-1 overflow-hidden rounded-pill bg-xp-track">
            <span
              className={clsx('block h-full rounded-pill bg-brand transition-[width] duration-500 ease-out', i <= current ? 'w-full' : 'w-0')}
            />
          </span>
        ))}
      </div>
      <div className="text-[13px] font-medium text-muted">
        Step {current + 1} of {labels.length} · <span className="font-semibold text-ink">{labels[current]}</span>
      </div>
    </div>
  );
}
