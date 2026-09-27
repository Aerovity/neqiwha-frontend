import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Navigate, useParams } from 'react-router';
import { Scanner, type IScannerError } from '@yudiel/react-qr-scanner';
import { toast } from 'sonner';
import clsx from 'clsx';
import { CameraOff, Check, Keyboard, SearchX, Sparkles } from 'lucide-react';
import { ApiError } from '../lib/api';
import { useGoBack } from '../lib/history';
import { useCheckin, useEvent } from '../lib/queries';
import { plural } from '../lib/format';
import type { CheckinResult, EventDetail, Participant } from '../shared/types';
import {
  Avatar,
  Button,
  ButtonLink,
  EmptyState,
  Field,
  ScreenHeader,
  Sheet,
  Skeleton,
  UserName,
} from '../components';
import { ScannerFrame, type ScanFlash } from './parts/ScannerFrame';
import { cleanCode, formatCodeInput } from './parts/qrCode';

const SAME_CODE_COOLDOWN = 4000;

export function CheckinScreen() {
  const { id = '' } = useParams();
  const event = useEvent(id);

  if (event.isPending) return <CheckinSkeleton />;
  if (event.isError || !event.data) {
    const missing = event.error instanceof ApiError && event.error.status === 404;
    return (
      <div className="min-h-dvh">
        <ScreenHeader back="/" title="Check people in" />
        <EmptyState
          icon={<SearchX size={36} />}
          title={missing ? "This spot doesn't exist anymore." : "We couldn't load this spot."}
          body={missing ? undefined : 'Check your connection and try again.'}
          action={
            missing ? (
              <ButtonLink to="/">Back to the map</ButtonLink>
            ) : (
              <Button onClick={() => event.refetch()} loading={event.isFetching}>
                Try again
              </Button>
            )
          }
        />
      </div>
    );
  }
  if (!event.data.viewer?.isOrganizer) return <Navigate to={`/spots/${id}`} replace />;
  if (event.data.status === 'cleaned') {
    return (
      <div className="min-h-dvh">
        <ScreenHeader back={`/spots/${id}`} title="Check people in" />
        <EmptyState
          icon={<Sparkles size={36} />}
          title="Saha! This spot is already cleaned."
          body="Check-in is closed. The heroes who were checked in got their rewards."
          action={<ButtonLink to={`/spots/${id}`}>Back to the spot</ButtonLink>}
        />
      </div>
    );
  }
  return <CheckinBody event={event.data} />;
}

function CheckinBody({ event }: { event: EventDetail }) {
  const goBack = useGoBack();
  const checkin = useCheckin(event.id);
  const [cameraError, setCameraError] = useState<string | null>(() =>
    navigator.mediaDevices ? null : 'unsupported',
  );
  const [manualOpen, setManualOpen] = useState(false);
  const [flash, setFlash] = useState<ScanFlash>(null);
  const [recent, setRecent] = useState<string | null>(null);
  const last = useRef<{ code: string; at: number } | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const showFlash = (f: ScanFlash) => {
    clearTimeout(flashTimer.current);
    setFlash(f);
    flashTimer.current = setTimeout(() => setFlash(null), 900);
  };

  const busy = checkin.isPending;
  const submit = (raw: string, opts?: { onDone?: (ok: boolean) => void }) => {
    checkin.mutate(raw, {
      onSuccess: (res: CheckinResult) => {
        const { user } = res.participant;
        const icon = <Avatar initials={user.initials} level={user.level} seed={user.id} size={22} frame={false} />;
        if (res.alreadyCheckedIn) {
          toast(`${user.displayName} is already checked in`, { icon });
          showFlash('already');
        } else {
          navigator.vibrate?.(60);
          toast.success(`${user.displayName} checked in ✓`, { icon });
          showFlash('ok');
          setRecent(user.id);
        }
        opts?.onDone?.(true);
      },
      onError: err => {
        toast.error(err instanceof ApiError ? err.message : 'Check-in failed. Try again.');
        showFlash('error');
        opts?.onDone?.(false);
      },
    });
  };

  const onScan = (raw: string | undefined) => {
    if (!raw || busy) return;
    const code = cleanCode(raw);
    const now = Date.now();
    if (last.current && last.current.code === code && now - last.current.at < SAME_CODE_COOLDOWN) return;
    last.current = { code, at: now };
    submit(raw);
  };

  const onCameraError = (err: IScannerError) => setCameraError(err.kind);

  const total = event.participants.length;
  const done = () => goBack(`/spots/${event.id}`);

  return (
    <div className="flex min-h-dvh flex-col bg-night">
      <ScreenHeader
        transparent
        back={`/spots/${event.id}`}
        title="Check people in"
        right={
          <Button size="sm" variant="light" onClick={done} className="mr-1">
            Done
          </Button>
        }
      />

      {cameraError ? (
        <CameraFallback event={event} busy={busy} onSubmit={submit} />
      ) : (
        <section aria-label="QR scanner" className="relative h-[60dvh] min-h-[340px] shrink-0 overflow-hidden bg-night">
          <Scanner
            onScan={codes => onScan(codes[0]?.rawValue)}
            onError={onCameraError}
            constraints={{ facingMode: 'environment' }}
            formats={['qr_code']}
            allowMultiple
            scanDelay={600}
            paused={busy}
            sound={false}
            components={{ finder: false, torch: true, onOff: false, zoom: false }}
            styles={{ container: { position: 'absolute', inset: 0, width: '100%', height: '100%' }, video: { objectFit: 'cover' } }}
          />
          <ScannerFrame flash={flash} paused={busy} />
          <p
            role="status"
            className="absolute inset-x-0 bottom-12 text-center text-[15px] font-medium text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]"
          >
            {busy ? 'Checking…' : 'Point at a hero’s QR'}
          </p>
        </section>
      )}

      <section
        className={clsx(
          'relative z-10 flex flex-1 flex-col rounded-t-sheet bg-surface px-5 pt-5 shadow-sheet',
          !cameraError && '-mt-7',
        )}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
      >
        <span aria-hidden className="mx-auto -mt-2 mb-4 h-1.5 w-11 rounded-pill bg-line" />
        <CheckedInCount checkedIn={event.checkedInCount} total={total} />
        {!cameraError && (
          <Button variant="secondary" full className="mt-4" icon={<Keyboard size={20} />} onClick={() => setManualOpen(true)}>
            Enter code manually
          </Button>
        )}
        <ParticipantList participants={event.participants} recent={recent} />
      </section>

      <Sheet open={manualOpen} onClose={() => setManualOpen(false)} title="Enter code manually" dismissible={!busy}>
        <p className="mb-5 text-center text-[15px] text-muted">Type the 8-character code under their QR.</p>
        <CodeForm busy={busy} onSubmit={submit} onSuccess={() => setManualOpen(false)} autoFocus />
      </Sheet>
    </div>
  );
}

