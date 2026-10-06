import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");

const [command, ...extraArgs] = process.argv.slice(2);
if (!["dev", "build", "start"].includes(command)) {
  throw new Error("Usage: node scripts/run-next.mjs <dev|build|start> [...next args]");
}

loadEnvConfig(process.cwd(), command === "dev");

const args = [];
if (command !== "build") {
  const port = Number(process.env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be set in .env to a valid TCP port (1-65535).");
  }
  args.push("-p", String(port));
}
args.push(...extraArgs);

const nextCli = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextCli, command, ...args], {
  stdio: "inherit",
  env: process.env,
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", (error) => {
  console.error("[next] Failed to start Next.js:", error.message);
  process.exitCode = 1;
});

child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
