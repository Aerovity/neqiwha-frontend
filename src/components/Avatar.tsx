import clsx from 'clsx';
import { useReducedMotion } from 'motion/react';
import type { RankLevel } from '../shared/types';
import { avatarColor } from '../lib/colors';

export interface AvatarProps {
  initials: string;
  level: RankLevel;
  /** Disc diameter in px (28 / 40 / 64 / 112 on the board). The frame overflows ~30% on each side. */
  size?: number;
  /** Stable seed for the disc colour (user id). Falls back to the initials. */
  seed?: string;
  /** Leaderboard #1. */
  crown?: boolean;
  /** Set false for plain discs (ParticipantStack). */
  frame?: boolean;
  className?: string;
  /** Accessible name, e.g. the display name. Omit when the name is shown next to it. */
  label?: string;
}

const FRAME_BOX = { left: '-30%', top: '-30%', width: '160%', height: '160%' } as const;

/**
 * Initials disc + rank frame nq-fr{level}, drawn in a 160% box so a single SVG works at every size.
 * Leave ~0.3 × size of room around it (frames and wings overflow the disc).
 */
export function Avatar({ initials, level, size = 40, seed, crown, frame = true, className, label }: AvatarProps) {
  const reduce = useReducedMotion();
  const legend = frame && level === 4;
  const frameId = legend ? (reduce ? 'nq-fr4-ring-static' : 'nq-fr4-ring') : `nq-fr${level}`;
  return (
    <span
      className={clsx('relative inline-block shrink-0 align-middle', className)}
      style={{ width: size, height: size }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {legend && (
        <svg viewBox="-30 -30 160 160" className="pointer-events-none absolute overflow-visible" style={FRAME_BOX} aria-hidden>
          <use href={reduce ? '#nq-fr4-glow-static' : '#nq-fr4-glow'} />
        </svg>
      )}
      <span
        className="relative grid size-full select-none place-items-center rounded-full font-semibold leading-none text-white shadow-[inset_0_-2px_0_rgba(0,0,0,0.12)]"
        style={{
          background: avatarColor(seed ?? initials),
          fontSize: Math.max(9, Math.round(size * 0.375)),
          letterSpacing: size < 36 ? '-0.02em' : undefined,
        }}
      >
        {initials.slice(0, 2).toUpperCase()}
      </span>
      {(frame || crown) && (
        <svg viewBox="-30 -30 160 160" className="pointer-events-none absolute overflow-visible" style={FRAME_BOX} aria-hidden>
          {frame && <use href={`#${frameId}`} />}
          {crown && <use href="#nq-crown" />}
        </svg>
      )}
    </span>
  );
}
