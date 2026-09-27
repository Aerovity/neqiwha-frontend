import clsx from 'clsx';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGoBack } from '../lib/history';
import { IconButton } from './IconButton';

export interface ScreenHeaderProps {
  title?: ReactNode;
  /** `true` = history back (falls back to `/` on a fresh tab), string = parent route (see `useGoBack`). */
  back?: string | true;
  right?: ReactNode;
  /** Floats over a hero photo/map: no background, blurred round buttons. */
  transparent?: boolean;
  className?: string;
}

/** Sticky top bar with safe-area padding. */
export function ScreenHeader({ title, back, right, transparent, className }: ScreenHeaderProps) {
  const goBackTo = useGoBack();
  const goBack = () => goBackTo(typeof back === 'string' ? back : undefined);
  return (
    <header
      className={clsx(
        'z-30 flex items-center gap-2 px-3',
        transparent
          ? 'absolute inset-x-0 top-0'
          : 'sticky top-0 border-b border-line/70 bg-paper/85 backdrop-blur-md',
        className,
      )}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="flex h-14 min-w-0 flex-1 items-center gap-1">
        {back && (
          <IconButton label="Back" variant={transparent ? 'blur' : 'ghost'} onClick={goBack}>
            <ArrowLeft size={22} strokeWidth={2.25} />
          </IconButton>
        )}
        {title && (
          <h1
            className={clsx(
              'min-w-0 truncate font-display text-xl font-bold',
              !back && 'pl-2',
              transparent && 'text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.35)]',
            )}
          >
            {title}
          </h1>
        )}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </header>
  );
}
