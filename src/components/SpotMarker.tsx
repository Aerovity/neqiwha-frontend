import type { EventStatus } from '../shared/types';
import { STATUS_LABEL } from './StatusChip';

export interface SpotMarkerProps {
  status: EventStatus;
  /** Open and in-progress markers grow with the number of participants. */
  participantCount?: number;
  selected?: boolean;
}

/**
 * Marker art in `public/brand/markers/`. Each SVG is a disc of diameter `disc` drawn at (4, 0) inside a
 * `disc + 8` square, with the spare room holding its drop shadow.
 */
const ICONS: Record<EventStatus, { src: string; disc: number }> = {
  open: { src: '/brand/markers/not-cleaned.svg', disc: 50 },
  in_progress: { src: '/brand/markers/cleaning.svg', disc: 65 },
  cleaned: { src: '/brand/markers/cleaned.svg', disc: 50 },
};

/**
 * Disc diameter in px. Open and in-progress spots grow by 5 px per extra participant (36 px alone, 68 px cap);
 * cleaned spots stay small. Selected markers are 15% bigger.
 */
export const markerSize = (status: EventStatus, participantCount = 1, selected?: boolean) => {
  const base = status === 'cleaned' ? 36 : Math.min(68, 36 + 5 * (Math.max(1, participantCount) - 1));
  return Math.round(selected ? base * 1.15 : base);
};

/**
 * Map marker, one icon per state: red trash bin = not cleaned yet, green broom = cleaning now,
 * dark green leaf = cleaned. Its centre is the spot position: with AdvancedMarker use
 * `anchorPoint={AdvancedMarkerAnchorPoint.CENTER}`.
 */
export function SpotMarker({ status, participantCount = 1, selected }: SpotMarkerProps) {
  const d = markerSize(status, participantCount, selected);
  const { src, disc } = ICONS[status];
  const k = d / disc;
  return (
    <div
      role="img"
      aria-label={STATUS_LABEL[status]}
      className="relative animate-pop-in cursor-pointer transition-[width,height] duration-200 ease-back-out"
      style={{ width: d, height: d }}
    >
      {status === 'in_progress' && (
        <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border-[3px] border-[#00CF5C]" />
      )}
      <img
        src={src}
        alt=""
        draggable={false}
        className="pointer-events-none absolute top-0 max-w-none select-none transition-[left,width,height] duration-200 ease-back-out"
        style={{ left: -4 * k, width: (disc + 8) * k, height: (disc + 8) * k }}
      />
    </div>
  );
}
