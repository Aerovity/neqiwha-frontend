import clsx from 'clsx';

export type ScanFlash = 'ok' | 'already' | 'error' | null;

const CORNER = 'absolute size-11 border-[5px] transition-colors duration-200';

/** Viewfinder over the camera: dimmed surround, brand corner brackets, sweeping scan line, flash on result. */
export function ScannerFrame({ flash, paused }: { flash: ScanFlash; paused?: boolean }) {
  const tone =
    flash === 'ok' ? 'border-sprout' : flash === 'error' ? 'border-danger' : flash === 'already' ? 'border-mist' : 'border-white';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
      <div
        className={clsx(
          'relative aspect-square w-[min(66vw,264px)] rounded-[28px] shadow-[0_0_0_100vmax_rgba(4,20,13,0.55)] transition-transform duration-300 ease-back-out',
          flash === 'ok' && 'scale-[1.04]',
        )}
      >
        <span className={clsx(CORNER, tone, 'left-0 top-0 rounded-tl-[28px] border-b-0 border-r-0')} />
        <span className={clsx(CORNER, tone, 'right-0 top-0 rounded-tr-[28px] border-b-0 border-l-0')} />
        <span className={clsx(CORNER, tone, 'bottom-0 left-0 rounded-bl-[28px] border-r-0 border-t-0')} />
        <span className={clsx(CORNER, tone, 'bottom-0 right-0 rounded-br-[28px] border-l-0 border-t-0')} />
        {flash === 'ok' && <span className="absolute inset-0 animate-pop-in rounded-[28px] bg-sprout/25" />}
        {flash === 'error' && <span className="absolute inset-0 animate-pop-in rounded-[28px] bg-danger/20" />}
        {!paused && !flash && (
          <span className="absolute inset-x-4 top-0 h-0.5 animate-scan rounded-pill bg-sprout shadow-[0_0_14px_3px_rgba(155,219,78,0.7)]" />
        )}
      </div>
    </div>
  );
}
