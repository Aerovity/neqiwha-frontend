/** Avatar disc colours (brand board rank section): muted, all pass white-text contrast. */
export const AVATAR_COLORS = [
  '#4B4FA6', // indigo
  '#A63A63', // raspberry
  '#B5532F', // rust
  '#2F65A7', // blue
  '#7D7436', // olive (yellow-leaning so it separates from the green frames)
  '#2B7189', // teal (blue-leaning, same reason)
  '#7A4A8C', // plum
  '#8A5A2B', // walnut
] as const;

/** Deterministic colour for a seed (user id, name…). FNV-1a hash. */
export function avatarColor(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return AVATAR_COLORS[(h >>> 0) % AVATAR_COLORS.length];
}
