import "server-only";
import crypto from "node:crypto";

// ── Password Hashing (scrypt — stdlib, no native deps) ─────────────
// Format: scrypt$N$r$p$saltB64$hashB64
const N = 16384;
const r = 8;
const p = 1;
const KEYLEN = 64;
const SALT_LEN = 16;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LEN);
  const hash = crypto.scryptSync(password.normalize("NFKC"), salt, KEYLEN, { N, r, p });
  return `scrypt$${N}$${r}$${p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export type VerifyResult = { ok: boolean; rehash?: string };

export function verifyPassword(password: string, stored: string): VerifyResult {
  if (!stored) return { ok: false };
  // Legacy plain-text: succeed AND return a scrypt hash so the caller can
  // self-migrate on first successful login. SECURITY: never expose the
  // rehash on failure (no oracle via timing).
  const parts = stored.split("$");
  if (parts[0] !== "scrypt") {
    const ok = stored === password;
    if (!ok) return { ok: false };
    return { ok: true, rehash: hashPassword(password) };
  }
  const n = Number(parts[1]);
  const rr = Number(parts[2]);
  const pp = Number(parts[3]);
  const salt = Buffer.from(parts[4], "base64");
  const expected = Buffer.from(parts[5], "base64");
  const actual = crypto.scryptSync(password.normalize("NFKC"), salt, expected.length, { N: n, r: rr, p: pp });
  const ok = actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  return { ok };
}

// ── Signed URL helper (HMAC + expiry) ──────────────────────────────
export function signUrl(key: string, ttlSeconds = 3600): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = `${key}|${exp}`;
  const sig = crypto.createHmac("sha256", getUrlSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifySignedUrl(token: string): { key: string } | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto.createHmac("sha256", getUrlSecret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const [key, expStr] = body.split("|");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  return { key };
}

function getUrlSecret(): string {
  const explicit = process.env.URL_SIGNING_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  // SECURITY: production must explicitly set URL_SIGNING_SECRET.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "URL_SIGNING_SECRET must be set (>=16 chars) in production."
    );
  }
  return crypto.createHash("sha256").update("dev-only-url-secret").digest("hex");
}

// ── Rate limiter (in-memory token bucket) ──────────────────────────
// ponytail: single-process; switch to Redis when scaling out.
type Bucket = { tokens: number; updated: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const refillRate = max / windowMs;
  const bucket = buckets.get(key) || { tokens: max, updated: now };
  const elapsed = now - bucket.updated;
  const tokens = Math.min(max, bucket.tokens + elapsed * refillRate);
  if (tokens < 1) {
    const resetMs = Math.ceil((1 - tokens) / refillRate);
    buckets.set(key, { tokens, updated: now });
    return { allowed: false, remaining: 0, resetMs };
  }
  const next = { tokens: tokens - 1, updated: now };
  buckets.set(key, next);
  return { allowed: true, remaining: Math.floor(next.tokens), resetMs: 0 };
}
