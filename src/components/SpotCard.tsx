import clsx from 'clsx';
import { Link } from 'react-router';
import { ChevronRight, Clock, Users } from 'lucide-react';
import type { EventPin } from '../shared/types';
import { formatMeetTime } from '../lib/format';
import { StatusChip } from './StatusChip';

export interface SpotCardProps {
  pin: EventPin;
  onClick?: () => void;
  /** Renders as a Link. */
  to?: string;
  className?: string;
}

/** Compact spot row: thumb, title (2 lines), status, heroes, meeting time. */
export function SpotCard({ pin, onClick, to, className }: SpotCardProps) {
  const cls = clsx(
    'flex w-full items-center gap-3 rounded-card bg-surface p-3 text-left shadow-card transition-transform duration-150',
    (to || onClick) && 'active:scale-[.98] hover:shadow-[0_2px_4px_rgba(4,20,13,0.06),0_8px_20px_rgba(4,20,13,0.08)]',
    className,
  );
  const body = (
    <>
      <img
        src={pin.thumbUrl}
        alt={`Photo of ${pin.title}`}
        loading="lazy"
        className="size-[76px] shrink-0 rounded-md bg-line-soft object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">{pin.title}</h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
          <StatusChip status={pin.status} size="sm" />
          {pin.isPublic && (
            <>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Users size={14} /> {pin.participantCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock size={14} /> {formatMeetTime(pin.startsAt)}
              </span>
            </>
          )}
        </div>
      </div>
      {(to || onClick) && <ChevronRight size={20} className="shrink-0 text-muted/70" />}
    </>
  );
  if (to) return <Link to={to} className={cls}>{body}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cls}>{body}</button>;
  return <div className={cls}>{body}</div>;
}
