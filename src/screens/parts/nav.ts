/** `?next=` target, restricted to in-app paths so a crafted link can't bounce users off-site. */
export function safeNext(raw: string | null | undefined, fallback = '/') {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  if (raw.startsWith('/login')) return fallback;
  return raw;
}

export const withQuery = (path: string, params: Record<string, string | null | undefined | false>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
};
