import { useState } from 'react';
import { toast } from 'sonner';
import { Lock, Sparkles, Store } from 'lucide-react';
import {
  ButtonLink,
  CoinPill,
  ConfirmSheet,
  ScreenHeader,
  Sheet,
  ShopItemCard,
  Skeleton,
  ItemArt,
  TAB_BAR_SPACE,
  TabBar,
  VoucherTicket,
} from '../components';
import { ApiError } from '../lib/api';
import { useMe, usePurchase, useShop } from '../lib/queries';
import type { ShopItem, Voucher } from '../shared/types';

/** Groups items by partner, keeping the catalogue order. */
function byPartner(items: ShopItem[]): [string, ShopItem[]][] {
  const groups = new Map<string, ShopItem[]>();
  for (const item of items) groups.set(item.partner, [...(groups.get(item.partner) ?? []), item]);
  return [...groups];
}

export function ShopScreen() {
  const me = useMe();
  const shop = useShop();
  const purchase = usePurchase();
  const coins = me.data?.coins ?? 0;

  const [pending, setPending] = useState<ShopItem | null>(null);
  const [fresh, setFresh] = useState<Voucher | null>(null);

  const buy = () => {
    if (!pending) return;
    purchase.mutate(pending.id, {
      onSuccess: res => {
        setPending(null);
        setFresh(res.voucher);
        toast.success('Reward secured! Show it at the counter.');
      },
      onError: err => toast.error(err instanceof ApiError ? err.message : 'Purchase failed. Try again.'),
    });
  };

  return (
    <div className="min-h-dvh bg-paper" style={{ paddingBottom: TAB_BAR_SPACE }}>
      <ScreenHeader title="Shop" right={me.data ? <CoinPill coins={coins} size="sm" /> : undefined} />

      <div className="flex flex-col gap-4 px-4 pt-2">
        <section className="relative overflow-hidden rounded-card bg-[linear-gradient(145deg,#0B3D2E_0%,#04140D_72%)] p-5 text-white shadow-lift">
          <span aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-32 rounded-full bg-sprout/15 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-[22%] bg-white/10 ring-1 ring-white/15">
              <Store size={28} className="text-sprout" />
            </span>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-mist">Partner shops</div>
              <h2 className="font-display text-[26px] font-bold leading-tight">Spend it local</h2>
              <p className="mt-1 text-sm text-mist">Turn cleanup coins into coffee, books, cinema and more.</p>
            </div>
          </div>
        </section>

        {shop.isPending && (
          <>
            <Skeleton className="h-44 rounded-card!" />
            <Skeleton className="h-44 rounded-card!" />
          </>
        )}
        {shop.isError && (
          <p className="rounded-card bg-surface p-6 text-center text-[15px] text-muted shadow-card">
            Couldn&apos;t load rewards. Check your connection and try again.
          </p>
        )}
        {shop.isSuccess &&
          byPartner(shop.data).map(([partner, items]) => (
            <section key={partner} className="flex flex-col gap-3">
              <h2 className="mt-2 flex items-center gap-2 px-1 font-display text-lg font-bold">
                <Store size={18} className="text-brand" />
                {partner}
              </h2>
              {items.map(item => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  coins={coins}
                  loading={purchase.isPending && pending?.id === item.id}
                  onGet={() => setPending(item)}
                />
              ))}
            </section>
          ))}

        <article className="rounded-card bg-surface p-4 shadow-card">
          <div className="flex gap-4 opacity-75">
            <ItemArt emoji="🎁" tone="sun" size={72} muted />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Coming soon</div>
              <h3 className="mt-0.5 font-display text-[22px] font-bold leading-tight text-muted">More rewards soon</h3>
              <p className="mt-1 text-[13.5px] leading-snug text-muted">New partner perks are on the way — keep cleaning!</p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <span className="inline-flex h-10 items-center gap-2 rounded-pill bg-line-soft px-4 text-sm font-semibold text-muted">
              <Lock size={16} />
              Locked
            </span>
          </div>
        </article>
      </div>

      <TabBar />

      <ConfirmSheet
        open={!!pending}
        title={`Spend ${pending?.cost ?? 0} coins on ${pending?.title ?? 'this reward'}?`}
        body={
          pending ? (
            <>
              Your balance will drop to{' '}
              <span className="font-semibold tabular-nums text-ink">{Math.max(0, coins - pending.cost)}</span> coins. The
              voucher lands in your wallet instantly.
            </>
          ) : undefined
        }
        confirmLabel="Confirm"
        tone="gold"
        icon={
          pending ? (
            <span className="grid size-16 place-items-center rounded-full bg-coin-soft">
              <Sparkles size={28} className="text-coin-deep" />
            </span>
          ) : undefined
        }
        loading={purchase.isPending}
        onConfirm={buy}
        onClose={() => !purchase.isPending && setPending(null)}
      />

      <Sheet open={!!fresh} onClose={() => setFresh(null)} title="You got it! 🎁">
        <div className="flex flex-col items-center gap-5">
          {fresh && <VoucherTicket voucher={fresh} className="pointer-events-none" />}
          <p className="max-w-sm text-center text-[15px] text-muted">Show this voucher at {fresh?.partner} to claim your reward.</p>
          <ButtonLink to="/wallet" size="lg" full onClick={() => setFresh(null)}>
            Open wallet
          </ButtonLink>
          <button type="button" className="text-sm font-medium text-muted" onClick={() => setFresh(null)}>
            Keep browsing
          </button>
        </div>
      </Sheet>
    </div>
  );
}
