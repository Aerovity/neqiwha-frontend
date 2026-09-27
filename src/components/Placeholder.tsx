import { Link } from 'react-router';

/** Temporary screen body used until a screen is implemented. */
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 p-8 text-center">
      <h1 className="font-display text-2xl font-bold">{title}</h1>
      <p className="text-muted">Coming together…</p>
      <Link to="/" className="font-semibold text-brand">Back to the map</Link>
    </div>
  );
}
