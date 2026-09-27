import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { MapPin } from 'lucide-react';
import { useGoBack } from '../lib/history';
import { useEvent, useMe } from '../lib/queries';
import { Button, CheckedInSuccess, QrTicket, ScreenHeader, Skeleton, leafConfetti } from '../components';
import { useWakeLock } from './parts/useWakeLock';

export function MyQrScreen() {
  const me = useMe().data;
  const goBack = useGoBack();
  const [params] = useSearchParams();
  const spotId = params.get('spot') ?? undefined;
  const event = useEvent(spotId, 3000);
  const spot = spotId && event.data ? event.data : null;
  const checkedIn = !!spot?.viewer?.isCheckedIn;
  useWakeLock();

  const wasCheckedIn = useRef<boolean | null>(null);
  useEffect(() => {
    if (!spot) return;
    if (wasCheckedIn.current === false && checkedIn) {
      navigator.vibrate?.([60, 40, 120]);
      leafConfetti({ y: 0.35 });
    }
    wasCheckedIn.current = checkedIn;
  }, [spot, checkedIn]);

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[radial-gradient(120%_70%_at_50%_0%,#17744C_0%,#0B3D2E_45%,#04140D_100%)] text-white">
      <span aria-hidden className="pointer-events-none absolute -left-24 top-40 size-72 rounded-full bg-sprout/10 blur-3xl" />
      <ScreenHeader
        transparent
        back={spotId ? `/spots/${spotId}` : true}
        title={checkedIn ? undefined : 'My check-in QR'}
      />

      <main
        className="relative flex flex-1 flex-col items-center justify-center gap-5 px-5 pt-[calc(env(safe-area-inset-top)+64px)]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)' }}
      >
        {checkedIn && spot ? (
          <div className="w-full max-w-[360px] animate-pop-in rounded-[28px] bg-surface px-6 pb-7 pt-9 text-ink shadow-lift">
            <CheckedInSuccess
              body={
                <>
                  Rewards land when <span className="font-semibold text-ink">{spot.title}</span> is verified. Yallah, grab
                  a bag!
                </>
              }
              action={
                <Button size="lg" full className="mt-1" onClick={() => goBack(`/spots/${spot.id}`)}>
                  Back to the spot
                </Button>
              }
            />
          </div>
        ) : me ? (
          <>
            <QrTicket
              className="w-full"
              displayName={me.displayName}
              initials={me.initials}
              level={me.level}
              qrCode={me.qrCode}
              seed={me.id}
              subtitle={spot ? <SpotLabel title={spot.title} /> : spotId && event.isPending ? 'Loading the spot…' : undefined}
            />
            {spot && spot.status !== 'cleaned' && (
              <p role="status" className="flex items-center gap-2.5 text-sm font-medium text-mist">
                <span className="relative flex size-2.5">
                  <span className="absolute inset-0 animate-pulse-ring rounded-full bg-sprout" />
                  <span className="relative size-2.5 rounded-full bg-sprout" />
                </span>
                Waiting for the organizer to scan you…
              </p>
            )}
            {spot?.status === 'cleaned' && (
              <p className="text-center text-sm text-mist">This spot is already cleaned — see you at the next one.</p>
            )}
          </>
        ) : (
          <Skeleton className="h-[560px] w-full max-w-[360px] rounded-[26px]! opacity-20" />
        )}
      </main>
    </div>
  );
}

function SpotLabel({ title }: { title: string }) {
  return (
    <span className="inline-flex items-start gap-1.5">
      <MapPin size={14} className="mt-[3px] shrink-0 text-sprout" aria-hidden />
      <span className="line-clamp-2">{title}</span>
    </span>
  );
}
