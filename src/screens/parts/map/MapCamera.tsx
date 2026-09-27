import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { LatLng } from '../../../lib/geo';

export interface CameraTarget {
  pos: LatLng;
  zoom?: number;
  /** Bump to re-run the same target (tapping locate twice). */
  nonce: number;
}

/** Moves the map from code. Must render inside `<GMap>`. */
export function MapCamera({ target }: { target: CameraTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    map.panTo(target.pos);
    if (target.zoom != null && map.getZoom() !== target.zoom) map.setZoom(target.zoom);
  }, [map, target]);
  return null;
}

/** Pans to a freshly selected pin only when it sits low enough to be hidden by the preview card. */
export function RevealPin({ pos }: { pos: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !pos) return;
    const b = map.getBounds();
    if (!b) return;
    const south = b.getSouthWest().lat();
    const north = b.getNorthEast().lat();
    if (pos.lat < south + (north - south) * 0.45) map.panTo(pos);
  }, [map, pos]);
  return null;
}
