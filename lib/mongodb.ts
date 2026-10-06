import { MongoClient, MongoClientOptions } from "mongodb";
import { promises as dnsPromises } from "dns";

const uri = process.env.MONGODB_URI?.trim();
const isPlaceholder = !uri || uri.includes("<username>") || uri.includes("<password>");

/**
 * SRV pre-resolution — Windows only.
 *
 * The driver's own `mongodb+srv://` resolution consults `dns.setServers()`, which
 * does not reliably take effect before the driver resolves on Windows. Everywhere
 * else the driver resolves SRV correctly and this function is a liability, so it
 * is skipped entirely (see `resolveSRV`).
 *
 * When it does run, two things matter and both were bugs before:
 *
 *  1. The credentials are split on the **last** `@`, not the first. A password
 *     containing `@` (which MongoDB allows) otherwise truncates the credential
 *     and produces a URI the server rejects with `Unauthorized` on every command.
 *  2. If the URI carries no credentials at all, the original URI is returned
 *     untouched. The previous version always interpolated `"@" + hosts`, which
 *     turned a credential-less URI into `mongodb://@host:27017` — a connection
 *     that succeeds and then fails every operation with
 *     `command find requires authentication`. That is the exact symptom this
 *     function used to be able to cause, so it now refuses to build that URI.
 */
const NEEDS_MANUAL_SRV_RESOLUTION = process.platform === "win32";

async function resolveSRV(srvUri: string): Promise<string> {
  if (!srvUri.startsWith("mongodb+srv://")) return srvUri;
  // The driver handles this correctly on every non-Windows platform.
  if (!NEEDS_MANUAL_SRV_RESOLUTION) return srvUri;

  try {
    dnsPromises.setServers(["8.8.8.8", "1.1.1.1"]);

    const uriBody = srvUri.replace("mongodb+srv://", "");
    // Last `@` — the separator is the one before the host list, so anything
    // earlier belongs to a percent-encoded password.
    const atIndex = uriBody.lastIndexOf("@");
    if (atIndex < 0) {
      // No embedded credentials: rewriting would silently drop them. Leave the
      // URI alone and let the driver/authSource config do its job.
      return srvUri;
    }
    const credentials = uriBody.substring(0, atIndex);
    const afterAt = uriBody.substring(atIndex + 1);

    const slashIndex = afterAt.indexOf("/");
    const hostPart = slashIndex >= 0 ? afterAt.substring(0, slashIndex) : afterAt;
    const pathAndQuery = slashIndex >= 0 ? afterAt.substring(slashIndex) : "/";

    const queryIndex = pathAndQuery.indexOf("?");
    const dbPath = queryIndex >= 0 ? pathAndQuery.substring(0, queryIndex) : pathAndQuery;
    const existingQuery = queryIndex >= 0 ? pathAndQuery.substring(queryIndex + 1) : "";

    const srvHost = "_mongodb._tcp." + hostPart;

    const [srvRecords, txtRecords] = await Promise.all([
      dnsPromises.resolveSrv(srvHost).catch(() => []),
      dnsPromises.resolveTxt(hostPart).catch(() => []),
    ]);

    if (srvRecords.length === 0) {
      console.warn("[MongoDB] No SRV records found for", srvHost);
      return srvUri;
    }

    const hosts = srvRecords.map(function(r) { return r.name + ":" + r.port; }).join(",");

    let txtParams = "";
    if (txtRecords.length > 0 && txtRecords[0].length > 0) {
      txtParams = txtRecords[0][0];
    }

    const mergedMap = new Map<string, string>();
    if (txtParams) {
      txtParams.split("&").forEach(function(p) {
        const eq = p.indexOf("=");
        if (eq > 0) mergedMap.set(p.substring(0, eq), p.substring(eq + 1));
      });
    }
    if (existingQuery) {
      existingQuery.split("&").forEach(function(p) {
        const eq = p.indexOf("=");
        if (eq > 0) mergedMap.set(p.substring(0, eq), p.substring(eq + 1));
        else if (p) mergedMap.set(p, "");
      });
    }

    const mergedParams = Array.from(mergedMap.entries())
      .map(function(e) { return e[0] + "=" + e[1]; })
      .join("&");

    // Credentials are copied through verbatim, never re-encoded. They are already
    // percent-encoded in a valid URI (`Ashish%40…` is a password containing
    // `@`), so running encodeURIComponent over them would double-encode `%40`
    // into `%2540` and turn a working password into a wrong one. The
    // `lastIndexOf("@")` above is what protects a *literal* `@` in the password;
    // the driver handles the already-encoded form.
    let directUri = "mongodb://" + credentials + "@" + hosts + "/" + dbPath;
    if (mergedParams) directUri += "?" + mergedParams;

    return directUri;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn("[MongoDB] SRV resolution failed, using original URI:", message);
    return srvUri;
  }
}

