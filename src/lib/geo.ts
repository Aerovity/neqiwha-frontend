export type LatLng = { lat: number; lng: number };

export const ALGIERS: LatLng = { lat: 36.7538, lng: 3.0588 };
const LAST_POS_KEY = 'nq_last_pos';

export function getPosition(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Location is not available on this device.'));
    navigator.geolocation.getCurrentPosition(
      p => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        sessionStorage.setItem(LAST_POS_KEY, JSON.stringify(pos));
        resolve(pos);
      },
      err => reject(new Error(err.code === err.PERMISSION_DENIED ? 'Location permission denied.' : 'Could not get your location.')),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  });
}

export type PreciseFix = LatLng & { accuracy: number };

/** A fresh, high-accuracy GPS reading (never a cached one), with its accuracy radius in metres. */
export function getPrecisePosition(): Promise<PreciseFix> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new GeoError('unavailable'));
    navigator.geolocation.getCurrentPosition(
      p => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        sessionStorage.setItem(LAST_POS_KEY, JSON.stringify(pos));
        resolve({ ...pos, accuracy: p.coords.accuracy });
      },
      err => reject(new GeoError(err.code === err.PERMISSION_DENIED ? 'denied' : 'unavailable')),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  });
}

export class GeoError extends Error {
  constructor(public kind: 'denied' | 'unavailable') {
    super(kind === 'denied' ? 'Location permission denied.' : 'Could not get your location.');
  }
}

export function lastKnownPosition(): LatLng | null {
  try {
    const raw = sessionStorage.getItem(LAST_POS_KEY);
    return raw ? (JSON.parse(raw) as LatLng) : null;
  } catch {
    return null;
  }
}

/** Current position only if permission is already granted (never prompts). */
export async function positionIfGranted(): Promise<LatLng | null> {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
    if (status?.state !== 'granted') return null;
    return await getPosition();
  } catch {
    return null;
  }
}

export function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export const formatDistance = (km: number) =>
  km < 1 ? `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m` : `${km.toFixed(km < 10 ? 1 : 0)} km`;

export const directionsUrl = (p: LatLng) =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`;
