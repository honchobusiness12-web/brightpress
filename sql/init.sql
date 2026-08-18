-- BrightPress database schema for Railway PostgreSQL
-- Replaces the previous Supabase auth.users / RLS based schema.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users (replaces Supabase auth.users)
-- ---------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  google_id text unique not null,
  email text unique not null,
  name text not null,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'moderator', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists users_google_id_idx on users(google_id);
create index if not exists users_email_idx on users(email);

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  username text unique not null,
  display_name text not null default 'BrightPress reader',
  bio text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on profiles(user_id);
create index if not exists profiles_username_idx on profiles(username);

-- ---------------------------------------------------------------------------
-- articles
-- ---------------------------------------------------------------------------
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references users(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  slug text unique not null,
  excerpt text not null check (char_length(excerpt) between 10 and 300),
  content text not null check (char_length(content) >= 30),
  cover_url text,
  category text not null default 'News',
  status text not null default 'pending' check (status in ('draft', 'pending', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists articles_status_created_idx on articles(status, created_at desc);
create index if not exists articles_author_idx on articles(author_id);
create index if not exists articles_slug_idx on articles(slug);

-- ---------------------------------------------------------------------------
-- comments
-- ---------------------------------------------------------------------------
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  status text not null default 'published' check (status in ('published', 'pending', 'rejected', 'removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists comments_article_idx on comments(article_id, created_at desc);
create index if not exists comments_author_idx on comments(author_id);
create index if not exists comments_status_idx on comments(status);

-- ---------------------------------------------------------------------------
-- reports (moderation)
-- ---------------------------------------------------------------------------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade,
  comment_id uuid references comments(id) on delete cascade,
  reporter_id uuid not null references users(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reports_target_check check (
    (article_id is not null and comment_id is null) or
    (article_id is null and comment_id is not null)
  )
);

create index if not exists reports_status_idx on reports(status, created_at desc);
create index if not exists reports_article_idx on reports(article_id);
create index if not exists reports_comment_idx on reports(comment_id);
create index if not exists reports_reporter_idx on reports(reporter_id);

-- ---------------------------------------------------------------------------
-- triggers: auto-update updated_at on every table that has it
-- ---------------------------------------------------------------------------
create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_touch_updated_at on users;
create trigger users_touch_updated_at before update on users
  for each row execute procedure touch_updated_at();

drop trigger if exists profiles_touch_updated_at on profiles;
create trigger profiles_touch_updated_at before update on profiles
  for each row execute procedure touch_updated_at();

drop trigger if exists articles_touch_updated_at on articles;
create trigger articles_touch_updated_at before update on articles
  for each row execute procedure touch_updated_at();

drop trigger if exists comments_touch_updated_at on comments;
create trigger comments_touch_updated_at before update on comments
  for each row execute procedure touch_updated_at();

drop trigger if exists reports_touch_updated_at on reports;
create trigger reports_touch_updated_at before update on reports
  for each row execute procedure touch_updated_at();

-- ---------------------------------------------------------------------------
-- function: set published_at automatically when an article becomes published
-- ---------------------------------------------------------------------------
create or replace function set_article_published_at() returns trigger language plpgsql as $$
begin
  if new.status = 'published' and (old.status is distinct from 'published') then
    new.published_at = now();
  end if;

  if new.status <> 'published' then
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists articles_set_published_at on articles;
create trigger articles_set_published_at before update on articles
  for each row execute procedure set_article_published_at();

-- ---------------------------------------------------------------------------
-- helper functions for role checks (used by application code / future SQL)
-- ---------------------------------------------------------------------------
create or replace function is_staff(check_user_id uuid) returns boolean language sql stable as $$
  select exists(select 1 from users where id = check_user_id and role in ('admin', 'moderator'));
$$;

create or replace function is_admin(check_user_id uuid) returns boolean language sql stable as $$
  select exists(select 1 from users where id = check_user_id and role = 'admin');
$$;

-- After your first Google login, promote your own account to admin with:
-- update users set role = 'admin' where email = 'you@example.com';
