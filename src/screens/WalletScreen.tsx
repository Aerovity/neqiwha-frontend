import { useMemo } from 'react';
import { Link } from 'react-router';
import { Wallet } from 'lucide-react';
import { EmptyState, ScreenHeader, Skeleton, VoucherTicket } from '../components';
import { useVouchers } from '../lib/queries';

export function WalletScreen() {
  const vouchers = useVouchers();

  const sorted = useMemo(() => {
    if (!vouchers.data) return [];
    return [...vouchers.data].sort((a, b) => {
      if (a.status !== b.status) return a.status === 'active' ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [vouchers.data]);

  return (
    <div className="min-h-dvh bg-paper">
      <ScreenHeader back="/profile" title="Wallet" />

      <div className="px-4 pt-2" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}>
        {vouchers.isPending && (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map(i => (
              <Skeleton key={i} className="h-[88px] rounded-card!" />
            ))}
          </div>
        )}
        {vouchers.isError && (
          <p className="rounded-card bg-surface p-6 text-center text-[15px] text-muted shadow-card">
            Couldn&apos;t load your vouchers. Try again in a moment.
          </p>
        )}
        {vouchers.isSuccess && sorted.length === 0 && (
          <EmptyState
            icon={<Wallet size={34} />}
            title="No vouchers yet"
            body="Cleanups earn coins, coins get stickers."
            action={
              <Link to="/shop" className="font-semibold text-brand">
                Browse the shop
              </Link>
            }
          />
        )}
        {vouchers.isSuccess && sorted.length > 0 && (
          <ul className="flex flex-col gap-3">
            {sorted.map(v => (
              <li key={v.id}>
                <Link to={`/wallet/${v.id}`} className="block transition-transform active:scale-[.98]">
                  <VoucherTicket voucher={v} compact />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
