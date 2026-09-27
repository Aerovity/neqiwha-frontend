import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft, CalendarClock, Check, ExternalLink, Lock, LockOpen, MapPin, Navigation, Share2, ShieldCheck, Trash2, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Avatar, BeforeAfter, Button, ButtonLink, ConfirmSheet, EmptyState, IconButton, Notice,
  ParticipantStack, Sheet, Skeleton, StatusChip, UserName,
} from '../components';
import { ApiError, errorMessage } from '../lib/api';
import { formatDate, formatMeetTime, plural } from '../lib/format';
import { directionsUrl, formatDistance, getPosition, haversineKm, lastKnownPosition, type LatLng } from '../lib/geo';
import { useGoBack } from '../lib/history';
import { useAdminEventAction, useEvent, useJoin, useMe, type AdminEventAction } from '../lib/queries';
import type { EventDetail, Participant } from '../shared/types';
import { BottomBar } from './parts/BottomBar';
import { shareSpot } from './parts/share';

export function SpotScreen() {
  const { id = '' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const goBack = useGoBack();
  const me = useMe();
  const event = useEvent(id);
  const join = useJoin(id);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [peopleOpen, setPeopleOpen] = useState(false);
  const [userPos, setUserPos] = useState<LatLng | null>(() => lastKnownPosition());

  useEffect(() => {
    let alive = true;
    getPosition()
      .then(p => alive && setUserPos(p))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [id]);

  const spot = event.data;
  const distKm = useMemo(() => {
    if (!spot || !userPos) return null;
    return haversineKm(userPos, { lat: spot.lat, lng: spot.lng });
  }, [spot, userPos]);

  if (event.isLoading) return <SpotLoading />;

  if (event.isError) {
    const missing = event.error instanceof ApiError && event.error.status === 404;
    return (
      <div className="flex min-h-dvh flex-col">
        <ScreenTop onBack={() => goBack('/')} />
        <EmptyState
          title={missing ? 'Spot not found' : "Couldn't load this spot"}
          body={missing ? 'It may have been removed or the link is wrong.' : errorMessage(event.error)}
          action={
            missing ? (
              <ButtonLink to="/" replace size="lg">
                Back to the map
              </ButtonLink>
            ) : (
              <Button size="lg" onClick={() => event.refetch()}>
                Try again
              </Button>
            )
          }
        />
      </div>
    );
  }

  if (!spot) return null;

  const v = spot.viewer;
  const checkedIn = spot.checkedInCount;
  const participantUsers = spot.participants.map(p => p.user);

  const onJoin = async () => {
    if (!me.data) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    try {
      await join.mutateAsync(true);
      toast.success("You're in! Show your QR to the organizer when you arrive.");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const onLeave = async () => {
    try {
      await join.mutateAsync(false);
      toast.message('You left this cleanup.');
      setLeaveOpen(false);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <div className="flex min-h-dvh flex-col pb-2">
      <Hero spot={spot} onBack={() => goBack()} onShare={() => shareSpot(spot)} />

      <div className="flex flex-col gap-5 px-4 pt-5">
        {spot.closedAt && (
          <Notice tone="danger" icon={<Lock size={18} />} title="Closed by a moderator">
            This spot is hidden from the map and can't be joined or finished.
          </Notice>
        )}

        <div className="flex flex-col gap-2">
          <h1 className="line-clamp-2 font-display text-[26px] font-bold leading-tight">{spot.title}</h1>
          {/* Solo spots are just the mess and its photos: no meeting details. */}
          {spot.isPublic && <MetaRows spot={spot} distKm={distKm} />}
        </div>

        {spot.organizer && (spot.isPublic || spot.showName) && (
          <div className="flex items-center gap-3">
            <Avatar initials={spot.organizer.initials} level={spot.organizer.level} seed={spot.organizer.id} size={44} />
            <div className="min-w-0 flex-1">
              <UserName name={spot.organizer.displayName} level={spot.organizer.level} />
              <p className="text-sm text-muted">
                {spot.isPublic ? 'Organizer' : spot.status === 'cleaned' ? 'Cleaned this spot' : 'Spotted this mess'}
              </p>
            </div>
          </div>
        )}

        <p className="text-[15px] leading-relaxed text-ink">{spot.description}</p>

        {spot.isPublic && (
          <button
            type="button"
            onClick={() => setPeopleOpen(true)}
            className="flex items-center gap-3 rounded-card bg-surface p-4 text-left shadow-card transition-transform active:scale-[.99]"
          >
            <ParticipantStack users={participantUsers} size={36} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">
                {plural(spot.participantCount, 'hero', 'heroes')} joined
                {checkedIn > 0 && (
                  <span className="font-medium text-muted">
                    {' '}
                    · {checkedIn} checked in
                  </span>
                )}
              </p>
              <p className="text-sm text-muted">Tap to see everyone</p>
            </div>
            <Users size={20} className="shrink-0 text-muted" />
          </button>
        )}

        {spot.status === 'cleaned' && spot.ai && (
          <Notice
            tone="cleaned"
            title={
              spot.isPublic
                ? `Cleaned on ${formatDate(spot.cleanedAt!)} · ${plural(spot.participantCount, 'hero', 'heroes')} rewarded`
                : `Cleaned on ${formatDate(spot.cleanedAt!)}`
            }
          >
            {spot.ai.summary}
          </Notice>
        )}

        {v?.hasJoined && v.isCheckedIn && !v.isOrganizer && spot.status !== 'cleaned' && (
          <Notice tone="success" title="You're checked in ✓ — rewards land when the spot is verified." />
        )}

        {me.data?.isAdmin && <Moderation spot={spot} />}
      </div>

      <BottomBar>
        <SpotActions
          spot={spot}
          meLoggedIn={!!me.data}
          joinLoading={join.isPending}
          onJoin={onJoin}
          onLeave={() => setLeaveOpen(true)}
        />
      </BottomBar>

      <Sheet open={peopleOpen} onClose={() => setPeopleOpen(false)} title="Heroes on this spot">
        <ul className="flex flex-col gap-1 pb-2">
          {spot.participants.map(p => (
            <ParticipantRow key={p.user.id} p={p} showCheckin={!!v?.isOrganizer} />
          ))}
        </ul>
      </Sheet>

      <ConfirmSheet
        open={leaveOpen}
        title="Leave this cleanup?"
        body="You can always join again from the spot page."
        confirmLabel="Leave"
        cancelLabel="Stay"
        tone="danger"
        onConfirm={onLeave}
        onClose={() => setLeaveOpen(false)}
      />
    </div>
  );
}

function Hero({ spot, onBack, onShare }: { spot: EventDetail; onBack: () => void; onShare: () => void }) {
  const cleaned = spot.status === 'cleaned' && spot.afterImageUrl;
  return (
    <div className="relative">
      {cleaned ? (
        <BeforeAfter beforeUrl={spot.beforeImageUrl} afterUrl={spot.afterImageUrl!} alt={spot.title} className="rounded-none!" />
      ) : (
        <img
          src={spot.beforeImageUrl}
          alt={`Before photo of ${spot.title}`}
          className="aspect-[4/3] w-full object-cover"
          loading="eager"
        />
      )}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
      >
        <IconButton label="Back" variant="blur" className="pointer-events-auto" onClick={onBack}>
          <ArrowLeft size={22} />
        </IconButton>
        <div className="pointer-events-auto flex flex-col gap-2">
          <StatusChip status={spot.status} className="shadow-float" />
          <IconButton label="Share spot" variant="blur" onClick={onShare}>
            <Share2 size={20} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

function MetaRows({ spot, distKm }: { spot: EventDetail; distKm: number | null }) {
  return (
    <ul className="flex flex-col gap-2 text-sm text-muted">
      <li className="flex items-center gap-2">
        <CalendarClock size={16} className="shrink-0 text-brand" />
        {formatMeetTime(spot.startsAt)}
      </li>
      {spot.address && (
        <li className="flex items-center gap-2">
          <MapPin size={16} className="shrink-0 text-brand" />
          <span className="truncate">{spot.address}</span>
        </li>
      )}
      {distKm != null && (
        <li className="flex items-center gap-2">
          <Navigation size={16} className="shrink-0 text-brand" />
          {formatDistance(distKm)} away
        </li>
      )}
      <li>
        <a
          href={directionsUrl({ lat: spot.lat, lng: spot.lng })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-semibold text-brand"
        >
          Directions
          <ExternalLink size={14} />
        </a>
      </li>
    </ul>
  );
}

function SpotActions({
  spot,
  meLoggedIn,
  joinLoading,
  onJoin,
  onLeave,
}: {
  spot: EventDetail;
  meLoggedIn: boolean;
  joinLoading: boolean;
  onJoin: () => void;
  onLeave: () => void;
}) {
  const v = spot.viewer;
  const id = spot.id;

  if (spot.status === 'cleaned' || spot.closedAt) return null;

  if (!spot.isPublic) {
    return v?.isOrganizer ? (
      <ButtonLink to={`/spots/${id}/finish`} size="lg" full>
        Finish cleanup
      </ButtonLink>
    ) : null;
  }

  if (!meLoggedIn) {
    return (
      <Button size="lg" full onClick={onJoin}>
        Join the cleanup
      </Button>
    );
  }

  if (v?.isOrganizer) {
    const n = spot.participantCount;
    const m = spot.checkedInCount;
    return (
      <div className="flex flex-col gap-2">
        <p className="text-center text-sm font-medium text-muted">
          {m} of {n} checked in
        </p>
        <ButtonLink to={`/spots/${id}/checkin`} size="lg" full>
          Check people in
        </ButtonLink>
        <ButtonLink to={`/spots/${id}/finish`} variant="secondary" size="lg" full>
          Finish cleanup
        </ButtonLink>
      </div>
    );
  }

  if (v?.hasJoined) {
    if (v.isCheckedIn) return null;
    return (
      <div className="flex flex-col gap-2">
        <ButtonLink to={`/me/qr?spot=${id}`} size="lg" full>
          Show my QR
        </ButtonLink>
        <Button variant="ghost" size="md" full onClick={onLeave} disabled={joinLoading}>
          Leave
        </Button>
      </div>
    );
  }

  return (
    <Button size="lg" full loading={joinLoading} onClick={onJoin}>
      Join the cleanup
    </Button>
  );
}

function ParticipantRow({ p, showCheckin }: { p: Participant; showCheckin: boolean }) {
  return (
    <li className="flex items-center gap-3 rounded-md px-2 py-2.5">
      <Avatar initials={p.user.initials} level={p.user.level} seed={p.user.id} size={40} frame={false} />
      <div className="min-w-0 flex-1">
        <UserName name={p.user.displayName} level={p.user.level} noBadge={p.role === 'organizer'} />
        <p className="text-sm text-muted capitalize">{p.role === 'organizer' ? 'Organizer' : 'Hero'}</p>
      </div>
      {showCheckin && (
        <span
          className={
            p.checkedIn
              ? 'inline-flex items-center gap-1 text-sm font-semibold text-brand'
              : 'text-sm text-muted'
          }
        >
          {p.checkedIn ? (
            <>
              <Check size={16} /> In
            </>
          ) : (
            'Waiting'
          )}
        </span>
      )}
    </li>
  );
}

const MODERATION_COPY: Record<AdminEventAction, { title: string; body: string; label: string; done: string }> = {
  close: {
    title: 'Close this spot?',
    body: 'It disappears from the map and nobody can join, check in or finish it. You can reopen it later.',
    label: 'Close spot',
    done: 'Spot closed.',
  },
  reopen: {
    title: 'Reopen this spot?',
    body: 'It goes back on the map and works normally again.',
    label: 'Reopen spot',
    done: 'Spot reopened.',
  },
  delete: {
    title: 'Delete this spot for good?',
    body: 'The spot and its photos are removed permanently. Rewards already paid stay in people’s history.',
    label: 'Delete spot',
    done: 'Spot deleted.',
  },
};

/** Admin-only moderation card: close / reopen / delete this spot. */
function Moderation({ spot }: { spot: EventDetail }) {
  const navigate = useNavigate();
  const act = useAdminEventAction();
  const [pending, setPending] = useState<AdminEventAction | null>(null);
  const copy = pending ? MODERATION_COPY[pending] : null;

  const run = async () => {
    if (!pending) return;
    try {
      await act.mutateAsync({ id: spot.id, action: pending });
      toast.success(MODERATION_COPY[pending].done);
      if (pending === 'delete') navigate('/', { replace: true });
      setPending(null);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck size={18} className="text-brand" />
        Moderation
      </div>
      <div className="grid grid-cols-2 gap-2">
        {spot.closedAt ? (
          <Button variant="secondary" size="sm" icon={<LockOpen size={16} />} onClick={() => setPending('reopen')}>
            Reopen
          </Button>
        ) : (
          <Button variant="secondary" size="sm" icon={<Lock size={16} />} onClick={() => setPending('close')}>
            Close
          </Button>
        )}
        <Button variant="danger" size="sm" icon={<Trash2 size={16} />} onClick={() => setPending('delete')}>
          Delete
        </Button>
      </div>
      <ConfirmSheet
        open={!!pending}
        title={copy?.title ?? ''}
        body={copy?.body}
        confirmLabel={copy?.label ?? ''}
        cancelLabel="Cancel"
        tone={pending === 'reopen' ? 'default' : 'danger'}
        loading={act.isPending}
        onConfirm={run}
        onClose={() => setPending(null)}
      />
    </section>
  );
}

function ScreenTop({ onBack }: { onBack: () => void }) {
  return (
    <header className="px-3 pb-2" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <IconButton label="Back" variant="ghost" onClick={onBack}>
        <ArrowLeft size={22} />
      </IconButton>
    </header>
  );
}

function SpotLoading() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Skeleton className="aspect-[4/3] w-full rounded-none!" />
      <div className="flex flex-col gap-4 px-4 pt-5">
        <Skeleton shape="line" width="90%" className="h-7!" />
        <Skeleton shape="line" width="60%" />
        <Skeleton shape="line" width="75%" />
        <div className="flex gap-3 pt-2">
          <Skeleton shape="circle" width={44} />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton shape="line" width="40%" />
            <Skeleton shape="line" width="25%" />
          </div>
        </div>
      </div>
    </div>
  );
}
