import { useCallback, useEffect, useState } from 'react';
import { Map as GMap } from '@vis.gl/react-google-maps';
import { LoaderCircle, LocateFixed, MapPinOff, Satellite } from 'lucide-react';
import { Button, CenterPin } from '../../components';
import { GeoError, getPrecisePosition, type PreciseFix } from '../../lib/geo';

/** Readings less precise than this can't be used: the spot must be where the user actually stands. */
export const MAX_ACCURACY_M = 100;

type GpsState =
  | { kind: 'locating' }
  | { kind: 'ok'; fix: PreciseFix }
  | { kind: 'imprecise'; fix: PreciseFix }
  | { kind: 'denied' | 'unavailable' };

export interface GpsLocationProps {
  mapId: string;
  /** Called with a usable fix, or null while there is none. */
  onChange: (fix: PreciseFix | null) => void;
}

/**
 * The spot's location is the user's live GPS position, never a place picked on the map: a read-only map preview
 * with the pin on the fix, its accuracy, and a way to take a new reading.
 */
export function GpsLocation({ mapId, onChange }: GpsLocationProps) {
  const [state, setState] = useState<GpsState>({ kind: 'locating' });

  const locate = useCallback(async () => {
    setState({ kind: 'locating' });
    onChange(null);
    try {
      const fix = await getPrecisePosition();
      const ok = fix.accuracy <= MAX_ACCURACY_M;
      setState({ kind: ok ? 'ok' : 'imprecise', fix });
      onChange(ok ? fix : null);
    } catch (err) {
      setState({ kind: err instanceof GeoError ? err.kind : 'unavailable' });
    }
  }, [onChange]);

  useEffect(() => {
    locate();
  }, [locate]);

  const fix = state.kind === 'ok' || state.kind === 'imprecise' ? state.fix : null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {fix ? (
        <>
          <GMap
            key={`${fix.lat},${fix.lng}`}
            mapId={mapId}
            defaultCenter={fix}
            defaultZoom={18}
            gestureHandling="none"
            keyboardShortcuts={false}
            disableDefaultUI
            clickableIcons={false}
            className="absolute inset-0"
          />
          <CenterPin size={52} />
          <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4">
            <span className="inline-flex items-center gap-2 rounded-pill bg-night/75 px-3.5 py-2 text-[13px] font-semibold text-white shadow-float backdrop-blur-md">
              <Satellite size={15} className={state.kind === 'ok' ? 'text-sprout' : 'text-coin'} />
              GPS · accurate to ±{Math.round(fix.accuracy)} m
            </span>
          </div>
          {state.kind === 'imprecise' && (
            <div className="absolute inset-x-3 bottom-16 rounded-md bg-surface/95 px-3.5 py-3 text-sm leading-snug text-ink shadow-float backdrop-blur-md">
              <span className="font-semibold">Location isn’t precise enough.</span> Move outside, turn on precise location
              and update it (needs ±{MAX_ACCURACY_M} m or better).
            </div>
          )}
          <button
            type="button"
            onClick={locate}
            className="absolute bottom-3 right-3 inline-flex h-11 items-center gap-2 rounded-pill bg-surface pl-3 pr-4 text-sm font-semibold text-ink shadow-float transition-transform active:scale-[.96]"
          >
            <LocateFixed size={18} className="text-brand" />
            Update location
          </button>
        </>
      ) : state.kind === 'locating' ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <LoaderCircle size={34} className="animate-spin text-brand" />
          <p className="font-semibold">Finding your exact location…</p>
          <p className="max-w-xs text-sm text-muted">The spot is placed exactly where you’re standing.</p>
        </div>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-paper text-muted">
            <MapPinOff size={26} />
          </span>
          <p className="font-display text-xl font-bold">
            {state.kind === 'denied' ? 'Location access is off' : 'Couldn’t get your location'}
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            {state.kind === 'denied'
              ? 'Allow location for this site in your browser settings. Spots are placed at your live GPS position.'
              : 'Turn on location (GPS) and try again. Spots are placed at your live GPS position.'}
          </p>
          <Button size="md" variant="secondary" icon={<LocateFixed size={18} />} onClick={locate}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
