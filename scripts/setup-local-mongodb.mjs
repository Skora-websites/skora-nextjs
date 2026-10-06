#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const VERSION = "8.0.21";
const ARCHIVE = `mongodb-linux-x86_64-ubuntu2404-${VERSION}.tgz`;
const URL = `https://fastdl.mongodb.org/linux/${ARCHIVE}`;
const SHA256 = "07964fb48bf840a1f489f8465db12143dfe20cbb58d75fa638f6b22f3584774d";
const HOME = os.homedir();
const INSTALL_DIR = path.join(HOME, ".local", "opt", "skora-mongodb", VERSION);
const DATA_DIR = path.join(HOME, ".local", "share", "skora-mongodb");
const STATE_DIR = path.join(HOME, ".local", "state", "skora-mongodb");
const CONFIG_DIR = path.join(HOME, ".config", "skora-mongodb");
const UNIT_DIR = path.join(HOME, ".config", "systemd", "user");
const CONFIG_PATH = path.join(CONFIG_DIR, "mongod.conf");
const UNIT_PATH = path.join(UNIT_DIR, "skora-mongodb.service");
const MONGOD = path.join(INSTALL_DIR, "bin", "mongod");

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} exited with status ${result.status}`);
  }
}

function runCapture(command, args) {
  return execFileSync(command, args, { encoding: "utf8" }).trim();
}

if (process.platform !== "linux" || process.arch !== "x64") {
  throw new Error("The local MongoDB installer currently supports x86_64 Ubuntu Linux.");
}

const osRelease = await fs.readFile("/etc/os-release", "utf8");
const osId = osRelease.match(/^ID="?([^"\n"]+)/m)?.[1];
const osVersion = osRelease.match(/^VERSION_ID="?([^"\n"]+)/m)?.[1];
const [osMajor, osMinor] = (osVersion || "").split(".").map(Number);
if (osId !== "ubuntu" || osMajor < 24 || (osMajor === 24 && osMinor < 4)) {
  throw new Error("MongoDB's Ubuntu 24.04 build requires Ubuntu 24.04 or newer.");
}

if (!await fs.access(MONGOD).then(() => true, () => false)) {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "skora-mongodb-"));
  const archivePath = path.join(tempDir, ARCHIVE);
  try {
    console.log(`[mongodb] Downloading MongoDB ${VERSION} from the official MongoDB server`);
    run("curl", ["--fail", "--location", "--retry", "3", "--output", archivePath, URL]);
    const checksum = runCapture("sha256sum", [archivePath]).split(/\s+/)[0];
    if (checksum !== SHA256) {
      throw new Error(`MongoDB archive checksum mismatch: expected ${SHA256}, got ${checksum}`);
    }
    await fs.mkdir(INSTALL_DIR, { recursive: true });
    run("tar", ["-xzf", archivePath, "--strip-components=1", "-C", INSTALL_DIR]);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

await Promise.all([
  fs.mkdir(DATA_DIR, { recursive: true }),
  fs.mkdir(STATE_DIR, { recursive: true }),
  fs.mkdir(CONFIG_DIR, { recursive: true }),
  fs.mkdir(UNIT_DIR, { recursive: true }),
]);

await fs.writeFile(
  CONFIG_PATH,
  [
    "storage:",
    `  dbPath: "${DATA_DIR}"`,
    "systemLog:",
    "  destination: file",
    `  path: "${path.join(STATE_DIR, "mongod.log")}"`,
    "  logAppend: true",
    "net:",
    "  bindIp: 127.0.0.1",
    "  port: 27017",
    "processManagement:",
    "  fork: false",
    "",
  ].join("\n"),
  { mode: 0o600 }
);

await fs.writeFile(
  UNIT_PATH,
  [
    "[Unit]",
    "Description=Skora local MongoDB",
    "After=network.target",
    "",
    "[Service]",
    "Type=simple",
    `ExecStart=${MONGOD} --config ${CONFIG_PATH}`,
    "Restart=on-failure",
    "RestartSec=5",
    "LimitNOFILE=64000",
    "",
    "[Install]",
    "WantedBy=default.target",
    "",
  ].join("\n"),
  { mode: 0o600 }
);

run("systemctl", ["--user", "daemon-reload"]);
run("systemctl", ["--user", "enable", "skora-mongodb.service"]);
run("systemctl", ["--user", "restart", "skora-mongodb.service"]);

const version = runCapture(MONGOD, ["--version"]).split("\n")[0];
console.log(`[mongodb] ${version}`);
console.log(`[mongodb] Persistent data: ${DATA_DIR}`);
console.log("[mongodb] Service enabled for user-session startup.");
