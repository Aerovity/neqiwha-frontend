const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
const dayDate = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
const fullDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today 15:00" / "Tomorrow 10:00" / "Yesterday 09:00" / "Sat 12 Oct, 10:00" */
export function formatMeetTime(iso: string) {
  const d = new Date(iso);
  const days = Math.round((startOfDay(d) - startOfDay(new Date())) / 86_400_000);
  const t = time.format(d);
  if (days === 0) return `Today ${t}`;
  if (days === 1) return `Tomorrow ${t}`;
  if (days === -1) return `Yesterday ${t}`;
  return `${dayDate.format(d)}, ${t}`;
}

export const formatDate = (iso: string) => fullDate.format(new Date(iso));

/** "just now", "5 min ago", "3 h ago", "2 days ago", then a date. */
export function formatRelative(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86_400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86_400) return `${Math.floor(s / 86_400)} day${s < 2 * 86_400 ? '' : 's'} ago`;
  return formatDate(iso);
}

export const formatQr = (code: string) => (code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code);

/** 1240 -> "1 240" (brand board uses a thin space grouping) */
export const formatNumber = (n: number) => n.toLocaleString('en-GB').replace(/,/g, '\u202F');

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
