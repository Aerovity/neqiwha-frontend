import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { AdvancedMarker, AdvancedMarkerAnchorPoint, Map as GMap } from '@vis.gl/react-google-maps';
import { toast } from 'sonner';
import { LoaderCircle, LocateFixed, LogIn, Plus, RotateCw } from 'lucide-react';
import type { EventPin } from '../shared/types';
import { useConfig, useEvents, useMe } from '../lib/queries';
import {
  ALGIERS,
  directionsUrl,
  getPosition,
  haversineKm,
  lastKnownPosition,
  positionIfGranted,
  type LatLng,
} from '../lib/geo';
import {
  Avatar,
  ButtonLink,
  Button,
  CoinPill,
  EmptyState,
  FilterChips,
  IconButton,
  Logo,
  SpotMarker,
  SpotPreviewCard,
  TAB_BAR_HEIGHT,
  TabBar,
  UserDot,
} from '../components';
import { MapCamera, RevealPin, type CameraTarget } from './parts/map/MapCamera';
import { IntroSheet } from './parts/map/IntroSheet';

const INTRO_KEY = 'nq_intro_seen';
const BOTTOM_GAP = `calc(${TAB_BAR_HEIGHT}px + env(safe-area-inset-bottom) + 22px)`;

// Bigger (busier) markers draw on top of smaller ones.
const markerZ = (p: EventPin, selected: boolean) =>
  selected ? 30 : p.status === 'cleaned' ? 1 : 2 + Math.min(p.participantCount, 15); // stays under the user dot (20)

function introSeen() {
  try {
    return localStorage.getItem(INTRO_KEY) === '1';
  } catch {
    return true;
  }
}

