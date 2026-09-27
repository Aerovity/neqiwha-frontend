import clsx from 'clsx';
import { useState } from 'react';
import { Camera, FlaskConical, LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchSample } from '../lib/image';
import { CameraCapture } from './CameraCapture';

export interface PhotoCaptureProps {
  onPhoto: (file: Blob) => void;
  title?: string;
  hint?: string;
  /** Dev sample photos (names accepted by /api/dev/sample/:name). */
  samples?: { label: string; name: string }[];
  busy?: boolean;
  className?: string;
}

/** Big camera tile opening the live in-app camera (no gallery uploads) + optional dev sample buttons. */
export function PhotoCapture({
  onPhoto,
  title = 'Take a photo',
  hint = 'Get the whole mess in the frame.',
  samples,
  busy,
  className,
}: PhotoCaptureProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const disabled = busy || !!loadingSample;

  const onCapture = (photo: Blob) => {
    setCameraOpen(false);
    onPhoto(photo);
  };

  const pickSample = async (name: string) => {
    setLoadingSample(name);
    try {
      onPhoto(await fetchSample(name));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sample photo unavailable.');
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className={clsx('flex flex-col gap-3', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setCameraOpen(true)}
        className="group relative flex aspect-[4/3] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-card border-2 border-dashed border-brand/35 bg-[radial-gradient(120%_90%_at_50%_0%,#EAF5EC_0%,#E2F0E6_55%,#D6EADC_100%)] px-6 text-center transition-[transform,border-color] duration-150 hover:border-brand/60 active:scale-[.985] disabled:opacity-70"
      >
        <span aria-hidden className="pointer-events-none absolute inset-4 rounded-[14px] border border-white/60" />
        <span className="relative grid size-[76px] place-items-center rounded-full bg-brand text-white shadow-brand transition-transform duration-200 ease-back-out group-hover:scale-105 group-active:scale-95">
          {busy ? <LoaderCircle size={34} className="animate-spin" /> : <Camera size={34} strokeWidth={2} />}
          {!busy && <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-brand/50" />}
        </span>
        <span className="relative flex flex-col gap-1">
          <span className="font-display text-2xl font-bold text-ink">{busy ? 'Working on it…' : title}</span>
          <span className="text-sm text-muted">{hint}</span>
        </span>
      </button>

      {samples && samples.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          {samples.map(s => (
            <button
              key={s.name}
              type="button"
              disabled={disabled}
              onClick={() => pickSample(s.name)}
              className="inline-flex h-10 items-center gap-1.5 rounded-pill border-[1.5px] border-dashed border-muted/40 px-3.5 text-[13px] font-medium text-muted transition-[transform,background-color] hover:bg-surface active:scale-[.97] disabled:opacity-50"
            >
              {loadingSample === s.name ? <LoaderCircle size={14} className="animate-spin" /> : <FlaskConical size={14} />}
              {s.label}
            </button>
          ))}
        </div>
      )}

      {cameraOpen && <CameraCapture hint={hint} onCapture={onCapture} onClose={() => setCameraOpen(false)} />}
    </div>
  );
}
