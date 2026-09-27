export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`/api${path}`, { ...init, headers, body, credentials: 'same-origin' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.code ?? 'error', data?.error?.message ?? 'Something went wrong.');
  }
  return data as T;
}

export async function uploadImage(blob: Blob): Promise<{ id: string; url: string }> {
  const fd = new FormData();
  fd.append('file', blob, blob.type === 'image/png' ? 'photo.png' : 'photo.jpg');
  return api('/images', { method: 'POST', body: fd });
}

export const errorMessage = (err: unknown) =>
  err instanceof Error ? err.message : 'Something went wrong.';
