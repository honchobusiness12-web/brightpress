create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null default 'BrightPress reader',
  avatar_url text,
  bio text not null default '',
  role text not null default 'user' check (role in ('user','moderator','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 140),
  slug text unique not null,
  excerpt text not null check (char_length(excerpt) between 10 and 300),
  content text not null check (char_length(content) >= 30),
  cover_url text,
  category text not null default 'News',
  status text not null default 'pending' check (status in ('draft','pending','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists articles_status_created_idx on public.articles(status, created_at desc);
create index if not exists articles_author_idx on public.articles(author_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at before update on public.articles for each row execute procedure public.touch_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare
  base_username text;
  final_username text;
  n integer := 0;
begin
  base_username := lower(regexp_replace(coalesce(new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'preferred_username', new.raw_user_meta_data->>'name', split_part(coalesce(new.email,'reader@example.com'),'@',1)), '[^a-zA-Z0-9_]+', '', 'g'));
  if length(base_username) < 3 then base_username := 'reader'; end if;
  final_username := left(base_username, 24);
  while exists(select 1 from public.profiles where username = final_username) loop
    n := n + 1;
    final_username := left(base_username, 20) || n::text;
  end loop;

  insert into public.profiles(id, username, display_name, avatar_url)
  values (
    new.id,
    final_username,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'BrightPress reader'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin','moderator'));
$$;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.articles enable row level security;

drop policy if exists "Profiles public read" on public.profiles;
create policy "Profiles public read" on public.profiles for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "Admins update roles" on public.profiles;
create policy "Admins update roles" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published articles public" on public.articles;
create policy "Published articles public" on public.articles for select using (status = 'published' or auth.uid() = author_id or public.is_staff());

drop policy if exists "Users insert own articles" on public.articles;
create policy "Users insert own articles" on public.articles for insert with check (auth.uid() = author_id);

drop policy if exists "Authors or staff update articles" on public.articles;
create policy "Authors or staff update articles" on public.articles for update using (auth.uid() = author_id or public.is_staff()) with check (auth.uid() = author_id or public.is_staff());

drop policy if exists "Authors delete own drafts" on public.articles;
create policy "Authors delete own drafts" on public.articles for delete using (auth.uid() = author_id and status in ('draft','rejected'));

-- After your FIRST Google login, promote your own account:
-- update public.profiles set role = 'admin' where id = 'YOUR-USER-UUID';
