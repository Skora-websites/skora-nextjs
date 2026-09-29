/**
 * Small shared helpers for API route handlers.
 *
 * Auth is deliberately NOT here: every route validates the same
 * `admin_session` cookie through `isSubmittedAdminAuthenticated()` from
 * `@/lib/auth`. The old `apiRoute`/`requireAdmin` wrappers read a different
 * session that no login flow ever wrote, so a signed-in admin was answered
 * 401 — they were removed rather than left as a trap.
 */

/**
 * Parses a JSON request body. Returns `fallback` when the body is empty or
 * malformed so route handlers can answer 400 instead of throwing a 500.
 */
export async function readJson<T = Record<string, unknown>>(
  request: Request,
  fallback: T
): Promise<T> {
  try {
    const text = await request.text();
    if (!text || !text.trim()) return fallback;
    const parsed = JSON.parse(text) as T;
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch {
    return fallback;
  }
}