export function MapScreen() {
  const config = useConfig();
  const me = useMe();
  const events = useEvents();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [initialCenter] = useState<LatLng>(() => lastKnownPosition() ?? ALGIERS);
  const [userPos, setUserPos] = useState<LatLng | null>(() => lastKnownPosition());
  const [camera, setCamera] = useState<CameraTarget | null>(null);
  const [locating, setLocating] = useState(false);
  const [filters, setFilters] = useState({ showOpen: true, showCleaned: true });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [intro, setIntro] = useState(() => !introSeen());

  // Never prompt on load: only use the position when permission was already granted.
  useEffect(() => {
    if (lastKnownPosition()) return;
    let alive = true;
    positionIfGranted().then(pos => {
      if (!alive || !pos) return;
      setUserPos(pos);
      setCamera({ pos, nonce: Date.now() });
    });
    return () => {
      alive = false;
    };
  }, []);

  const pins = events.data ?? [];
  const visible = useMemo(
    () => pins.filter(p => (p.status === 'cleaned' ? filters.showCleaned : filters.showOpen)),
    [pins, filters],
  );
  const selected = visible.find(p => p.id === selectedId) ?? null;
  // Only re-evaluate on a new selection, not on every 15 s refetch.
  const revealPos = useMemo(() => (selected ? { lat: selected.lat, lng: selected.lng } : null), [selected?.id]);

  const locate = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const pos = await getPosition();
      setUserPos(pos);
      setCamera({ pos, zoom: 15, nonce: Date.now() });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not get your location.', {
        description: 'Check location permissions for this site and try again.',
      });
    } finally {
      setLocating(false);
    }
  };

  const closeIntro = () => {
    setIntro(false);
    try {
      localStorage.setItem(INTRO_KEY, '1');
    } catch {
      /* private mode: show it again next time */
    }
  };

  const user = me.data;
  const noPins = events.isSuccess && pins.length === 0;
  const filteredOut = events.isSuccess && pins.length > 0 && visible.length === 0;

  return (
    <div className="fixed inset-0 mx-auto max-w-[480px] overflow-hidden bg-[#E9EFEA]">
      <GMap
        mapId={config.data!.mapId}
        defaultCenter={initialCenter}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI
        clickableIcons={false}
        onClick={() => setSelectedId(null)}
        className="absolute inset-0"
      >
        <MapCamera target={camera} />
        <RevealPin pos={revealPos} />
        {visible.map(p => {
          const isSel = p.id === selectedId;
          return (
            <AdvancedMarker
              key={p.id}
              position={{ lat: p.lat, lng: p.lng }}
              anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
              zIndex={markerZ(p, isSel)}
              onClick={() => setSelectedId(p.id)}
              title={p.title}
            >
              <SpotMarker status={p.status} participantCount={p.participantCount} selected={isSel} />
            </AdvancedMarker>
          );
        })}
        {userPos && (
          <AdvancedMarker position={userPos} anchorPoint={AdvancedMarkerAnchorPoint.CENTER} zIndex={20} clickable={false}>
            <UserDot />
          </AdvancedMarker>
        )}
      </GMap>

      {/* Top bar */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-[linear-gradient(180deg,rgba(244,247,246,0.85)_0%,rgba(244,247,246,0.4)_60%,rgba(244,247,246,0)_100%)] px-3 pb-6"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            onClick={() => setIntro(true)}
            aria-label="Naqiwha: how it works"
            className="pointer-events-auto flex h-11 items-center rounded-pill bg-surface/95 pl-1.5 pr-4 shadow-float backdrop-blur-md transition-transform active:scale-[.97]"
          >
            <Logo size={32} />
          </Link>
          <div className="pointer-events-auto flex items-center gap-2">
            {user ? (
              <>
                <Link to="/shop" aria-label={`${user.coins} coins, open the shop`} className="rounded-pill transition-transform active:scale-[.96]">
                  <CoinPill coins={user.coins} />
                </Link>
                <Link
                  to="/profile"
                  aria-label="Your profile"
                  className="grid size-12 place-items-center rounded-full bg-surface shadow-float transition-transform active:scale-[.94]"
                >
                  <Avatar initials={user.initials} level={user.level} seed={user.id} size={34} />
                </Link>
              </>
            ) : me.isPending ? (
              <span className="h-11 w-24 animate-pulse rounded-pill bg-surface/80 shadow-float" />
            ) : (
              <Link
                to={`/login?next=${encodeURIComponent(pathname)}`}
                className="flex h-11 items-center gap-2 rounded-pill bg-ink pl-4 pr-5 text-[15px] font-semibold text-white shadow-float transition-transform active:scale-[.97]"
              >
                <LogIn size={18} strokeWidth={2.4} /> Log in
              </Link>
            )}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <FilterChips className="pointer-events-auto" {...filters} onChange={setFilters} />
          {events.isPending && (
            <span className="pointer-events-auto flex h-10 min-w-0 items-center gap-1.5 rounded-pill bg-surface/90 px-3 text-[13px] font-medium text-muted shadow-float">
              <LoaderCircle size={15} className="shrink-0 animate-spin" />
              <span className="truncate">Loading spots</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom stack: locate-me, then the preview / empty / error card */}
      <div className="pointer-events-none absolute inset-x-0 z-10 flex flex-col gap-3 px-3" style={{ bottom: BOTTOM_GAP }}>
        <motion.div layout="position" transition={{ type: 'spring', stiffness: 420, damping: 34 }} className="flex justify-end">
          <IconButton
            label={locating ? 'Finding you…' : 'Show my location'}
            onClick={locate}
            disabled={locating}
            size={48}
            className="pointer-events-auto"
          >
            {locating ? (
              <LoaderCircle size={22} className="animate-spin text-brand" />
            ) : (
              <LocateFixed size={22} strokeWidth={2.2} className={userPos ? 'text-brand' : undefined} />
            )}
          </IconButton>
        </motion.div>

        <AnimatePresence mode="wait">
          {selected ? (
            <SpotPreviewCard
              key={selected.id}
              className="pointer-events-auto"
              pin={selected}
              distanceKm={userPos ? haversineKm(userPos, selected) : null}
              onDetails={() => navigate(`/spots/${selected.id}`)}
              directionsHref={directionsUrl(selected)}
              onClose={() => setSelectedId(null)}
            />
          ) : noPins ? (
            <FloatingCard key="empty">
              <EmptyState
                className="py-6!"
                title="No spots here yet"
                body="See a mess? Be the first to spot it."
                action={
                  <ButtonLink to="/spots/new" icon={<Plus size={20} strokeWidth={2.6} />}>
                    Spot a mess
                  </ButtonLink>
                }
              />
            </FloatingCard>
          ) : events.isError && !events.data ? (
            <FloatingCard key="error" className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">Couldn't load spots</p>
                <p className="text-sm text-muted">Check your connection and try again.</p>
              </div>
              <Button size="sm" variant="secondary" icon={<RotateCw size={16} />} loading={events.isFetching} onClick={() => events.refetch()}>
                Retry
              </Button>
            </FloatingCard>
          ) : filteredOut ? (
            <FloatingCard key="filtered" className="self-center px-4 py-3 text-sm font-medium text-muted">
              No spots match these filters.
            </FloatingCard>
          ) : null}
        </AnimatePresence>
      </div>

      <TabBar />
      <IntroSheet open={intro} onClose={closeIntro} />
    </div>
  );
}

function FloatingCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 30, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className={`pointer-events-auto rounded-card bg-surface shadow-lift ${className}`}
    >
      {children}
    </motion.div>
  );
}