// TLS / retryWrites / majority write concern only make sense against Atlas.
// A local standalone mongod (mongodb://127.0.0.1:27017) rejects a TLS handshake,
// so keep those options conditional on the connection string.
const isLocalUri = /^mongodb:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?(\/|\?|$)/.test(uri || "");
const uriDatabaseName = uri
  ?.replace(/^mongodb(?:\+srv)?:\/\/[^/]+/, "")
  .split("?")[0]
  .replace(/^\/+|\/+$/g, "");
const databaseName = process.env.MONGODB_DB?.trim() || uriDatabaseName;

if (uri && !databaseName) {
  throw new Error("MONGODB_DB must be set when MONGODB_URI does not include a database name.");
}

const clientOptions: MongoClientOptions = isLocalUri
  ? {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      retryWrites: true,
    }
  : {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      tls: true,
      retryWrites: true,
      w: "majority" as MongoClientOptions["w"],
    };

async function connectWithRetry(retries = 2): Promise<MongoClient | null> {
  if (!uri || isPlaceholder) {
    console.warn("[MongoDB] No valid MONGODB_URI configured.");
    return null;
  }

  const resolvedUri = await resolveSRV(uri);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const client = new MongoClient(resolvedUri, clientOptions);
      await client.connect();
      return client;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[MongoDB] Connection attempt " + (attempt + 1) + " failed:", message);
      if (attempt < retries) {
        await new Promise(function(r) { setTimeout(r, 1000 * (attempt + 1)); });
      }
    }
  }
  console.error("[MongoDB] All connection attempts failed — check MONGODB_URI and that mongod is running.");
  return null;
}

type MongoGlobal = typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient | null>;
  _mongoRetryTimer?: ReturnType<typeof setTimeout>;
};

// A connection attempt that fails must not be cached forever. The cached
// promise is dropped a short while after a failure so the next request starts a
// fresh attempt — otherwise a mongod that was down when the app booted would
// keep every request reporting "database not available" until a restart.
const FAILURE_COOLDOWN_MS = 5000;

const globalWithMongo = global as MongoGlobal;

function handleFailedConnect() {
  if (globalWithMongo._mongoRetryTimer) return;
  globalWithMongo._mongoRetryTimer = setTimeout(function() {
    globalWithMongo._mongoRetryTimer = undefined;
    globalWithMongo._mongoClientPromise = undefined;
  }, FAILURE_COOLDOWN_MS);
}

// The cached promise may have been created by an earlier instance of this
// module (dev reload / HMR) and settled while the database was unreachable.
// Forget it as soon as it turns out to be a failed connection.
const cachedAtLoad = globalWithMongo._mongoClientPromise;
if (cachedAtLoad) {
  cachedAtLoad.then(
    function(client) {
      if (!client && globalWithMongo._mongoClientPromise === cachedAtLoad) {
        globalWithMongo._mongoClientPromise = undefined;
      }
    },
    function() {
      if (globalWithMongo._mongoClientPromise === cachedAtLoad) {
        globalWithMongo._mongoClientPromise = undefined;
      }
    }
  );
}

function getMongoClient(): Promise<MongoClient | null> {
  if (!uri || isPlaceholder) return Promise.resolve(null);

  if (globalWithMongo._mongoClientPromise) {
    return globalWithMongo._mongoClientPromise;
  }

  const promise = connectWithRetry();
  globalWithMongo._mongoClientPromise = promise;

  promise.then(
    function(client) {
      if (!client) handleFailedConnect();
    },
    function() {
      handleFailedConnect();
    }
  );

  return promise;
}

/** True when MONGODB_URI is set and usable — callers fall back to the local JSON store otherwise. */
function hasMongoConfig(): boolean {
  return Boolean(uri && !isPlaceholder);
}

/**
 * Proves the configured database is actually readable, not merely reachable.
 *
 * `client.connect()` succeeding proves almost nothing: a MongoDB server accepts
 * an unauthenticated TCP/TLS connection and only rejects it when a command is
 * issued. A credential-less or mangled URI therefore produces
 * `code: 13 Unauthorized` on `find` while `connect()` reports success — and
 * because every read in `lib/db.ts` catches that and falls back to
 * `data/hrms.json`, the site keeps serving *plausible but wrong* content: stale
 * contact details, no blog posts, and SEO settings that silently ignore every
 * admin edit. That failure mode is invisible from the outside, which is exactly
 * how it survived a deploy.
 *
 * So this issues a real read. It is what turns "the build succeeded and the
 * pages render" into an actual answer about whether the database is in play.
 */
