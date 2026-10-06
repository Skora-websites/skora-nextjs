#!/usr/bin/env node
/**
 * Seeds the single admin account used to access /admin/login.
 *
 * Credentials are NEVER read from code — only from the environment or an
 * interactive prompt:
 *
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run db:seed-admin
 *
 * Both are normally set in .env (gitignored). If ADMIN_PASSWORD is missing the
 * script prompts for it without echoing. Add --prune to delete every other user
 * so the account list contains only this one credential.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

function readEnvFile() {
  const out = {};
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (!hidden) {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }
    // Hidden prompt: suppress echo while the answer is typed.
    const onData = (chunk) => {
      const text = String(chunk);
      if (text.includes("\n") || text.includes("\r")) rl.output.write("\n");
      else rl.output.write("*");
    };
    rl.output.on("data", onData);
    rl.question(question, (answer) => {
      rl.output.off("data", onData);
      rl.close();
      resolve(answer.trim());
    });
  });
}

const prune = process.argv.includes("--prune");

async function main() {
  const fileEnv = readEnvFile();
  const env = (key) => process.env[key] ?? fileEnv[key];

  // No localhost default: Atlas is the only database this project uses. Falling
// back to 127.0.0.1 here would silently seed an admin into a local mongod that
// nothing else reads.
const uri = (env("MONGODB_URI") || "").trim();
if (!uri || uri.includes("<username>") || uri.includes("<password>")) {
  throw new Error(
    "MONGODB_URI is not set (or still has placeholders). Set it in .env — see .env.example."
  );
}
  let uriDbName = "";
  try {
    uriDbName = new URL(uri).pathname.replace(/^\/+/, "").split("/")[0];
  } catch {
    throw new Error("MONGODB_URI is not a valid connection URL.");
  }
  const dbName = (env("MONGODB_DB") || uriDbName || "").trim();
  if (!dbName) {
    throw new Error("MONGODB_DB must be set when MONGODB_URI does not include a database name.");
  }

  const email = (env("ADMIN_EMAIL") || (await ask("Admin email: "))).trim();
  if (!email) throw new Error("No admin email provided.");

  let password = (env("ADMIN_PASSWORD") || "").trim();
  if (!password) {
    password = await ask(`Admin password for ${email}: `, { hidden: true });
    if (!password) throw new Error("No admin password provided.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  await client.connect();
  try {
    const users = client.db(dbName).collection("users");
    const identifier = email.toLowerCase();

    const existing = await users.findOne(
      { $or: [{ email: identifier }, { username: identifier }] },
      { collation: { locale: "en", strength: 2 } }
    );

    const doc = {
      email: identifier,
      username: existing?.username || identifier,
      role: "super_admin",
      loginStatus: "active",
      passwordHash,
      displayName: existing?.displayName || "Administrator",
      updatedAt: new Date(),
    };

    if (existing) {
      await users.updateOne({ _id: existing._id }, { $set: doc, $setOnInsert: { createdAt: new Date() } });
      console.log(`[seed] updated admin '${identifier}' (role super_admin), password replaced.`);
    } else {
      await users.insertOne({ ...doc, createdAt: new Date() });
      console.log(`[seed] created admin '${identifier}' (role super_admin).`);
    }

    const others = await users
      .find({ email: { $ne: identifier } }, { projection: { email: 1, role: 1 } })
      .toArray();

    if (others.length === 0) {
      console.log(`[seed] ${dbName}.users now contains only this credential.`);
    } else if (prune) {
      const res = await users.deleteMany({ email: { $ne: identifier } });
      console.log(`[seed] pruned ${res.deletedCount} other user(s); only '${identifier}' remains.`);
    } else {
      console.log(`[seed] other users present (run with --prune to remove them):`);
      for (const u of others) console.log(`        - ${u.email} (${u.role || "no role"})`);
    }
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("[seed] failed:", err.message);
  process.exit(1);
});
