import fs from "fs";
import path from "path";

/**
 * Resolves the admin credentials used by the login tests.
 *
 * Nothing is hardcoded here: the values come from the environment, falling back
 * to the gitignored `.env` file. `npm run db:seed-admin` creates the matching
 * account. When they are absent the credential-dependent tests are skipped.
 */

export interface AdminCredentials {
  identifier: string;
  password: string;
}

export function readEnvFile(): Record<string, string> {
  const out: Record<string, string> = {};
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

export function envValue(key: string): string {
  const fileEnv = readEnvFile();
  return (process.env[key] ?? fileEnv[key] ?? "").trim();
}

export function adminCredentials(): AdminCredentials | null {
  const identifier = envValue("ADMIN_EMAIL");
  const password = envValue("ADMIN_PASSWORD");
  if (!identifier || !password) return null;
  return { identifier, password };
}

export default async function globalSetup() {
  const creds = adminCredentials();
  if (creds) {
    console.log(`[e2e] admin credentials loaded from env for '${creds.identifier}' (no credentials in source)`);
  } else {
    console.warn("[e2e] ADMIN_EMAIL / ADMIN_PASSWORD not set — sign-in tests will be skipped.");
  }
}