function CameraFallback({
  event,
  busy,
  onSubmit,
}: {
  event: EventDetail;
  busy: boolean;
  onSubmit: (raw: string, opts?: { onDone?: (ok: boolean) => void }) => void;
}) {
  return (
    <section
      className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,#17744C_0%,#0B3D2E_55%,#04140D_100%)] px-5 pb-10 text-white"
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 72px)' }}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
          <CameraOff size={22} className="text-mist" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-xl font-bold leading-tight">Camera unavailable</h2>
          <p className="text-sm text-mist">Type the code under their QR.</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-1 text-xs text-mist/80">{event.title}</p>
      <div className="mt-5 rounded-card bg-surface p-4 text-ink shadow-lift">
        <CodeForm busy={busy} onSubmit={onSubmit} />
      </div>
    </section>
  );
}

function CodeForm({
  busy,
  onSubmit,
  onSuccess,
  autoFocus,
}: {
  busy: boolean;
  onSubmit: (raw: string, opts?: { onDone?: (ok: boolean) => void }) => void;
  onSuccess?: () => void;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const code = cleanCode(value);
  const ready = code.length === 8;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ready) {
      setError('Codes have 8 characters, like 7F3K-9Q2M.');
      return;
    }
    setError(null);
    onSubmit(code, {
      onDone: ok => {
        if (!ok) return;
        setValue('');
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Field
        label="Check-in code"
        placeholder="XXXX-XXXX"
        value={value}
        onChange={e => {
          setValue(formatCodeInput(e.target.value));
          setError(null);
        }}
        maxLength={9}
        counter={false}
        error={error}
        autoComplete="off"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        data-autofocus={autoFocus || undefined}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '0.16em',
          textAlign: 'center',
          height: 60,
        }}
      />
      <Button type="submit" size="lg" full loading={busy} disabled={!ready}>
        Check in
      </Button>
    </form>
  );
}

function CheckedInCount({ checkedIn, total }: { checkedIn: number; total: number }) {
  const pct = total ? Math.min(100, (checkedIn / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[22px] font-bold leading-tight tabular-nums" aria-live="polite">
          <span className="text-brand">{checkedIn}</span> of {total} checked in
        </h2>
        <span className="shrink-0 text-sm text-muted">{plural(total, 'hero', 'heroes')}</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-pill bg-xp-track" aria-hidden>
        <div className="h-full rounded-pill bg-brand transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ParticipantList({ participants, recent }: { participants: Participant[]; recent: string | null }) {
  const sorted = useMemo(
    () =>
      [...participants].sort(
        (a, b) =>
          Number(b.checkedIn) - Number(a.checkedIn) ||
          Number(b.role === 'organizer') - Number(a.role === 'organizer') ||
          a.user.displayName.localeCompare(b.user.displayName),
      ),
    [participants],
  );
  return (
    <ul className="mt-4 divide-y divide-line-soft" aria-label="Participants">
      {sorted.map(p => (
        <li
          key={p.user.id}
          className={clsx('flex items-center gap-3 py-2.5', recent === p.user.id && 'animate-pop-in')}
        >
          <span className="p-1.5">
            <Avatar initials={p.user.initials} level={p.user.level} seed={p.user.id} size={36} />
          </span>
          <div className="min-w-0 flex-1">
            <UserName name={p.user.displayName} level={p.user.level} className="text-[15px]" />
            {p.role === 'organizer' && <div className="text-xs text-muted">Organizer</div>}
          </div>
          {p.checkedIn ? (
            <span className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-pill bg-brand-soft pl-1.5 pr-3 text-[13px] font-semibold text-brand-strong">
              <span className="grid size-5 place-items-center rounded-full bg-brand text-white">
                <Check size={13} strokeWidth={3.5} />
              </span>
              Checked in
            </span>
          ) : (
            <span className="inline-flex h-8 shrink-0 items-center rounded-pill px-3 text-[13px] font-medium text-muted shadow-[inset_0_0_0_1.5px_var(--color-line)]">
              Not yet
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

function CheckinSkeleton() {
  return (
    <div className="flex min-h-dvh flex-col bg-night" aria-busy>
      <div className="h-[60dvh] min-h-[340px]" />
      <div className="-mt-7 flex flex-1 flex-col gap-4 rounded-t-sheet bg-surface px-5 pt-8">
        <Skeleton shape="line" width="60%" className="h-6!" />
        <Skeleton className="h-12 rounded-pill!" />
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton shape="circle" width={40} />
            <Skeleton shape="line" width="45%" />
          </div>
        ))}
      </div>
    </div>
  );
}
