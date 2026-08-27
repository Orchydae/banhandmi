# Bánh and Mi

A Tamagotchi-style interactive web app for a Shiba Inu character named Bánh — the Professional Dreamer with (A)ugmented (I)nstinct. Features health meters, mood tracking, dream artifacts, favorite treats, and a terminal-style log panel.

## Tech Stack

- **React 19** + **TypeScript** — UI and type safety
- **Vite** — dev server and bundler
- **Neon** — the backend: Lakebase Postgres for data, and a Neon Function for the API
- **Hono** + **node-postgres (`pg`)** — the API itself, running as a Neon Function
- **Stripe** — donations (embedded checkout)
- **Recharts** — data visualization (weight graph, metrics)
- **Lucide React** — icons
- **React Router DOM** — client-side routing

## Architecture

The frontend is a client-only SPA, so it has no server of its own. `pg` speaks the
Postgres wire protocol and cannot run in a browser, so all database access lives
behind a Neon Function — a long-running Node handler deployed onto the Neon branch,
running in the same region as the database.

```
Browser  ──HTTPS──▶  Neon Function "banhapi"  ──pg pool──▶  Lakebase Postgres
(Vercel, static)      (Hono, us-east-2)                     (same branch)
```

**Vercel hosts the frontend only.** It builds `dist/` and serves it; it holds no
database credentials and runs no backend code. Everything server-side is Neon.

The browser never sees `DATABASE_URL`. It calls the function's public URL, which
is configured in the frontend as `VITE_API_BASE_URL`.

| Path                    | Method     | Purpose                                             |
| ----------------------- | ---------- | --------------------------------------------------- |
| `/counters`             | GET, POST  | The four meters; `POST { action }` to change one     |
| `/items?category=`      | GET        | Dream artifacts, favorite treats, disapproved items |
| `/profile`              | GET        | Birthdate, current weight, weight history           |
| `/weight`               | POST       | Append a weight reading                             |
| `/donations?sort=`      | GET        | `recent` for the marquee, `top` for the donor wall  |
| `/checkout-session`     | POST       | Creates a Stripe embedded-checkout session          |
| `/stripe-webhook`       | POST       | Records a completed donation                        |
| `/health`               | GET        | Liveness plus a database round trip                 |

The API has no user accounts and is deliberately public, matching the previous
setup. Writes are constrained by shape rather than identity: `POST /counters`
takes a named action (`feed`, `pet`, `clean`, `treat`), each mapped server-side
to a fixed counter and step, so no request can move a meter by an arbitrary
amount. Bounds are enforced again in Postgres by `increment_counter()`.

### Meter decay

