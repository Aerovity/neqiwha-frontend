import clsx from 'clsx';
import type { PublicUser } from '../shared/types';
import { Avatar } from './Avatar';

export interface ParticipantStackProps {
  users: PublicUser[];
  max?: number;
  size?: number;
  /** Ring colour matching the background behind the stack. */
  ringClassName?: string;
  className?: string;
}

/** Overlapping plain avatar discs + "+N". */
export function ParticipantStack({ users, max = 5, size = 34, ringClassName = 'ring-surface', className }: ParticipantStackProps) {
  const shown = users.slice(0, max);
  const extra = users.length - shown.length;
  return (
    <div className={clsx('flex items-center', className)} aria-label={`${users.length} ${users.length === 1 ? 'hero' : 'heroes'}`} role="img">
      {shown.map((u, i) => (
        <span
          key={u.id}
          className={clsx('rounded-full ring-[2.5px]', ringClassName)}
          style={{ marginLeft: i ? -size * 0.28 : 0, zIndex: shown.length - i }}
        >
          <Avatar initials={u.initials} level={u.level} seed={u.id} size={size} frame={false} />
        </span>
      ))}
      {extra > 0 && (
        <span
          className={clsx('grid place-items-center rounded-full bg-paper font-display font-bold text-muted ring-[2.5px] tabular-nums', ringClassName)}
          style={{ width: size, height: size, marginLeft: -size * 0.28, fontSize: size * 0.38 }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
