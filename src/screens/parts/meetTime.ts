const pad = (n: number) => String(n).padStart(2, '0');

/** Date → value for `<input type="datetime-local">` (local time, minute precision). */
export const toLocalInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** `datetime-local` value → Date (null when empty/invalid). */
export function fromLocalInput(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const atTen = (d: Date) => {
  const x = new Date(d);
  x.setHours(10, 0, 0, 0);
  return x;
};

export function nextFullHour(now = new Date()) {
  const d = new Date(now);
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d;
}

export type PresetKey = 'now' | 'hour' | 'tomorrow' | 'saturday';

export const PRESETS: { key: PresetKey; label: string; at: (now: Date) => Date }[] = [
  { key: 'now', label: 'Now', at: now => new Date(Math.floor(now.getTime() / 60_000) * 60_000) },
  { key: 'hour', label: 'In 1 hour', at: now => new Date(Math.floor(now.getTime() / 60_000) * 60_000 + 3_600_000) },
  {
    key: 'tomorrow',
    label: 'Tomorrow 10:00',
    at: now => {
      const d = atTen(now);
      d.setDate(d.getDate() + 1);
      return d;
    },
  },
  {
    key: 'saturday',
    label: 'Saturday 10:00',
    at: now => {
      const d = atTen(now);
      d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7));
      if (d <= now) d.setDate(d.getDate() + 7);
      return d;
    },
  },
];

export const MAX_AHEAD_MS = 30 * 86_400_000;
/** The API accepts meeting times up to 2 h in the past ("Now" drifts while the user finishes the form). */
export const MAX_PAST_MS = 2 * 3_600_000;

export function meetTimeError(v: string, now = new Date()) {
  const d = fromLocalInput(v);
  if (!d) return 'Pick a meeting time.';
  const t = d.getTime();
  if (t < now.getTime() - MAX_PAST_MS || t > now.getTime() + MAX_AHEAD_MS) return 'Pick a time in the next 30 days.';
  return null;
}
