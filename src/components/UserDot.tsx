/** "You are here": ink dot with a soft breathing halo. 44 px box; its centre is the position. */
export function UserDot() {
  return (
    <div role="img" aria-label="You are here" className="relative grid size-11 place-items-center">
      <span aria-hidden className="absolute inset-0 animate-soft-pulse rounded-full bg-ink/12" />
      <span className="relative size-[18px] rounded-full border-[3px] border-white bg-ink shadow-[0_2px_6px_rgba(4,20,13,0.3)]" />
    </div>
  );
}