async function verifyMongoAccess(client: MongoClient): Promise<{ ok: boolean; detail: string }> {
  try {
    // A find against a collection every deployment has: `content` is upserted by
    // `getSiteContent` itself, so this cannot fail for lack of the collection.
    await client.db(DB_NAME_FOR_PROBE).collection("content").findOne({ key: "global_site_content" });
    return { ok: true, detail: "content read OK" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, detail: message };
  }
}

/** Probe target — the same database the app reads from. */
const DB_NAME_FOR_PROBE = databaseName;

/**
 * Set to true when a configured database turned out to be unusable. Read by
 * `assertMongoUsable` below, which decides whether to fail the boot.
 */
const mongoState = { configured: hasMongoConfig(), verified: false, ok: false, detail: "" };

/**
 * Fails the boot when a database is configured but cannot be read.
 *
 * This is the check that turns "the build succeeded and every page renders" into
 * an actual answer about whether the database is in play. Without it, a URI that
 * connects but cannot authenticate makes every read in `lib/db.ts` fall back to
 * `data/hrms.json` — and that file is gitignored, so the site serves code
 * defaults while looking perfectly healthy: stale contact details, no blog
 * posts, and SEO settings that silently ignore every admin edit.
 *
 * Skipped when `MONGODB_ALLOW_FALLBACK=1`, which is how an intentional
 * JSON-only deploy opts out.
 */
export async function assertMongoUsable(): Promise<void> {
  const state = await reportMongoHealth();
  if (state.ok) return;

  if (!state.configured) {
    // No URI is a legitimate setup — a static build with no database at all.
    if (process.env.NODE_ENV === "production" && process.env.MONGODB_ALLOW_FALLBACK !== "1") {
      console.warn(
        "[boot] MONGODB_URI is not set, so the site is serving data/hrms.json only. " +
          "Set MONGODB_URI, or set MONGODB_ALLOW_FALLBACK=1 to acknowledge this is intended."
      );
    }
    return;
  }

  // Configured but unreadable: the dangerous case, because it looks healthy.
  console.error("");
  console.error("  ┌──────────────────────────────────────────────────────────────┐");
  console.error("  │  DATABASE CONFIGURED BUT NOT USABLE                          │");
  console.error("  └──────────────────────────────────────────────────────────────┘");
  console.error(`  ${state.detail}`);
  console.error("  Every database read is falling back to data/hrms.json, which means:");
  console.error("    · SEO settings saved in /admin are ignored");
  console.error("    · Contact details revert to the code defaults");
  console.error("    · Blog posts do not appear on /insights or in the sitemap");
  console.error("");

  const shouldAllowFallback = process.env.MONGODB_ALLOW_FALLBACK === "1";

  if (process.env.NODE_ENV === "production" && !shouldAllowFallback) {
    console.error("  Refusing to start. Fix MONGODB_URI, or set MONGODB_ALLOW_FALLBACK=1");
    console.error("  to start anyway and accept the stale-content fallback.");
    console.error("");
    process.exit(1);
  }
}

/**
 * Runs the read probe and prints a verdict.
 *
 * Deliberately does NOT throw or exit here — `assertMongoUsable` decides that,
 * so the probe itself stays callable from scripts and tests.
 */
export async function reportMongoHealth(): Promise<typeof mongoState> {
  if (!mongoState.configured) {
    mongoState.verified = true;
    mongoState.ok = false;
    mongoState.detail = "not configured — using the local JSON store";
    console.warn("[MongoDB] MONGODB_URI is not set. Serving data/hrms.json only.");
    return mongoState;
  }

  const client = await getMongoClient();
  if (!client) {
    mongoState.verified = true;
    mongoState.ok = false;
    mongoState.detail = "could not connect";
    console.error("[MongoDB] Connection failed — MONGODB_URI is set but unreachable.");
    return mongoState;
  }

  const { ok, detail } = await verifyMongoAccess(client);
  mongoState.verified = true;
  mongoState.ok = ok;
  mongoState.detail = detail;
  if (ok) {
    console.log(`[MongoDB] Connected and readable (${DB_NAME_FOR_PROBE}).`);
  } else {
    // The message that matters, because this is the case that hides: the
    // connection looks fine, so nothing else in the app reports a problem.
    console.error(
      "[MongoDB] CONFIGURED BUT NOT USABLE — every read is falling back to data/hrms.json," +
        " so admin edits (SEO, contact details, blog posts) will NOT appear on the site."
    );
    console.error("[MongoDB] Underlying error:", detail);
    console.error("[MongoDB] Check MONGODB_URI: credentials embedded as user:pass@host, and the user authorised on the cluster.");
  }
  return mongoState;
}

// Start connecting as soon as the module loads so the first request doesn't pay
// for it, then run the usability check. A failure here is recovered lazily by
// getMongoClient(), but `assertMongoUsable` decides whether the process should
// keep running.
if (hasMongoConfig()) {
  getMongoClient().then(() => assertMongoUsable());
}

export { getMongoClient, hasMongoConfig };