The meters lose a point an hour. There is no scheduler: `tick_ogotchi()` derives
the decay from elapsed time, and `GET /counters` applies whatever is owed before
returning. Reading the meters is the only way to observe them, so computing the
decay at that moment gives the same answer a cron job would — and nothing is
missed during an outage.

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- npm
- A [Neon](https://neon.com/) account, and a project in the **`us-east-2`** region
  (Neon Functions are in public beta and only available there)

## Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/Orchydae/banhandmi.git
   cd banhandmi
   ```

2. **Install dependencies**

   ```bash
   npm install
   npm i -g neon
   ```

3. **Link the Neon project and pull its environment**

   ```bash
   neon link --project-id <your-project-id>
   neon checkout production
   ```

   `checkout` pins the branch in `.neon` and writes `DATABASE_URL`,
   `DATABASE_URL_UNPOOLED`, and the other Neon-managed variables into `.env`.
   Never edit those by hand.

4. **Fill in the rest of `.env`**

   Copy the remaining keys from `.env.example` — the Stripe credentials,
   `ALLOWED_ORIGINS`, `APP_BASE_URL`, and `VITE_API_BASE_URL`.

5. **Apply the database schema**

   ```bash
   npm run migrate
   ```

6. **Deploy the API function**

   ```bash
   npm run deploy:api
   ```

   This prints the invocation URL. Put it in `.env` as `VITE_API_BASE_URL`, and
   set the same value in the Vercel project's environment variables.

7. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:5173` against the deployed function. To run
   the function locally with hot reload instead, use `neon dev` and point
   `VITE_API_BASE_URL` at the local URL it prints.

## Scripts

| Command                                      | Description                                        |
| -------------------------------------------- | -------------------------------------------------- |
| `npm run dev`                                | Start Vite dev server with HMR                     |
| `npm run build`                              | Type-check with `tsc` then build                   |
| `npm run preview`                            | Preview the production build locally               |
| `npm run lint`                               | Run ESLint across the project                      |
| `npm run migrate`                            | Apply pending SQL migrations (`-- --dry-run` to check) |
| `npm run deploy:api`                         | Deploy the API function to the linked branch       |
| `neon dev`                                   | Run the function locally with hot reload           |

## Database

The schema lives in [`migrations/`](migrations/) as plain SQL, applied in filename
order by `scripts/migrate.mjs`, which records what it has run in a
`schema_migrations` table. Migrations use `DATABASE_URL_UNPOOLED` — the direct
connection — because PgBouncer's transaction pooling does not support the
session-level statements they need.

There are no row-level security policies. The database is never reached from a
browser, so the function is the security boundary.

### Branch-first workflow

Neon branches are copy-on-write clones. Create one whenever you would create a git
branch, and the schema change can be tested against production-like data first:

```bash
neon checkout dev-my-feature   # creates the branch, pulls its env, deploys the function to it
npm run migrate
neon diff                      # schema diff against the parent branch
```

Each branch runs its own copy of the function at its own URL, against its own
database.

## Deployment

**Frontend (Vercel).** `npm run build` produces `dist/`. Configure the project to
serve it as a static SPA, rewriting unknown paths to `index.html` so client-side
routing works. Set `VITE_API_BASE_URL` and `VITE_STRIPE_PUBLISHABLE_KEY` in the
Vercel environment — they are baked in at build time, so a change to either needs
a redeploy.

**Backend (Neon).** `npm run deploy:api` bundles and ships the function to the
linked branch. Its own secrets (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
`ALLOWED_ORIGINS`, `APP_BASE_URL`) are declared in [`neon.ts`](neon.ts) and read
from the environment at deploy time.

After the first deploy, add the Vercel production domain to `ALLOWED_ORIGINS` and
set `APP_BASE_URL` to it, then redeploy — otherwise the browser's CORS preflight
is refused and Stripe has nowhere to return the donor to.

Point the Stripe webhook endpoint at `<function-url>/stripe-webhook` and put its
signing secret in `STRIPE_WEBHOOK_SECRET`.

### A deploy does not take effect immediately

`neon deploy` marks the new deployment active right away, but a **warm isolate
keeps serving the previous bundle until it idles out** — the branch's scale-to-zero
setting, 5 minutes by default. While the function is receiving traffic that timer
keeps resetting, so a busy function can serve stale code indefinitely, and during
a rollover requests split between old and new.

This matters most for changes that live in the environment rather than the code —
a new `STRIPE_WEBHOOK_SECRET` or `ALLOWED_ORIGINS` — because the symptom is a
config-looking failure (`503 Stripe is not configured`, a refused CORS preflight)
on code that is already correct.

To confirm a deploy is really live, stop calling the function for five minutes,
then test. Don't poll while waiting — polling is what keeps the old isolate alive.

## Project Structure

```
functions/                  # Neon Function — the backend
├── index.ts                # Hono app: routes, CORS, Stripe
└── db.ts                   # pg pool, created once per isolate

migrations/                 # SQL schema, applied in filename order
scripts/migrate.mjs         # Migration runner
neon.ts                     # Which Neon services each branch runs

src/
├── components/
│   ├── DonationModal/      # Stripe embedded checkout
│   ├── DonorMarquee/       # Scrolling recent donors
│   ├── DonorWallModal/     # Donors by amount
│   ├── FeatureGrid/        # Feature menu grid
│   ├── ItemCard/           # Individual item display
│   ├── ItemGrid/           # Grid layout for items
│   ├── ItemList/           # List layout for items
│   ├── OgotchiPrototype/   # Tamagotchi-style UI (health meters, buttons, weight graph)
│   ├── ProfileHeader/      # Pet profile header
│   ├── SocialLinks/        # Social media links
│   └── TerminalPanel/      # Terminal/log display
├── modules/
│   └── CategoryPage/       # Category browsing pages
├── hooks/                  # Custom React hooks (items, hunger, mood, treats, etc.)
├── lib/
│   └── api.ts              # Client for the Neon Function
├── App.tsx                 # Root component with routing
├── main.tsx                # Entry point
└── index.css               # Global styles
```
