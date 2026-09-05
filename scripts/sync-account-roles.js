/**
 * Sync script: aligns the HRMS users collection with the authoritative
 * email → role map (data/hrms-account-roles.json).
 *
 * SAFE / IDEMPOTENT — unlike the seed scripts it never deletes users, never
 * wipes collections, and never touches passwords, status, or mustChangePassword
 * for existing accounts. Rerunnable at any time.
 *
 *   Role is always synced to the map. Profile fields (displayName, department,
 *   designation, employeeCode) are only filled in when currently empty.
 *   Accounts in the map that don't exist yet are created with the default
 *   password "Password@123" (+ forced password change for non-super admins).
 *
 * Usage:
 *   node scripts/sync-account-roles.js            # dry run (prints the diff)
 *   node scripts/sync-account-roles.js --apply    # write changes to MongoDB
 */
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

// ── Load env (skip placeholder values) ─────────────────────────────
[".env", ".env.local"].forEach((f) => {
  try {
    const lines = fs.readFileSync(f, "utf-8").split("\n");
    lines.forEach((l) => {
      l = l.trim();
      if (l && !l.startsWith("#") && l.includes("=")) {
        const eq = l.indexOf("=");
        const k = l.substring(0, eq).trim();
        const v = l.substring(eq + 1).trim();
        if (v.includes("<username>") || v.includes("<password>") || v.includes("<cluster>")) return;
        if (!process.env[k]) process.env[k] = v;
      }
    });
  } catch {}
});

// If the system DNS resolver refuses SRV lookups (common on some networks),
// resolve the Atlas shard hosts + TXT params through Cloudflare DNS-over-HTTPS
// and build a direct `mongodb://host1:27017,host2:27017,...` connection string.
function paramFrom(entries, name) {
  const needle = name.toLowerCase();
  for (const p of entries) {
    const i = p.indexOf("=");
    if (i > 0 && p.substring(0, i).toLowerCase() === needle) return p.substring(i + 1);
  }
  return null;
}

async function resolveViaDoH(uri) {
  const m = uri.match(/^mongodb\+srv:\/\/([^@]+)@([^/]+)\/([^?]*)\??(.*)$/);
  if (!m) return null;
  const creds = m[1];
  const host = m[2];
  const dbPath = m[3];
  const queryEntries = (m[4] || "").split("&").filter(Boolean);
  try {
    const h = { accept: "application/dns-json" };
    const srvRes = await fetch(
      `https://cloudflare-dns.com/dns-query?name=_mongodb._tcp.${host}&type=SRV`,
      { headers: h }
    ).then((r) => r.json());
    const txtRes = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${host}&type=TXT`,
      { headers: h }
    ).then((r) => r.json());
    const shards = (srvRes.Answer || [])
      .map((a) => a.data.trim().replace(/\.$/, "").split(/\s+/).pop())
      .filter(Boolean);
    if (shards.length === 0) return null;
    const txtParams = [];
    (txtRes.Answer || []).forEach((a) => {
      const txt = Array.isArray(a.data) ? a.data.join("") : a.data;
      // TXT payloads arrive with literal surrounding quotes in dns-json
      txt.split("&").forEach((p) => txtParams.push(p.replace(/"/g, "")));
    });
    // Build the query string with exact casing the driver understands.
    const parts = [];
    const rs = paramFrom(txtParams, "replicaSet") || paramFrom(queryEntries, "replicaSet");
    if (rs) parts.push(`replicaSet=${encodeURIComponent(rs)}`);
    parts.push("authSource=admin");
    parts.push("tls=true");
    if (!paramFrom(queryEntries, "retryWrites")) parts.push("retryWrites=true");
    if (!paramFrom(queryEntries, "w")) parts.push("w=majority");
    const hosts = shards.map((s) => s + ":27017").join(",");
    return `mongodb://${creds}@${hosts}/${dbPath}?${parts.join("&")}`;
  } catch {
    return null;
  }
}

async function connect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env / .env.local");
    process.exit(1);
  }
  console.log("Connecting to MongoDB...");
  const attempts = [uri];
  if (uri.startsWith("mongodb+srv://")) {
    const direct = await resolveViaDoH(uri);
    if (direct) attempts.push(direct);
  }
  let lastErr;
  for (const target of attempts) {
    let c;
    try {
      c = new MongoClient(target, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 20000,
        connectTimeoutMS: 15000,
        retryWrites: true,
        w: "majority",
      });
      await c.connect();
      const defaultDb = c.options.dbName || "hrms";
      console.log("Connected. Database:", defaultDb);
      return { db: c.db(defaultDb), close: () => c.close() };
    } catch (e) {
      lastErr = e;
      console.log("  attempt failed:", e.message);
      try { if (c) await c.close(); } catch {}
    }
  }
  throw lastErr || new Error("Could not connect to MongoDB");
}

