/** "naqiwha:7f3k-9q2m" / "7F3K 9Q2M" -> "7F3K9Q2M" (the server normalizes too; this is for dedupe and the input). */
export const cleanCode = (raw: string) =>
  raw
    .trim()
    .replace(/^naqiwha:/i, '')
    .replace(/[^a-z0-9]/gi, '')
    .toUpperCase();

/** Live input formatting: up to 8 characters shown as "XXXX-XXXX". */
export function formatCodeInput(raw: string) {
  const c = cleanCode(raw).slice(0, 8);
  return c.length > 4 ? `${c.slice(0, 4)}-${c.slice(4)}` : c;
}
