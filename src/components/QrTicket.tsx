import clsx from 'clsx';
import type { ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Sun } from 'lucide-react';
import type { RankLevel } from '../shared/types';
import { RANKS } from '../shared/ranks';
import { formatQr } from '../lib/format';
import { Avatar } from './Avatar';
import { UserName } from './UserName';
import { RankBadge } from './RankBadge';
import { Ticket } from './Ticket';

export interface QrTicketProps {
  displayName: string;
  initials: string;
  level: RankLevel;
  /** Raw code "7F3K9Q2M" (payload becomes "naqiwha:7F3K9Q2M"). */
  qrCode: string;
  /** Avatar colour seed (user id). */
  seed?: string;
  /** e.g. the spot title when opened from a spot. */
  subtitle?: ReactNode;
  className?: string;
}

/** Luma-style personal check-in ticket. */
export function QrTicket({ displayName, initials, level, qrCode, seed, subtitle, className }: QrTicketProps) {
  return (
    <Ticket
      className={clsx('mx-auto max-w-[360px]', className)}
      topClassName="bg-[linear-gradient(165deg,#17744C_0%,#0B3D2E_55%,#04140D_100%)] text-white"
      top={
        <div className="relative flex flex-col items-center gap-3 overflow-hidden px-6 pb-8 pt-9 text-center">
          <span aria-hidden className="absolute -right-10 -top-12 size-44 rounded-full bg-sprout/10 blur-2xl" />
          <span className="relative my-2 grid place-items-center">
            <span aria-hidden className="absolute size-[98px] rounded-full bg-[#F4FBF2] shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
            <Avatar initials={initials} level={level} seed={seed} size={76} />
          </span>
          <UserName name={displayName} level={level} tone="dark" className="max-w-full text-[22px]" />
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-mist">
            <RankBadge level={level} size={20} decorative />
            {RANKS[level].name}
          </span>
          {subtitle && (
            <span className="mt-1 line-clamp-2 max-w-full rounded-md bg-white/8 px-3 py-1.5 text-[13px] font-medium text-white/90 ring-1 ring-white/10">
              {subtitle}
            </span>
          )}
        </div>
      }
      bottom={
        <div className="flex flex-col items-center gap-4 px-6 pb-7 pt-7">
          <div className="rounded-[18px] bg-white p-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
            <QRCodeSVG
              value={`naqiwha:${qrCode}`}
              size={232}
              level="M"
              marginSize={0}
              bgColor="#FFFFFF"
              fgColor="#0D1B14"
              title={`Check-in code ${formatQr(qrCode)}`}
              style={{ width: '100%', height: 'auto', maxWidth: 232, display: 'block' }}
            />
          </div>
          <div className="font-display text-[34px] font-bold leading-none tracking-[0.12em] text-ink tabular-nums">
            {formatQr(qrCode)}
          </div>
          <p className="flex items-center gap-2 text-center text-[13px] leading-snug text-muted">
            <Sun size={16} className="shrink-0 text-coin-ink" />
            Show this to the organizer. Turn your brightness up.
          </p>
        </div>
      }
    />
  );
}
