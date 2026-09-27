import clsx from 'clsx';
import { motion } from 'motion/react';
import { Clock, MapPin, Navigation, UserRound, Users, X } from 'lucide-react';
import type { EventPin } from '../shared/types';
import { formatMeetTime, plural } from '../lib/format';
import { formatDistance } from '../lib/geo';
import { StatusChip } from './StatusChip';
import { Button, buttonClass } from './Button';

export interface SpotPreviewCardProps {
  pin: EventPin;
  distanceKm?: number | null;
  onDetails: () => void;
  directionsHref: string;
  onClose?: () => void;
  className?: string;
}

/** Floating card over the map for the selected pin. Motion root: wrap in AnimatePresence (key = pin.id) for exit. */
export function SpotPreviewCard({ pin, distanceKm, onDetails, directionsHref, onClose, className }: SpotPreviewCardProps) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className={clsx('relative rounded-card bg-surface p-3 shadow-lift', className)}
    >
      <div className="flex gap-3">
        <button type="button" onClick={onDetails} className="shrink-0 overflow-hidden rounded-md active:scale-[.97] transition-transform" aria-label={`Open ${pin.title}`}>
          <img src={pin.thumbUrl} alt={`Photo of ${pin.title}`} loading="lazy" className="size-[92px] bg-line-soft object-cover" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 pr-8">
          <StatusChip status={pin.status} size="sm" className="self-start" />
          <h3 className="line-clamp-2 text-base font-semibold leading-snug">{pin.title}</h3>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[13px] text-muted">
            {pin.isPublic ? (
              <>
                <span className="inline-flex items-center gap-1">
                  <Users size={14} /> {plural(pin.participantCount, 'hero', 'heroes')}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={14} /> {formatMeetTime(pin.startsAt)}
                </span>
              </>
            ) : (
              pin.spottedBy && (
                <span className="inline-flex min-w-0 items-center gap-1">
                  <UserRound size={14} className="shrink-0" /> <span className="truncate">by {pin.spottedBy}</span>
                </span>
              )
            )}
            {distanceKm != null && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={14} /> {formatDistance(distanceKm)}
              </span>
            )}
          </div>
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-1.5 top-1.5 grid size-10 place-items-center rounded-full text-muted transition hover:bg-paper active:scale-90"
        >
          <X size={18} strokeWidth={2.4} />
        </button>
      )}
      <div className="mt-3 flex gap-2">
        <Button className="flex-1" onClick={onDetails}>
          Details
        </Button>
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass({ variant: 'secondary', className: 'flex-1' })}
        >
          <Navigation size={18} /> Directions
        </a>
      </div>
    </motion.div>
  );
}
