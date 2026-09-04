// SECURITY: never leak password hashes (or any other future sensitive field)
// to the client. Strip them defensively from any plain object before sending.

const SENSITIVE_KEYS = new Set([
  "password",
  "passwordHash",
  "firebaseUid", // internal pointer; not user-facing
  "sessionCookie",
  "resetLink",
  "idToken",
  "refreshToken",
  "token",
]);

export function stripSecrets<T>(value: T): T {
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((v) => stripSecrets(v)) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SENSITIVE_KEYS.has(k)) continue;
      out[k] = stripSecrets(v);
    }
    return out as unknown as T;
  }
  return value;
}
