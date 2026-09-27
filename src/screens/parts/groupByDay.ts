const dayLabel = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
const dayLabelYear = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** "Today", "Yesterday", "Monday 21 September", "3 March 2025". */
export function dayHeading(iso: string, now = new Date()) {
  const d = new Date(iso);
  const days = Math.round((startOfDay(now) - startOfDay(d)) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return d.getFullYear() === now.getFullYear() ? dayLabel.format(d) : dayLabelYear.format(d);
}

/** Groups items (already sorted newest first) into consecutive day buckets. */
export function groupByDay<T extends { createdAt: string }>(items: T[]) {
  const groups: { key: number; label: string; items: T[] }[] = [];
  for (const item of items) {
    const key = startOfDay(new Date(item.createdAt));
    const last = groups[groups.length - 1];
    if (last?.key === key) last.items.push(item);
    else groups.push({ key, label: dayHeading(item.createdAt), items: [item] });
  }
  return groups;
}
