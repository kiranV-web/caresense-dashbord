/**
 * Thin fetch wrapper for the CareSense backend. Requests are relative
 * ("/api/v1/...") so they go through the Vite dev proxy (see vite.config.ts)
 * in development and can be reverse-proxied the same way in production.
 */
export async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path);
  if (!response.ok) {
    const body = await response.json().catch(() => undefined) as { error?: string } | undefined;
    throw new Error(body?.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => undefined) as { error?: string } | undefined;
    throw new Error(errorBody?.error ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}
