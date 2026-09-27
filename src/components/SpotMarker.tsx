import clsx from 'clsx';
import { Clock, Trash2 } from 'lucide-react';
import type { EventStatus } from '../shared/types';
import { STATUS_LABEL } from './StatusChip';

export interface SpotMarkerProps {
  status: EventStatus;
  selected?: boolean;
}

/** Marker diameter in px: the same for every state, a bit bigger when selected. */
export const markerSize = (selected?: boolean) => (selected ? 46 : 40);

/**
 * Map marker, one icon per state: red trash bin = not cleaned yet, yellow clock = cleaning now,
 * green logo mark = cleaned. Its centre is the spot position: with AdvancedMarker use
 * `anchorPoint={AdvancedMarkerAnchorPoint.CENTER}`.
 */
export function SpotMarker({ status, selected }: SpotMarkerProps) {
  const d = markerSize(selected);
  const icon = Math.round(d * 0.5);
  return (
    <div
      role="img"
      aria-label={STATUS_LABEL[status]}
      className="relative animate-pop-in cursor-pointer transition-[width,height] duration-200 ease-back-out"
      style={{ width: d, height: d }}
    >
      {status === 'in_progress' && (
        <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border-[3px] border-spot-live" />
      )}
      <span
        className={clsx(
          'relative grid size-full place-items-center overflow-hidden rounded-full border-white transition-[border-width,box-shadow] duration-200',
          selected ? 'border-4 shadow-marker-selected' : 'border-[3px] shadow-marker',
          status === 'open' && 'bg-spot-open text-white',
          status === 'in_progress' && 'bg-spot-live text-spot-live-ink',
        )}
      >
        {status === 'open' && <Trash2 size={icon} strokeWidth={2.4} aria-hidden />}
        {status === 'in_progress' && <Clock size={icon} strokeWidth={2.6} aria-hidden />}
        {status === 'cleaned' && (
          <svg viewBox="0 0 100 100" aria-hidden className="size-full">
            <use href="#nq-mark" />
          </svg>
        )}
      </span>
    </div>
  );
}
