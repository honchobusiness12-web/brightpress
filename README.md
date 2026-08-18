# BrightPress V2

BrightPress is a friendly, kid-safe publishing platform starter inspired by modern reading apps.

## What V2 includes

- Google sign-in via native Google OAuth 2.0
- Sessions managed with signed, httpOnly JWT cookies (no third-party auth service)
- Dedicated `/admin/login` for staff
- Role-based admin center
- Article drafts → review → publish workflow
- User profiles and editable bios
- Public author pages
- Light / dark / system theme
- Responsive desktop + mobile UI
- Custom BrightPress logo and visual system
- Admin moderation queue
- Admin user role management
- User count / article count / pending review stats
- Friendly content guidelines built into the publishing flow
- Runs entirely on Railway: PostgreSQL + Next.js, no external auth dependency

## The easiest setup

### 1. Create a Railway PostgreSQL database

Add a PostgreSQL plugin/service in your Railway project. Railway will provide a `DATABASE_URL`.

### 2. Create the database schema

Connect to your Railway Postgres instance (Railway's Query tab, `psql`, or any SQL client), paste the entire `sql/init.sql` file, and run it.

### 3. Create Google OAuth credentials

In Google Cloud Console, create an OAuth 2.0 Client ID (Web application). Add the following authorized redirect URI:

- Local: `http://localhost:3000/api/auth/callback`
- Production: `https://YOUR-DOMAIN.com/api/auth/callback`

### 4. Create your environment file

Copy `.env.example` to `.env.local` and fill in:

- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `AUTH_SECRET` (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`

### 5. Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### 6. Make yourself admin

Sign in with Google once via `/api/auth/login`.

Then connect to your Railway PostgreSQL database and run:

```sql
update users set role = 'admin' where email = 'you@example.com';
```

### 7. Open the admin panel

Visit:

`http://localhost:3000/admin/login`

Sign in with the Google account you promoted to admin.

## Put it on Railway

1. Create a new GitHub repository and push this project.
2. Do **not** upload `.env.local`.
3. Create a new Railway project, connect the repo, and add a PostgreSQL service.
4. Set the environment variables listed above in the Railway service settings.
5. Add your Railway domain + `/api/auth/callback` to the authorized redirect URIs in Google Cloud.

## Files you actually need to care about

- `sql/init.sql` → database schema
- `lib/db.ts` → PostgreSQL connection pool
- `lib/auth.ts` → Google OAuth logic
- `lib/session.ts` → JWT session management
- `.env.example` → environment variables
- `app/` → pages
- `components/` → reusable UI
- `public/logo.svg` → logo
- `README.md` → setup guide

## Important

`AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, and `DATABASE_URL` must never be exposed to the browser. They are only read server-side in `lib/`, API routes, and middleware.

BrightPress is a software starter, not a substitute for your own moderation policy, privacy policy, parental requirements, or applicable laws.
