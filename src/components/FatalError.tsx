export function FatalError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="fixed inset-0 grid place-items-center bg-paper p-8 text-center">
      <div className="flex max-w-xs flex-col items-center gap-4">
        <h1 className="font-display text-2xl font-bold">We can't reach Naqiwha</h1>
        <p className="text-muted">Check your connection and try again.</p>
        <button onClick={onRetry} className="h-12 rounded-pill bg-brand px-6 font-semibold text-white">
          Try again
        </button>
      </div>
    </div>
  );
}
