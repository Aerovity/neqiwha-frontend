import clsx from 'clsx';
import { ChevronRight, Sticker } from 'lucide-react';
import type { Voucher } from '../shared/types';
import { formatDate } from '../lib/format';
import { Ticket } from './Ticket';
import { CoinIcon } from './icons';

export interface VoucherTicketProps {
  voucher: Voucher;
  /** Small wallet-list row instead of the full ticket. */
  compact?: boolean;
  className?: string;
}

/** Partner voucher: HB Kisa Manga header, item, big code, issued date, status; used = dimmed + stamp. */
export function VoucherTicket({ voucher, compact, className }: VoucherTicketProps) {
  const used = voucher.status === 'used';
  if (compact) return <VoucherRow voucher={voucher} className={className} />;

  return (
    <div className={clsx('relative mx-auto w-full max-w-[360px]', className)}>
      <Ticket
        className={clsx('transition-[filter,opacity] duration-300', used && 'opacity-60 grayscale-[.85]')}
        topClassName="bg-[linear-gradient(160deg,#0B3D2E_0%,#04140D_85%)] text-white"
        top={
          <div className="relative flex items-center gap-4 overflow-hidden px-6 pb-7 pt-7">
            <StickerArt size={72} />
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-mist">Partner voucher</div>
              <div className="mt-1 truncate font-display text-[26px] font-bold leading-tight">{voucher.partner}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-[13px] text-mist">
                <CoinIcon size={16} /> <span className="tabular-nums">{voucher.cost}</span> coins
              </div>
            </div>
          </div>
        }
        bottom={
          <div className="flex flex-col gap-5 px-6 pb-7 pt-7">
            <div>
              <div className="text-[13px] font-medium text-muted">Item</div>
              <div className="font-display text-2xl font-bold leading-tight">{voucher.title}</div>
            </div>
            <div className="rounded-md bg-paper py-4 text-center shadow-[inset_0_0_0_1.5px_var(--color-line)]">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Voucher code</div>
              <div className="mt-1 font-display text-[32px] font-bold leading-none tracking-[0.1em] tabular-nums">{voucher.code}</div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Issued</dt>
                <dd className="font-semibold">{formatDate(voucher.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Status</dt>
                <dd>
                  <VoucherStatus used={used} />
                </dd>
              </div>
            </dl>
          </div>
        }
      />
      {used && voucher.usedAt && (
        <div
          aria-label={`Used on ${formatDate(voucher.usedAt)}`}
          className="pointer-events-none absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 -rotate-12 animate-pop-in whitespace-nowrap rounded-md border-[3px] border-ink/75 bg-surface/70 px-4 py-1.5 text-center font-display text-lg font-extrabold uppercase leading-tight tracking-[0.08em] text-ink/80"
        >
          Used on {formatDate(voucher.usedAt)}
        </div>
      )}
    </div>
  );
}

function VoucherStatus({ used }: { used: boolean }) {
  return used ? (
    <span className="inline-flex h-6 items-center rounded-pill bg-line-soft px-2.5 text-xs font-semibold text-muted">Used</span>
  ) : (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-pill bg-brand-soft px-2.5 text-xs font-semibold text-brand-strong">
      <span className="size-2 rounded-full bg-brand" /> Active
    </span>
  );
}

function VoucherRow({ voucher, className }: { voucher: Voucher; className?: string }) {
  const used = voucher.status === 'used';
  return (
    <div className={clsx('flex items-center gap-3.5 rounded-card bg-surface p-3 pr-4 shadow-card', used && 'opacity-60', className)}>
      <StickerArt size={56} muted={used} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{voucher.title}</div>
        <div className="truncate text-[13px] text-muted">{voucher.partner}</div>
        <div className="mt-1 text-xs text-muted">
          {used && voucher.usedAt ? `Used on ${formatDate(voucher.usedAt)}` : `Issued ${formatDate(voucher.createdAt)}`}
        </div>
      </div>
      {!used && <VoucherStatus used={false} />}
      <ChevronRight size={20} className="shrink-0 text-muted" />
    </div>
  );
}

/** Sticker illustration (lucide Sticker on a sunny tile). */
export function StickerArt({ size = 72, muted }: { size?: number; muted?: boolean }) {
  return (
    <span
      aria-hidden
      className={clsx(
        'relative grid shrink-0 place-items-center rounded-[22%]',
        muted
          ? 'bg-line-soft text-muted'
          : 'bg-[radial-gradient(circle_at_30%_25%,#FFE58A_0%,#F2B705_60%,#D99F00_100%)] text-ink shadow-[0_8px_18px_-8px_rgba(192,138,0,0.8)]',
      )}
      style={{ width: size, height: size }}
    >
      <span className="grid rotate-[-10deg] place-items-center rounded-[26%] bg-white p-[14%] shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
        <Sticker size={size * 0.42} strokeWidth={2.1} />
      </span>
      {!muted && <span className="absolute right-[12%] top-[10%] size-[10%] rounded-full bg-white/90" />}
    </span>
  );
}
