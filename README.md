# Aptitude — SAT Practice App

A full-stack SAT practice app: Google sign-in, a practice session flow
across Math/Reading/Writing, and a progress dashboard with accuracy
breakdowns and a study streak.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Auth.js v5** (`next-auth@5`) with Google sign-in
- **Postgres** via the plain `pg` driver + `@auth/pg-adapter` (no ORM —
  works with any Postgres host, including Vercel Postgres, with zero
  extra build steps)
- **Tailwind CSS v4** for styling
- **Recharts** for the progress charts
- Practice problems live in `src/data/problems.json` — a plain file you
  edit by hand, as requested, no admin UI or database table for them

## Project structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── signin/page.tsx             # Custom Google sign-in page
│   ├── practice/
│   │   ├── page.tsx                # Subject picker
│   │   └── [subject]/page.tsx      # Topic filter + practice session
│   ├── reports/page.tsx            # Progress dashboard (server component)
│   └── api/
│       ├── auth/[...nextauth]/     # Auth.js route handler
│       ├── attempts/route.ts       # POST: submit an answer, get scored
│       └── reports/route.ts        # GET: this user's report data (JSON)
├── auth.ts                          # Auth.js config (Google + Postgres adapter)
├── proxy.ts                         # Route protection (Next.js 16's replacement for middleware.ts)
├── components/
│   ├── Header.tsx                   # Nav + sign in/out
│   ├── PracticeSession.tsx          # Interactive question loop (client)
│   └── ReportCharts.tsx             # Charts + tables (client)
├── lib/
│   ├── db.ts                        # Postgres connection pool
│   ├── problems.ts                  # Reads/queries problems.json
│   └── attempts.ts                  # Records attempts, builds report data
├── data/problems.json               # <-- Edit this to add/change questions
└── types/                           # Shared TypeScript types

db/schema.sql            # Run once against your database (see below)
scripts/apply-schema.mjs # Applies schema.sql for you (npm run db:push)
```

## 1. Local setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
- `DATABASE_URL` — any Postgres connection string (a local Postgres, a
  free Neon/Supabase project, whatever you have handy for development)
- `AUTH_SECRET` — generate with `npx auth secret`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — see step 2 below

Then create the tables and start the dev server:

```bash
npm run db:push   # applies db/schema.sql to whatever DB is in .env.local
npm run dev
```

## 2. Setting up Google sign-in

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) →
   APIs & Services → Credentials.
2. Create an **OAuth client ID** (type: Web application).
3. Add an authorized redirect URI:
   - Local dev: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://your-app.vercel.app/api/auth/callback/google`
     (add this once you know your Vercel domain; you can add multiple
     redirect URIs to the same OAuth client, so keep both).
4. Copy the Client ID and Client Secret into `AUTH_GOOGLE_ID` /
   `AUTH_GOOGLE_SECRET`.

## 3. Deploying to Vercel

1. **Push this project to a GitHub repo** (a git repo is already
   initialized locally — just add a remote and push):
   ```bash
   git remote add origin <your-repo-url>
   git push -u origin main
   ```
2. **Import the repo in Vercel** (vercel.com → Add New → Project).
3. **Add a database.** In your Vercel project → Storage tab → Create
   Database → Postgres. This automatically sets a `POSTGRES_URL`
   environment variable on your project — nothing else to configure.
   (Any other Postgres host works too; just set `DATABASE_URL` yourself
   instead.)
4. **Add environment variables** (Project Settings → Environment
   Variables): `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
   You do **not** need to set `NEXTAUTH_URL` on Vercel — Auth.js infers
   it automatically there.
5. **Apply the database schema** before your first deploy's first login.
   Easiest way: pull the production env vars locally and run the same
   script you used for dev:
   ```bash
   npm i -g vercel   # if you don't have it
   vercel link        # links this folder to your Vercel project
   vercel env pull .env.production.local
   DATABASE_URL=$(grep POSTGRES_URL .env.production.local | cut -d '=' -f2- | tr -d '"') npm run db:push
   ```
   (Or simpler: open the Vercel Postgres dashboard's query console and
   paste the contents of `db/schema.sql` directly.)
6. **Update your Google OAuth client** with the production redirect URI
   from step 2 above, once you know your `*.vercel.app` domain (or
   custom domain).
7. **Deploy.** Vercel will build and deploy automatically on push.

## Adding or editing practice problems

Just edit `src/data/problems.json`. Each problem looks like:

```json
{
  "id": "math-alg-005",
  "subject": "Math",
  "topic": "Linear Equations",
  "difficulty": "Medium",
  "prompt": "If 4x - 3 = 13, what is x?",
  "choices": [
    { "id": "A", "text": "2" },
    { "id": "B", "text": "4" },
    { "id": "C", "text": "6" },
    { "id": "D", "text": "8" }
  ],
  "correctChoiceId": "B",
  "explanation": "Add 3 to both sides: 4x = 16. Divide by 4: x = 4."
}
```

- `id` must be unique across the whole file.
- `subject` must be exactly `"Math"`, `"Reading"`, or `"Writing"` (these
  drive the subject picker and report breakdowns).
- `passage` is optional — include it for Reading questions that need a
  short passage above the prompt.
- No redeploy-breaking migration needed: this is just a JSON file read
  at request time, so a new deploy (or even just a dev server restart)
  picks up your changes.

The answer key (`correctChoiceId`) and `explanation` are stripped
server-side before problems are sent to the browser (see
`toPublicProblem` in `src/lib/problems.ts`), so they're never visible in
the browser's network tab — correctness is decided server-side in
`/api/attempts`.

## What's tracked, and how reports are computed

Every submitted answer is written to the `attempts` table (see
`db/schema.sql`) with the subject/topic/difficulty **denormalized at
attempt time** — so old attempts still make sense even if you later
edit or remove a question from `problems.json`.

`src/lib/attempts.ts` (`getReportData`) computes, per signed-in user:
- Overall accuracy and total attempted/correct
- Accuracy broken down by subject and by topic
- A day-by-day activity chart (last 30 days)
- Current streak (consecutive days with at least one attempt)
- The 10 most recent attempts

This was verified against a real local Postgres instance during
development (seeded attempts across multiple days/subjects, then
checked the aggregation matched expected totals, per-subject/topic
accuracy, and streak count) — not just type-checked.

## Known simplifications / good next features to add

- **Question order isn't randomized** within a session — every student
  practicing "Math → Linear Equations" sees the same order. Easy to add
  a shuffle in `PracticeSession.tsx`.
- **No difficulty-adaptive selection** — the report data includes
  `difficulty` on every attempt, so an "adaptive practice" mode
  (serve harder questions after streaks of correct answers) is a
  natural next feature without any schema changes.
- **No admin UI for problems** (by design, per your JSON-file choice).
  If you outgrow hand-editing the file, the natural next step is
  moving `problems.json` into its own database table with a simple
  admin page — the `Problem` type in `src/types/index.ts` wouldn't need
  to change.
- **Only Google sign-in.** Adding email/password later means adding the
  `Credentials` provider plus a password hash column — Auth.js's
  adapter model supports mixing providers, so existing Google users
  aren't affected.
- **No rate limiting** on `/api/attempts` — fine for personal/small-group
  use; add a simple per-user rate limit (e.g. with Vercel's KV or Upstash
  Redis) before opening this up publicly.
