/**
 * Every service function resolves through this helper so call sites already
 * exercise real async/loading behaviour today, and swapping the mock body
 * for a `fetch()` later requires no changes at the call site.
 */
export function simulateDelay<T>(data: T, ms = 260): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}
