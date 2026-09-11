#!/usr/bin/env node
/**
 * prepare-hrms-repo.js
 *
 * Builds a manifest of HRMS-only files for the Skora-websites/hrms-skora
 * repository split. The HRMS app lives under app/hrms/ and shares libs,
 * components, hooks, and services with the marketing website — this script
 * copies every file the HRMS needs into a staging directory (excluding all
 * website-only code), ready to be pushed to the new repo.
 *
 * Usage:
 *   node scripts/prepare-hrms-repo.js                 # stage to .hrms-staging/
 *   node scripts/prepare-hrms-repo.js --out ../hrms   # stage elsewhere
 *
 * After staging:
 *   cd <out> && git init && git remote add origin git@github.com:Skora-websites/hrms-skora.git
 *   # update package.json name, commit, push to main
 */

const fs = require("fs");
const path = require("path");

const OUT = (() => {
  const i = process.argv.indexOf("--out");
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : ".hrms-staging";
})();

const ROOT = process.cwd();

// Website-only app routes (excluded from the HRMS repo).
const WEBSITE_APP_ROUTES = ["admin", "contact", "healthcare", "home", "main", "privacy", "services", "terms", "health"];

// Top-level dirs fully shared with the HRMS.
const COPY_DIRS = ["app/hrms", "components", "hooks", "lib", "services", "context", "types", "__tests__", "public"];

// data/ JSON file imported by lib/constants.ts. Only this file is tracked in
// the origin repo — data/hrms.json / skora_db.json are untracked local DB
// fallbacks holding real leads (PII), and data/db is a live MongoDB directory:
// NONE of those may enter any repository.
const DATA_FILES = ["hrms-account-roles.json"];

// Files copied from app/ root so the split repo can build. app/layout.tsx is
// rewritten as a minimal HRMS shell below (the website root layout pulls in
// SiteContentProvider + marketing Navbar/Footer the HRMS does not use).
const APP_FILES = ["globals.css", "favicon.ico"];

// API routes the HRMS depends on (under app/api).
const API_PREFIXES = ["api/auth", "api/hrm", "api/upload"];

// Root config files needed to build.
const COPY_FILES = [
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "next.config.ts",
  "postcss.config.mjs",
  "eslint.config.mjs",
  "vitest.config.ts",
  "middleware.ts",
  ".env.example",
  ".gitignore",
  "next-env.d.ts",
];

// Website-only components/contexts filtered out during the copy.
const WEBSITE_ONLY_MARKERS = [
  "components/HealthcareFooter.tsx",
  "components/HealthcareNavbar.tsx",
  "components/Footer.tsx",
  "components/Navbar.tsx",
  "components/ScrollToTop.tsx",
  "context/SiteContentContext.tsx",
];

function copyDir(src, dest, filterFn) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d, filterFn);
    else if (!filterFn || filterFn(s)) fs.copyFileSync(s, d);
  }
}

(async () => {
  console.log(`Staging HRMS-only repo to ${OUT}/`);
  if (fs.existsSync(OUT)) {
    console.log("  (clearing previous staging dir)");
    fs.rmSync(OUT, { recursive: true, force: true });
  }

  for (const f of COPY_FILES) {
    const src = path.join(ROOT, f);
    if (fs.existsSync(src)) {
      fs.mkdirSync(path.dirname(path.join(OUT, f)), { recursive: true });
      fs.copyFileSync(src, path.join(OUT, f));
    }
  }

  for (const dir of COPY_DIRS) {
    copyDir(path.join(ROOT, dir), path.join(OUT, dir));
  }

  // app/api is copied in full, then trimmed below to only the prefixes the
  // HRMS needs (auth, hrm, upload). app/hrms/api/** contains legacy re-export
  // shims ("export * from @/app/api/...") kept for old absolute /hrms/api
  // URLs; shims whose targets did not survive the trim are pruned after.
  copyDir(path.join(ROOT, "app", "api"), path.join(OUT, "app", "api"));

  // Remove website-only app routes from the staged copy.
  for (const route of WEBSITE_APP_ROUTES) {
    const p = path.join(OUT, "app", route);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  }

  // Trim app/api to only what the HRMS needs.
  const apiSrc = path.join(OUT, "app", "api");
  if (fs.existsSync(apiSrc)) {
    for (const entry of fs.readdirSync(apiSrc)) {
      const keep = API_PREFIXES.some((prefix) => entry === prefix.split("/")[1] || prefix.startsWith("api/" + entry));
      if (!keep) fs.rmSync(path.join(apiSrc, entry), { recursive: true, force: true });
    }
  }

  // Remove website-only components/contexts.
  for (const marker of WEBSITE_ONLY_MARKERS) {
    const p = path.join(OUT, marker);
    if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
  }

  // Prune legacy /hrms/api re-export shims whose target routes were not copied.
  const shimRoot = path.join(OUT, "app", "hrms", "api");
  const shims = [];
  (function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === "route.ts") shims.push(p);
    }
  })(shimRoot);
  for (const shim of shims) {
    const src = fs.readFileSync(shim, "utf8");
    const marker = src.indexOf("from \"@/app/api/");
    const target = marker === -1 ? null : path.join(OUT, src.slice(marker + 13, src.indexOf("\"", marker)).split("/").join(path.sep));
    if (!target || !fs.existsSync(target)) {
      fs.rmSync(shim);
      let dir = path.dirname(shim);
      while (dir !== shimRoot && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      }
    }
  }

  // A minimal root layout + page so `next build` succeeds without the website.
  fs.writeFileSync(
    path.join(OUT, "app", "layout.tsx"),
    `import type { ReactNode } from "react";\nimport "./globals.css";\n\nexport const metadata = {\n  title: "SKORA HRMS",\n  description: "SKORA Human Resource Management System",\n};\n\nexport default function RootLayout({ children }: { children: ReactNode }) {\n  return (\n    <html lang="en">\n      <body>{children}</body>\n    </html>\n  );\n}\n`
  );
  for (const f of APP_FILES) {
    const src = path.join(ROOT, "app", f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, "app", f));
  }
  fs.mkdirSync(path.join(OUT, "data"), { recursive: true });
  for (const f of DATA_FILES) {
    const src = path.join(ROOT, "data", f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(OUT, "data", f));
  }
  fs.writeFileSync(
    path.join(OUT, "app", "page.tsx"),
    `import { redirect } from "next/navigation";\n\nexport default function Home() {\n  redirect("/hrms");\n}\n`
  );

  console.log("✅ Staging complete. Next steps:");
  console.log(`   1. Review ${OUT}/ and adjust package.json (name, scripts) as needed.`);
  console.log("   2. Run a build inside the staging dir to verify.");
  console.log("   3. git init + push to Skora-websites/hrms-skora main branch.");
  console.log("\nVercel env vars to configure on the new project:");
  [
    "MONGODB_URI",
    "MONGODB_DB",
    "NEXT_PUBLIC_SITE_URL",
    "DEFAULT_TENANT_ID",
    "SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS (email)",
    "SESSION_SECRET (if used)",
  ].forEach((v) => console.log(`   - ${v}`));
})();
