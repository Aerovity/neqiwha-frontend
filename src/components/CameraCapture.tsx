import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CameraOff, LoaderCircle, SwitchCamera, X } from 'lucide-react';
import { Button } from './Button';
import { IconButton } from './IconButton';

export interface CameraCaptureProps {
  onCapture: (photo: Blob) => void;
  onClose: () => void;
  hint?: string;
}

type CamState = 'starting' | 'live' | 'denied' | 'unavailable';

/**
 * Full-screen live camera (getUserMedia → video → canvas snapshot). There is deliberately no file input
 * anywhere: photos must be taken on the spot, never picked from the gallery, so old or downloaded
 * pictures can't be used to farm rewards.
 */
export function CameraCapture({ onCapture, onClose, hint }: CameraCaptureProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<CamState>('starting');
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [canFlip, setCanFlip] = useState(false);
  const [shooting, setShooting] = useState(false);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('unavailable');
      return;
    }
    let stream: MediaStream | null = null;
    let alive = true;
    setState('starting');
    navigator.mediaDevices
      .getUserMedia({ audio: false, video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } } })
      .then(async s => {
        if (!alive) return s.getTracks().forEach(t => t.stop());
        stream = s;
        const el = video.current;
        if (el) {
          el.srcObject = s;
          await el.play().catch(() => {});
        }
        setState('live');
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        if (alive) setCanFlip(devices.filter(d => d.kind === 'videoinput').length > 1);
      })
      .catch((err: unknown) => {
        if (!alive) return;
        const name = err instanceof DOMException ? err.name : '';
        setState(name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'unavailable');
      });
    return () => {
      alive = false;
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [facing]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shoot = () => {
    const el = video.current;
    if (!el || !el.videoWidth || shooting) return;
    setShooting(true);
    const canvas = document.createElement('canvas');
    canvas.width = el.videoWidth;
    canvas.height = el.videoHeight;
    canvas.getContext('2d')!.drawImage(el, 0, 0);
    canvas.toBlob(
      b => {
        setShooting(false);
        if (!b) return;
        navigator.vibrate?.(30);
        onCapture(b);
      },
      'image/jpeg',
      0.92,
    );
  };

  return createPortal(
    <div role="dialog" aria-modal aria-label="Camera" className="fixed inset-0 z-50 flex justify-center bg-night text-white">
      <div className="relative flex h-dvh w-full max-w-[480px] flex-col">
        <video
          ref={video}
          playsInline
          muted
          autoPlay
          className={state === 'live' ? 'absolute inset-0 size-full object-cover' : 'hidden'}
        />

        <div
          className="relative z-10 flex items-center justify-between px-3"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 8px)' }}
        >
          <IconButton label="Close camera" variant="blur" onClick={onClose}>
            <X size={22} />
          </IconButton>
          {canFlip && state === 'live' && (
            <IconButton
              label="Switch camera"
              variant="blur"
              onClick={() => setFacing(f => (f === 'environment' ? 'user' : 'environment'))}
            >
              <SwitchCamera size={22} />
            </IconButton>
          )}
        </div>

        {state === 'starting' && (
          <div className="grid flex-1 place-items-center">
            <LoaderCircle size={40} className="animate-spin text-mist" aria-label="Starting the camera" />
          </div>
        )}

        {(state === 'denied' || state === 'unavailable') && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-white/10">
              <CameraOff size={30} />
            </span>
            <h2 className="font-display text-2xl font-bold">
              {state === 'denied' ? 'Camera access is off' : 'No camera found'}
            </h2>
            <p className="text-[15px] leading-relaxed text-mist">
              {state === 'denied'
                ? 'Allow camera access for this site in your browser settings, then try again. Photos have to be taken live, on the spot.'
                : 'Open Naqiwha on a phone with a camera. Photos have to be taken live, on the spot.'}
            </p>
            <Button variant="secondary" size="lg" onClick={onClose}>
              Go back
            </Button>
          </div>
        )}

        {state === 'live' && (
          <div
            className="relative z-10 mt-auto flex flex-col items-center gap-4 bg-[linear-gradient(0deg,rgba(4,20,13,0.75)_0%,rgba(4,20,13,0)_100%)] px-4 pt-10"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)' }}
          >
            {hint && <p className="text-center text-sm font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">{hint}</p>}
            <button
              type="button"
              onClick={shoot}
              disabled={shooting}
              aria-label="Take photo"
              className="grid size-[76px] place-items-center rounded-full border-4 border-white transition-transform active:scale-90 disabled:opacity-60"
            >
              <span className="size-[60px] rounded-full bg-white" />
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
