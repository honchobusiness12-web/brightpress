-- Users table (replaces Supabase auth)
CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 email TEXT UNIQUE NOT NULL,
 name TEXT,
 avatar_url TEXT,
 google_id TEXT UNIQUE NOT NULL,
 role TEXT DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_google_id_idx ON users(google_id);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 username TEXT UNIQUE NOT NULL,
 display_name TEXT DEFAULT 'BrightPress Reader',
 avatar_url TEXT,
 bio TEXT DEFAULT '',
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 140),
 slug TEXT UNIQUE NOT NULL,
 excerpt TEXT NOT NULL CHECK (char_length(excerpt) BETWEEN 10 AND 300),
 content TEXT NOT NULL CHECK (char_length(content) >= 30),
 cover_url TEXT,
 category TEXT DEFAULT 'News',
 status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW(),
 published_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS articles_status_created_idx ON articles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS articles_author_idx ON articles(author_id);
CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles(slug);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
 author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 content TEXT NOT NULL,
 status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS comments_article_idx ON comments(article_id);
CREATE INDEX IF NOT EXISTS comments_author_idx ON comments(author_id);

-- Reports table for moderation
CREATE TABLE IF NOT EXISTS reports (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
 comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
 reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 reason TEXT NOT NULL,
 status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved')),
 created_at TIMESTAMPTZ DEFAULT NOW(),
 updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reports_article_idx ON reports(article_id);
CREATE INDEX IF NOT EXISTS reports_status_idx ON reports(status);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
 NEW.updated_at = NOW();
 RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS articles_updated_at ON articles;
CREATE TRIGGER articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS comments_updated_at ON comments;
CREATE TRIGGER comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS reports_updated_at ON reports;
CREATE TRIGGER reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at();

