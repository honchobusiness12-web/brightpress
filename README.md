# BrightPress V2

BrightPress is a friendly, kid-safe publishing platform starter inspired by modern reading apps.

## What V2 includes

- Google sign-in with Supabase Auth
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
- Row Level Security policies in Supabase
- No service-role key needed in the browser

## The easiest setup

### 1. Create Supabase

Go to Supabase and create one project.

### 2. Create the database

Open **SQL Editor → New query**, paste the entire `supabase.sql` file, and click **Run**.

### 3. Turn on Google login

In **Authentication → Providers → Google**, enable Google.

You will need Google OAuth credentials from Google Cloud. Put the Supabase callback URL shown by Supabase into Google's authorized redirect URIs.

### 4. Add your site URL

In **Authentication → URL Configuration**, add:

- Local: `http://localhost:3000`
- Local callback: `http://localhost:3000/auth/callback`
- Production: your real website URL
- Production callback: `https://YOUR-DOMAIN.com/auth/callback`

### 5. Create your environment file

Copy `.env.example` to `.env.local` and paste your two public Supabase values.

### 6. Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

### 7. Make yourself admin

Sign in with Google once.

Then go to Supabase → **Table Editor → profiles**, find your account, and change `role` from `user` to `admin`.

Or run this in SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users order by created_at asc limit 1);
```

### 8. Open the admin panel

Visit:

`http://localhost:3000/admin/login`

Sign in with the Google account you promoted to admin.

## Put it on GitHub

1. Create a new GitHub repository.
2. Upload everything inside this folder.
3. Do **not** upload `.env.local`.
4. Connect the repo to Vercel.
5. Add the same two environment variables in Vercel.
6. Add your Vercel URL + `/auth/callback` to Supabase redirect URLs.

## Files you actually need to care about

- `supabase.sql` → database + security
- `.env.example` → environment variables
- `app/` → pages
- `components/` → reusable UI
- `public/logo.svg` → logo
- `README.md` → setup guide

## Important

Never put a Supabase service-role key in `.env.local` for this app. Only use your project URL and public anon/publishable key in the browser.

BrightPress is a software starter, not a substitute for your own moderation policy, privacy policy, parental requirements, or applicable laws.
