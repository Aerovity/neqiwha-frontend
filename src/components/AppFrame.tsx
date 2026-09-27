import type { ReactNode } from 'react';
import { BrandSprite } from './BrandSprite';

/** Mobile-first column: full width on phones, centered 480px column on wider screens. */
export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[480px] overflow-x-clip bg-paper shadow-[0_0_60px_rgba(4,20,13,0.12)]">
      <BrandSprite />
      {children}
    </div>
  );
}
