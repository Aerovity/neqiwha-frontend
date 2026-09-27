import clsx from 'clsx';
import type { EventStatus } from '../shared/types';
import { CheckStroke } from './icons';

export const STATUS_LABEL: Record<EventStatus, string> = {
  open: 'Needs cleaning',
  in_progress: 'Cleaning now',
  cleaned: 'Cleaned',
};

export interface StatusChipProps {
  status: EventStatus;
  size?: 'sm' | 'md';
  className?: string;
}

/** Status pill; dot, pulse and check mirror the map markers. */
export function StatusChip({ status, size = 'md', className }: StatusChipProps) {
  const sm = size === 'sm';
  return (
    <span
      className={clsx(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-pill font-semibold',
        sm ? 'h-6 gap-1.5 pl-2 pr-2.5 text-xs' : 'h-8 gap-2 pl-2.5 pr-3 text-sm',
        status === 'open' && 'bg-spot-open-soft text-spot-open-ink',
        status === 'in_progress' && 'bg-spot-live-soft text-spot-live-ink',
        status === 'cleaned' && 'bg-spot-cleaned-soft text-spot-cleaned-ink',
        className,
      )}
    >
      {status === 'cleaned' ? (
        <CheckStroke size={sm ? 13 : 16} color="#006233" strokeWidth={3} />
      ) : (
        <span className={clsx('relative shrink-0 rounded-full', sm ? 'size-2' : 'size-2.5', status === 'open' ? 'bg-spot-open' : 'bg-spot-live')}>
          {status === 'in_progress' && (
            <span aria-hidden className="absolute -inset-[3px] animate-pulse-ring rounded-full bg-spot-live/40" />
          )}
        </span>
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}
