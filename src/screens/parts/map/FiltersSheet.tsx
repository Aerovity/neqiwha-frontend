import type { ReactNode } from 'react';
import { Button, FilterPill, Sheet } from '../../../components';
import { plural } from '../../../lib/format';

export interface MapFilters {
  showOpen: boolean;
  showCleaned: boolean;
  /** Only spots within this distance of the user; null = any distance. */
  radiusKm: number | null;
}

export const DEFAULT_FILTERS: MapFilters = { showOpen: true, showCleaned: true, radiusKm: null };
export const RADIUS_OPTIONS = [1, 2, 5, 10] as const;

/** How many filters differ from the defaults (drives the badge on the filters button). */
export const activeFilterCount = (f: MapFilters) => Number(!f.showOpen) + Number(!f.showCleaned) + Number(f.radiusKm != null);

export interface FiltersSheetProps {
  open: boolean;
  onClose: () => void;
  filters: MapFilters;
  onChange: (next: MapFilters) => void;
  /** Spots that match the current filters. */
  matchCount: number;
  /** Radius filters need the user's position: resolves false when it could not be read. */
  ensureLocation: () => Promise<boolean>;
  locating: boolean;
}

/** Map filters: spot state and distance from the user. Changes apply live; "Show N spots" closes. */
export function FiltersSheet({ open, onClose, filters, onChange, matchCount, ensureLocation, locating }: FiltersSheetProps) {
  const setRadius = async (radiusKm: number | null) => {
    if (radiusKm != null && !(await ensureLocation())) return;
    onChange({ ...filters, radiusKm });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Filters">
      <div className="flex min-w-0 flex-col gap-6 overflow-x-hidden" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)' }}>
        <Group title="Show">
          <FilterPill active={filters.showOpen} onClick={() => onChange({ ...filters, showOpen: !filters.showOpen })}>
            To clean
          </FilterPill>
          <FilterPill active={filters.showCleaned} onClick={() => onChange({ ...filters, showCleaned: !filters.showCleaned })}>
            Cleaned
          </FilterPill>
        </Group>

        <Group title="Distance from you" note={locating ? 'Finding you…' : undefined} row>
          <FilterPill active={filters.radiusKm == null} onClick={() => setRadius(null)} className={ROW_PILL}>
            Any
          </FilterPill>
          {RADIUS_OPTIONS.map(km => (
            <FilterPill key={km} active={filters.radiusKm === km} onClick={() => setRadius(km)} className={ROW_PILL}>
              {km} km
            </FilterPill>
          ))}
        </Group>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => onChange(DEFAULT_FILTERS)} disabled={activeFilterCount(filters) === 0}>
            Reset
          </Button>
          <Button className="min-w-0 flex-1" onClick={onClose} data-autofocus>
            {matchCount === 0 ? 'No spots match' : `Show ${plural(matchCount, 'spot')}`}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

/** Distance pills keep their natural width; the row scrolls sideways on narrow screens. */
const ROW_PILL = 'min-w-[64px] justify-center';

function Group({ title, note, row, children }: { title: string; note?: string; row?: boolean; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">{title}</h3>
        {note && <span className="text-xs font-medium text-brand">{note}</span>}
      </div>
      {row ? (
        <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {children}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">{children}</div>
      )}
    </section>
  );
}