const DEFAULT_PASSWORD = "Password@123";

function missingProfileFields(acct, existing) {
  const set = {};
  if (!existing.displayName) set.displayName = acct.displayName;
  if (!existing.firstName) set.firstName = acct.firstName;
  if (!existing.lastName) set.lastName = acct.lastName || "";
  if (!existing.department) set.department = acct.department;
  if (!existing.departmentName) set.departmentName = acct.department;
  if (!existing.designation) set.designation = acct.designation;
  if (!existing.designationName) set.designationName = acct.designation;
  if (!existing.employeeCode) set.employeeCode = acct.employeeCode;
  return set;
}

async function run() {
  const apply = process.argv.includes("--apply");
  const mapPath = path.join(process.cwd(), "data", "hrms-account-roles.json");
  const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
  const emails = Object.keys(map);

  console.log(apply ? "APPLY MODE — writing to MongoDB" : "DRY RUN — no changes written");
  console.log("Using map:", mapPath, `(${emails.length} accounts)\n`);

  const { db, close } = await connect();
  const users = db.collection("users");

  const rows = [];
  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const email of emails) {
    const acct = map[email];
    const q = { email: new RegExp("^" + email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$", "i") };
    const found = await users.find(q).toArray();

    if (found.length === 0) {
      // Create missing account
      const doc = {
        email: email.toLowerCase(),
        emailVerified: true,
        displayName: acct.displayName,
        firstName: acct.firstName,
        lastName: acct.lastName || "",
        role: acct.role,
        status: "active",
        loginStatus: "enabled",
        department: acct.department,
        departmentName: acct.department,
        designation: acct.designation,
        designationName: acct.designation,
        employeeCode: acct.employeeCode,
        passwordHash: await bcrypt.hash(DEFAULT_PASSWORD, 12),
        mustChangePassword: acct.role !== "super_admin",
        tenantId: "default",
        phone: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (apply) await users.insertOne(doc);
      created++;
      rows.push([email, "MISSING", acct.role, "CREATE"]);
      continue;
    }

    if (found.length > 1) {
      rows.push([email, "DUPLICATE", acct.role, `WARN: ${found.length} records exist — updating all`]);
    }

    const actions = [];
    const patchRole = found.some((u) => u.role !== acct.role);
    if (patchRole) actions.push("role → " + acct.role);

    let setProfile = {};
    // Fill profile fields only when empty (never overwrite real data)
    for (const u of found) {
      const fills = missingProfileFields(acct, u);
      for (const [k, v] of Object.entries(fills)) setProfile[k] = v;
    }
    const profileKeys = Object.keys(setProfile);
    if (profileKeys.length) actions.push("fill profile: " + profileKeys.join(", "));

    if (patchRole || profileKeys.length) {
      const update = { $set: { ...setProfile, updatedAt: new Date() } };
      if (patchRole) update.$set.role = acct.role;
      if (apply) await users.updateMany(q, update);
      updated++;
      rows.push([email, found.length > 1 ? `${found.length}x` : "OK", acct.role, actions.join("; ") || "no-op"]);
    } else {
      unchanged++;
      rows.push([email, found.length > 1 ? `${found.length}x` : "OK", acct.role, "already correct"]);
    }
  }

  // ── Summary table ────────────────────────────────────────────
  console.log("EMAIL".padEnd(34) + "STATE".padEnd(10) + "MAP ROLE".padEnd(13) + "ACTION");
  console.log("-".repeat(90));
  for (const [email, state, role, action] of rows) {
    console.log(email.padEnd(34) + state.padEnd(10) + role.padEnd(13) + action);
  }
  console.log("-".repeat(90));
  console.log(`Created: ${created} | Updated: ${updated} | Already correct: ${unchanged}`);  if (!apply) {
    console.log("\nDry run finished — re-run with --apply to write the changes.");
  } else {
    console.log("\nDone. Log in again with each email to pick up the new role cookie.");
  }
  await close();
  process.exit(0);
}

run().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
