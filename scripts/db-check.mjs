#!/usr/bin/env node
/**
 * Verifies the configured MongoDB (Atlas) is actually usable.
 *
 *   npm run db:check
 *
 * This exists because `connect()` succeeding proves almost nothing. The driver
 * opens a socket; authentication happens per command. A URI that connects but
 * cannot authenticate therefore looks healthy until the first query, at which
 * point every read in `lib/db.ts` silently falls back to `data/hrms.json` — so
 * the site serves stale content (old contact details, no blog posts, SEO
 * settings that ignore every admin edit) with nothing visibly wrong.
 *
 * This runs the same real read the app's boot check runs, so a pass here means a
 * pass there. Use it before a deploy rather than after noticing something
 * missing from the site.
 *
 * Checks, in order of how often they are the culprit:
 *   1. MONGODB_URI is set and not a placeholder
 *   2. the database name is present in the path (no path ⇒ authSource: admin)
 *   3. reserved characters in the credentials are percent-encoded
 *   4. the server is reachable
 *   5. an authenticated read actually succeeds
 */

import fs from "node:fs";
import { MongoClient } from "mongodb";

/** Reads .env without a dependency, matching scripts/seed-admin.mjs. */
function readEnvFile() {
  const out = {};
  const envPath = new URL("../.env", import.meta.url);
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

const fileEnv = readEnvFile();
const env = (key) => process.env[key] ?? fileEnv[key];

const problems = [];
const notes = [];

function ok(message) {
  console.log(`  \x1b[32m✓\x1b[0m ${message}`);
}

function warn(message) {
  notes.push(message);
  console.log(`  \x1b[33m!\x1b[0m ${message}`);
}

function fail(message) {
  problems.push(message);
  console.log(`  \x1b[31m✗\x1b[0m ${message}`);
}

console.log("\nMongoDB connection check\n");

// ── 1. Configuration ───────────────────────────────────────────────────────
const uri = (env("MONGODB_URI") || "").trim();
let uriDbName = "";
try {
  uriDbName = new URL(uri).pathname.replace(/^\/+/, "").split("/")[0];
} catch {
  // The URI validation below reports malformed input.
}
const dbName = (env("MONGODB_DB") || uriDbName || "").trim();
/** A local standalone mongod runs without auth, so the authSource rules below
 *  only apply to a real cluster. */
const isLocal = /^mongodb:\/\/(127\.0\.0\.1|localhost|\[::1\])/.test(uri);

if (!uri) {
  fail("MONGODB_URI is not set. Copy .env.example to .env and fill it in.");
} else if (uri.includes("<username>") || uri.includes("<password>")) {
  fail("MONGODB_URI still contains the <username>/<password> placeholders.");
} else if (uri.startsWith("mongodb://127.0.0.1") || uri.startsWith("mongodb://localhost")) {
  warn(
    "MONGODB_URI points at a LOCAL mongod. This project targets MongoDB Atlas — " +
      "if that is deliberate you can ignore the rest of this check."
  );
  ok("URI is set (local)");
} else {
  // Mask everything up to the LAST "@" so a password containing an unencoded
  // one cannot leak into the terminal output.
  ok(`URI is set (${uri.replace(/^(mongodb(?:\+srv)?:\/\/)(.*@)/, "$1***")})`);
}
if (uri && !dbName) {
  fail("MONGODB_DB must be set when MONGODB_URI does not include a database name.");
}

// ── 2. Database in the path ────────────────────────────────────────────────
// The single most common cause of an authenticated-but-unusable Atlas URI.
// Skipped for a local mongod, which runs unauthenticated.
if (!isLocal && (uri.startsWith("mongodb+srv://") || uri.startsWith("mongodb://"))) {
  const scheme = uri.split("://")[1] ?? "";
  const pathPart = scheme.includes("/") ? scheme.slice(scheme.indexOf("/") + 1) : "";
  const dbInPath = pathPart.split("?")[0].replace(/\/$/, "");

  if (!dbInPath) {
    fail(
      "No database name in the URI path. The driver then authenticates against " +
        "`admin`, which fails with code 13 if your user lives in another database. " +
        `Append /${dbName} before the query string.`
    );
  } else if (dbInPath !== dbName) {
    warn(`URI database is "${dbInPath}" but MONGODB_DB is "${dbName}" — the app reads ${dbName}.`);
    ok(`database in path: ${dbInPath}`);
  } else {
    ok(`database in path: ${dbInPath}`);
  }

  // ── 3. Encoded credentials ──────────────────────────────────────────────
  // Split on the LAST "@": that is the user/password separator. An earlier one
  // belongs to a literal "@" in the password, which is exactly the case worth
  // reporting — slicing on the first would silently hide it.
  const afterScheme = uri.slice(uri.indexOf("://") + 3);
  const sep = afterScheme.lastIndexOf("@");
  if (sep > 0) {
    const creds = afterScheme.slice(0, sep);
    const [, password = ""] = creds.split(":");
    const reserved = [...password].filter((c) => ":/?#[]".includes(c));
    if (reserved.length > 0) {
      fail(
        `Password contains unencoded reserved characters: ${[...new Set(reserved)].join(" ")} — ` +
          "percent-encode them or the driver will misparse the URI."
      );
    } else if (password.includes("@")) {
      fail(
        "Password contains a literal @ — percent-encode it as %40, or it is read as the " +
          "separator between the credentials and the host."
      );
    } else if (password.includes("%")) {
      ok("credentials are percent-encoded");
    }
  }
}

// ── 4 & 5. Reachability and an authenticated read ──────────────────────────
if (uri && !problems.some((p) => p.startsWith("MONGODB_URI still"))) {
  let client = null;
  try {
    // Constructing the client can throw outright on a malformed URI — surface
    // that as a check failure, not a stack trace.
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
    await client.connect();
    ok("server reachable");

    // The read that actually authenticates. `content` is upserted by
    // getSiteContent itself, so this cannot fail for a missing collection.
    const doc = await client
      .db(dbName)
      .collection("content")
      .findOne({ key: "global_site_content" });
    ok(`authenticated read on "${dbName}" OK${doc ? "" : " (no site content document yet)"}`);

    const counts = await Promise.all(
      ["posts", "leads", "users", "content"].map(async (name) => {
        const n = await client.db(dbName).collection(name).countDocuments();
        return `${name}=${n}`;
      })
    );
    ok(`collections: ${counts.join("  ")}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Invalid connection string|invalid URI|Invalid scheme/i.test(message)) {
      fail(`the driver cannot parse this URI: ${message}`);
      console.log("      Almost always an unencoded reserved character in the credentials.");
    } else if (/auth|Unauthorized|code 18|code 13/i.test(message)) {
      fail(`authentication failed: ${message}`);
      console.log(
        "      Check, in order: the password (Atlas shows it percent-encoded — copy it\n" +
          "      from the Atlas UI, it is never re-shown in plain text), the database name\n" +
          "      in the URI path, and that the user is authorised on THIS cluster."
      );
    } else if (/ENOTFOUND|ECONNREFUSED|timeout/i.test(message)) {
      fail(`cannot reach the server: ${message}`);
      console.log(
        "      Check the cluster hostname, that the cluster is not paused/deleted, and\n" +
          "      that this machine's IP is in the Atlas Network Access allow-list."
      );
    } else {
      fail(message);
    }
  } finally {
    await client?.close().catch(() => {});
  }
}

// ── Verdict ────────────────────────────────────────────────────────────────
console.log("");
if (problems.length === 0) {
  console.log("  \x1b[32mReady.\x1b[0m The database is readable — admin edits will appear on the site.");
  console.log("");
  process.exit(0);
}

console.log("  \x1b[31mNot usable.\x1b[0m The app will fall back to data/hrms.json and serve stale content:");
console.log("    · SEO settings saved in /admin are ignored");
console.log("    · Contact details revert to the code defaults");
console.log("    · Blog posts do not appear on /insights or in the sitemap");
console.log("");
process.exit(1);