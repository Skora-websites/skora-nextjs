# Skora — marketing site + admin

Next.js App Router site for Skora — an India-registered (Noida, Uttar Pradesh)
digital studio with public marketing pages, a blog, and a small
cookie-authenticated admin for leads and content.
MongoDB stores leads, site content, posts and the admin account.

## Quick start

```bash
npm install
cp .env.example .env          # then fill in the values (see below)

npm run db:check              # verify the Atlas connection + auth
npm run db:seed-admin         # creates/updates the /admin/login account from .env
npm run dev                   # http://localhost:3001
```

For a persistent local MongoDB service on Ubuntu 24.04+ x86_64, configure
`MONGODB_URI=mongodb://127.0.0.1:27017/skora` and `MONGODB_DB=skora` in `.env`,
then run `npm run db:setup-local` once. This downloads the official MongoDB
server, installs a per-user systemd service, stores database files under
`~/.local/share/skora-mongodb`, and enables service restarts. Then run
`npm run db:check` and `npm run db:seed-admin`.

For production, use **MongoDB Atlas**: put its connection string in
`MONGODB_URI` (Atlas → Database Access → Copy Connection String) and run
`npm run db:check` before deploying. MongoDB Compass can connect using the same
URI.

Run `db:check` whenever the site looks wrong but nothing is erroring. A URI that
connects but cannot authenticate makes every read fall back to `data/hrms.json`,
so the site serves stale content — old contact details, no blog posts, SEO
settings that ignore every admin edit — with no visible error.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Next dev server on the port configured by `PORT` |
| `npm run build` / `npm start` | Production build / serve on the port configured by `PORT` |
| `npm run lint` | ESLint |
| `npm run db:check` | Verify MongoDB configuration, reachability, authentication and read access |
| `npm run db:setup-local` | Install and enable the persistent per-user MongoDB service on Ubuntu 24.04+ x86_64 |
| `npm run db:start` / `npm run db:stop` / `npm run db:status` | Control or inspect the local MongoDB service |
| `npm run db:seed-admin` | Seed the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (`-- --prune` deletes every other user) |

## Environment (`.env`, gitignored)

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Atlas connection string — **must end in the database name** (see `.env.example`) |
| `MONGODB_DB` | Database name; if omitted, the database in `MONGODB_URI` is used |
| `MONGODB_ALLOW_FALLBACK` | Set to `1` only to explicitly accept serving the JSON fallback; otherwise MongoDB failures remain visible |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL used by SEO/sitemap output |
| `NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS` | Comma-separated hosts allowed for remote image optimization |
| `NEXT_PUBLIC_LEGACY_HOSTS` | Extra hostnames that redirect to the canonical origin |
| `NEXT_PUBLIC_REDIRECT_WWW` | Set to `false` to disable the canonical `www` to apex redirect |
| `NEXT_ALLOWED_DEV_ORIGINS` | Extra comma-separated origins allowed while running `next dev` |
| `PORT` | HTTP port used by `dev` and `start`; the npm scripts load it from `.env` before Next starts |
| `NEXT_PUBLIC_SITE_CONTACT_*` | Default fallback contact phone, email, address and response guarantee |
| `NEXT_PUBLIC_SITE_NAME` / `NEXT_PUBLIC_SEO_*` / `NEXT_PUBLIC_ANALYTICS_ID` | Default SEO and analytics settings; admin-managed values can override them |
| `SUPER_ADMIN_EMAILS` | Comma-separated accounts granted the Super Admin role |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin credentials used by `db:seed-admin` |

`.env.example` is committed and holds no secrets. Credentials never appear in
source. Set `NEXT_PUBLIC_*` values before `npm run build`; those values are
embedded into the client bundle at build time.

## Layout

```
app/            pages: / /services /services/[slug] /blog /blog/[slug]
                /contact /privacy /terms, admin under /admin/*, APIs under /api/*
components/     marketing sections, animation primitives, admin UI
  admin/        PostEditor, RichTextEditor, SerpPreview, shared admin classes
context/        Preloader, consultation modal, site content provider
lib/            db + mongo driver, auth, blog, services, site defaults
scripts/        db-check.mjs, seed-admin.mjs
data/           hrms.json — local fallback when MongoDB is unavailable (gitignored)
```

Notes worth knowing:

- `lib/site-defaults.ts` is the single source for the services table and the
  contact block (phone, email, Noida address, response guarantee); `lib/lead.ts`
  is the single lead shape; `components/admin/styles.ts` holds the shared admin
  form classes. Import them instead of copying values.
- Public/legal pages are written for an India-registered company: `/privacy`
  cites the Digital Personal Data Protection Act, 2023, and the contact block
  default is the `+91` office number.
- `next.config.ts` builds `allowedDevOrigins` from your local interface
  addresses so opening the dev server by LAN IP doesn't 403 every JS chunk
  (which freezes the preloader at 1%). Extra hosts go in
  `NEXT_ALLOWED_DEV_ORIGINS`, comma-separated.
- The preloader is a CSS/type 1→100% counter with no video; it is skipped for
  `/admin`, on a repeat visit in the same session, and under
  `prefers-reduced-motion`.
- `middleware.ts` gates `/admin` on the `admin_session` cookie; the same cookie
  is what `/api/*` admin routes check.
