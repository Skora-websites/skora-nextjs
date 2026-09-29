# Skora — marketing site + admin

Next.js App Router site for Skora (public marketing pages, blog, healthcare
division) with a small cookie-authenticated admin for leads and content.
MongoDB stores leads, site content, posts and the admin account.

## Quick start

```bash
npm install
cp .env.example .env          # then fill in the values (see below)

npm run db:start              # local mongod on 127.0.0.1:27017
npm run db:seed-admin         # creates/updates the /admin/login account from .env
npm run dev                   # http://localhost:3001
```

MongoDB runs as your user (no sudo, no systemd): binaries and data live in
`~/.local/share/mongodb`, MongoDB Compass can browse the same server on
`mongodb://127.0.0.1:27017`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next dev server on port **3001** |
| `npm run build` / `npm start` | Production build / serve on port 3001 |
| `npm run lint` | ESLint |
| `npm run db:start` / `db:stop` / `db:status` / `db:logs` | Local mongod control |
| `npm run db:seed-admin` | Seed the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`-- --prune` deletes every other user) |
| `npm run test:e2e` | Playwright login suite (starts the dev server if it isn't running) |
| `npm run test:e2e:ui` / `test:e2e:report` | Playwright UI mode / last HTML report |

## Environment (`.env`, gitignored)

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` locally; an Atlas URI also works |
| `MONGODB_DB` | Database name (default `skora`) |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used by SEO/sitemap output |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin credentials used by `db:seed-admin` and the e2e tests |

`.env.example` is committed and holds no secrets. Credentials never appear in
source, tests or fixtures — the e2e suite skips itself when they are unset, and
its throwaway users get random passwords and are deleted afterwards.

## Layout

```
app/            pages: / /services /services/[slug] /blog /blog/[slug] /healthcare
                /contact /privacy /terms, admin under /admin/*, APIs under /api/*
components/     marketing sections, animation primitives, admin UI
  admin/        PostEditor, RichTextEditor, SerpPreview, shared admin classes
context/        Preloader, consultation modal, site content provider
lib/            db + mongo driver, auth, blog, services, site defaults
e2e/            Playwright specs (admin login flow)
scripts/        local-mongo.sh, seed-admin.mjs
data/           hrms.json — local fallback when MongoDB is unavailable (gitignored)
```

Notes worth knowing:

- `lib/site-defaults.ts` is the single source for default packages, the
  services table and the contact block; `lib/lead.ts` is the single lead shape;
  `components/admin/styles.ts` holds the shared admin form classes. Import
  them instead of copying values.
- `next.config.ts` builds `allowedDevOrigins` from your local interface
  addresses so opening the dev server by LAN IP doesn't 403 every JS chunk
  (which freezes the preloader at 1%). Extra hosts go in
  `NEXT_ALLOWED_DEV_ORIGINS`, comma-separated.
- The preloader is a CSS/type 1→100% counter with no video; it is skipped for
  `/admin`, on a repeat visit in the same session, and under
  `prefers-reduced-motion`.
- `middleware.ts` gates `/admin` on the `admin_session` cookie; the same cookie
  is what `/api/*` admin routes check.

## Testing

`npm run test:e2e` runs the 15-test admin login suite against Chromium using
your installed Google Chrome (`channel: "chrome"`), covering lookup by email or
username (case-insensitive), role and disabled-account rejection, session
cookie behaviour, and the JSON error contract. It needs `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in `.env` and a running mongod.
