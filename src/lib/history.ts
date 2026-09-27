import { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';

/** History index → path of the entry at that index, so a back button can tell whether the previous entry is its parent. */
const trail = new Map<number, string>();
const historyIdx = (): number => window.history.state?.idx ?? 0;

/** Call once inside the router: records every location against its history index. */
export function useHistoryTrail() {
  const { key, pathname } = useLocation();
  useEffect(() => {
    trail.set(historyIdx(), pathname);
  }, [key, pathname]);
}

/**
 * Back navigation that never pushes. With a `parent` route: pop history when the previous entry is that
 * route, otherwise replace the current entry with it (pushing would let parent ↔ child loop forever).
 * Without one: pop history, or replace with the map on a fresh tab.
 */
export function useGoBack() {
  const navigate = useNavigate();
  return useCallback(
    (parent?: string) => {
      const idx = historyIdx();
      if (idx > 0 && (!parent || trail.get(idx - 1) === parent.split('?')[0])) navigate(-1);
      else navigate(parent ?? '/', { replace: true });
    },
    [navigate],
  );
}
