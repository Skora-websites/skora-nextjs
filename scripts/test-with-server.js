#!/usr/bin/env node
/**
 * test-with-server.js
 *
 * Cross-platform script that ensures the Next.js dev server is running
 * on port 3000 before executing the vitest integration test suite.
 *
 * Usage:
 *   node scripts/test-with-server.js           # run all tests
 *   node scripts/test-with-server.js --watch    # watch mode
 */

const { execSync, spawn } = require("child_process");
const http = require("http");
const path = require("path");

const PORT = process.env.TEST_PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;
let serverProcess = null;
let startedServer = false;

// ── Helpers ─────────────────────────────────────────────

function isPortInUse(port) {
  return new Promise((resolve) => {
    const req = http.get(`${BASE_URL}/`, { timeout: 2000 }, (res) => {
      res.resume();
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

function waitForServer(maxRetries = 60) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const check = async () => {
      if (await isPortInUse(PORT)) {
        console.log(`✓ Dev server ready on ${BASE_URL}`);
        return resolve();
      }
      retries++;
      if (retries >= maxRetries) {
        reject(new Error(`Dev server did not start within ${maxRetries}s`));
      } else {
        setTimeout(check, 1000);
      }
    };
    check();
  });
}

function startServer() {
  console.log(`Starting dev server on port ${PORT}...`);
  const nextBin = path.join(
    __dirname,
    "..",
    "node_modules",
    ".bin",
    "next"
  );
  serverProcess = spawn(
    process.platform === "win32" ? "npx" : nextBin,
    process.platform === "win32"
      ? ["next", "dev", "-p", String(PORT)]
      : ["dev", "-p", String(PORT)],
    {
      cwd: path.join(__dirname, ".."),
      stdio: "ignore",
      detached: process.platform !== "win32",
    }
  );
  startedServer = true;
  serverProcess.on("error", (err) => {
    console.error("Failed to start dev server:", err.message);
    process.exit(1);
  });
}

function cleanup() {
  if (startedServer && serverProcess) {
    console.log("\nStopping dev server...");
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /PID ${serverProcess.pid} /T /F`, {
          stdio: "ignore",
        });
      } else {
        process.kill(-serverProcess.pid, "SIGTERM");
      }
    } catch {
      // Already stopped
    }
    console.log("✓ Dev server stopped");
  }
}

// ── Main ────────────────────────────────────────────────

async function main() {
  const watchMode = process.argv.includes("--watch");

  if (await isPortInUse(PORT)) {
    console.log(`Dev server already running on ${BASE_URL}`);
  } else {
    startServer();
    await waitForServer();
  }

  console.log("\nRunning tests...");
  console.log("─".repeat(50));

  const vitestArgs = watchMode ? [] : ["run"];
  const vitest = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["vitest", ...vitestArgs],
    {
      cwd: path.join(__dirname, ".."),
      stdio: "inherit",
      shell: process.platform === "win32",
    }
  );

  vitest.on("close", (code) => {
    console.log("");
    console.log("─".repeat(50));
    if (code === 0) {
      console.log("✓ All tests passed");
    } else {
      console.log(`✗ Some tests failed (exit code ${code})`);
    }
    cleanup();
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error(err.message);
  cleanup();
  process.exit(1);
});
