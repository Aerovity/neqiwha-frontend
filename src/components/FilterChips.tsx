import clsx from 'clsx';
import type { ReactNode } from 'react';
import { CheckStroke } from './icons';

export interface FilterChipsProps {
  showOpen: boolean;
  showCleaned: boolean;
  onChange: (next: { showOpen: boolean; showCleaned: boolean }) => void;
  className?: string;
}

/** Map filters: "To clean" (open + in progress) and "Cleaned". Active = ink pill with a check. */
export function FilterChips({ showOpen, showCleaned, onChange, className }: FilterChipsProps) {
  return (
    <div className={clsx('flex shrink-0 gap-2', className)} role="group" aria-label="Filter spots">
      <Pill active={showOpen} onClick={() => onChange({ showOpen: !showOpen, showCleaned })}>
        To clean
      </Pill>
      <Pill active={showCleaned} onClick={() => onChange({ showOpen, showCleaned: !showCleaned })}>
        Cleaned
      </Pill>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={clsx(
        'flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-4 text-sm transition-[transform,background-color,color] duration-150 active:scale-[.97]',
        active
          ? 'bg-ink font-semibold text-white shadow-[0_4px_12px_rgba(4,20,13,0.18)]'
          : 'bg-surface font-medium text-ink shadow-[0_4px_12px_rgba(4,20,13,0.12)]',
      )}
    >
      {active && <CheckStroke size={14} strokeWidth={3} className="animate-pop-in" />}
      {children}
    </button>
  );
}
