import { Navigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { SearchX } from 'lucide-react';
import { ButtonLink, EmptyState, HoldButton, ScreenHeader, Skeleton, VoucherTicket } from '../components';
import { ApiError } from '../lib/api';
import { useConfig, useUseVoucher, useVouchers } from '../lib/queries';

export function VoucherScreen() {
  const { id = '' } = useParams();
  const config = useConfig();
  const vouchers = useVouchers();
  const markUsed = useUseVoucher();
  const partner = config.data?.partnerName ?? 'HB Kisa Manga';

  if (vouchers.isPending) {
    return (
      <div className="min-h-dvh bg-paper">
        <ScreenHeader back="/wallet" title="Voucher" />
        <Skeleton className="mx-4 mt-4 h-[420px] rounded-card!" />
      </div>
    );
  }

  const voucher = vouchers.data?.find(v => v.id === id);
  if (!voucher) {
    if (vouchers.isSuccess) return <Navigate to="/wallet" replace />;
    return (
      <div className="min-h-dvh bg-paper">
        <ScreenHeader back="/wallet" title="Voucher" />
        <EmptyState
          icon={<SearchX size={36} />}
          title="Voucher not found"
          action={<ButtonLink to="/wallet">Back to wallet</ButtonLink>}
        />
      </div>
    );
  }

  const used = voucher.status === 'used';

  const onHoldComplete = () => {
    markUsed.mutate(voucher.id, {
      onSuccess: () => toast.success('Voucher marked as used'),
      onError: err => toast.error(err instanceof ApiError ? err.message : 'Could not mark as used.'),
    });
  };

  return (
    <div className="min-h-dvh bg-paper">
      <ScreenHeader back="/wallet" title="Voucher" />

      <main
        className="flex flex-col items-center gap-6 px-4 pt-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)' }}
      >
        <VoucherTicket voucher={voucher} />
        <p className="max-w-sm text-center text-[15px] leading-relaxed text-muted">
          Show this screen at the {partner} counter.
        </p>
        {!used && (
          <div className="w-full max-w-[360px]">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.08em] text-muted">Staff only</p>
            <HoldButton
              label="Hold to mark as used"
              duration={1200}
              loading={markUsed.isPending}
              onComplete={onHoldComplete}
            />
          </div>
        )}
      </main>
    </div>
  );
}
