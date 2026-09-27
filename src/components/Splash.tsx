/** Full-screen brand splash while the app boots. */
export function Splash() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-gradient-to-b from-deep to-night">
      <div className="flex flex-col items-center gap-4">
        <img src="/brand/mark.svg" alt="" width={88} height={88} className="animate-pulse" />
        <span className="font-display text-3xl font-bold text-white">Naqiwha</span>
      </div>
    </div>
  );
}
