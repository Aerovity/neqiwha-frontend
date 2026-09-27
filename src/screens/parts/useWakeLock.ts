import { useEffect } from 'react';

/** Best-effort screen wake lock while mounted; re-acquired when the tab becomes visible again. */
export function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null;
    let active = true;
    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const next = await navigator.wakeLock?.request('screen');
        if (!active) next?.release().catch(() => {});
        else lock = next ?? null;
      } catch {
        // unsupported, denied or low battery: the QR still works, the screen may just dim
      }
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', acquire);
      lock?.release().catch(() => {});
    };
  }, []);
}
