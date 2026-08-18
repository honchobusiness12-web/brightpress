import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { Lightbulb, PlusCircle, Settings, FileText } from 'lucide-react';

export const metadata = {
  title: 'Dashboard | BrightPress',
};

async function getUserProfile(userId: string) {
  try {
    const result = await query(
      `SELECT p.*, u.email, u.name, u.avatar_url
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return null;
  }
}

async function getUserArticles(userId: string) {
  try {
    const result = await query(
      `SELECT id, title, slug, status, created_at, published_at, excerpt
       FROM articles
       WHERE author_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const profile = await getUserProfile(session.userId);
  const articles = await getUserArticles(session.userId);

  if (!profile) {
    redirect('/admin/login');
  }

  const stats = {
    published: articles.filter((a: any) => a.status === 'published').length,
    pending: articles.filter((a: any) => a.status === 'pending').length,
    drafts: articles.filter((a: any) => a.status === 'draft').length,
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.display_name}!</h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Here's what's happening with your BrightPress
              </p>
            </div>
            <div className="hidden sm:flex space-x-3">
              <Link href="/write" className="btn btn-primary">
                <PlusCircle className="w-5 h-5" />
                <span>Write Article</span>
              </Link>
              <Link href="/settings" className="btn btn-secondary">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-700 rounded-lg p-6 flex items-center gap-6">
            {profile.avatar_url && (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-full"
              />
            )}
            <div className="flex-grow">
              <h2 className="text-2xl font-bold">{profile.display_name}</h2>
              <p className="text-slate-600 dark:text-slate-400">@{profile.username}</p>
              {profile.bio && (
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">{profile.bio}</p>
              )}
            </div>
            <Link href={`/profile/${profile.username}`} className="btn btn-secondary">
              View Profile
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Published</p>
                <p className="text-4xl font-bold mt-2">{stats.published}</p>
              </div>
              <div className="text-4xl opacity-20">📚</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Pending Review</p>
                <p className="text-4xl font-bold mt-2">{stats.pending}</p>
              </div>
              <div className="text-4xl opacity-20">⏳</div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">Drafts</p>
                <p className="text-4xl font-bold mt-2">{stats.drafts}</p>
              </div>
              <div className="text-4xl opacity-20">✍️</div>
            </div>
          </div>
        </div>

        {/* Recent Articles */}
        <div className="card mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Recent Articles
            </h2>
            <Link href="/my-articles" className="text-amber-600 dark:text-amber-400 hover:underline text-sm font-semibold">
              View all →
            </Link>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-3">
              {articles.map((article: any) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  <div className="flex-grow">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="font-semibold hover:text-amber-600 transition"
                    >
                      {article.title}
                    </Link>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge text-xs ${
                      article.status === 'published'
                        ? 'badge-success'
                        : article.status === 'pending'
                        ? 'badge-warning'
                        : 'badge-primary'
                    }`}>
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </span>
                    <Link
                      href={`/my-articles/${article.id}/edit`}
                      className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                You haven't written any articles yet.
              </p>
              <Link href="/write" className="btn btn-primary">
                Start Writing
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="sm:hidden grid grid-cols-2 gap-3">
          <Link href="/write" className="btn btn-primary text-center">
            Write Article
          </Link>
          <Link href="/settings" className="btn btn-secondary text-center">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
}

