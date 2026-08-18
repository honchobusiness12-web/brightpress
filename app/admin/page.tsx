import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BarChart3, Users, FileText, AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Admin Dashboard | BrightPress',
};

async function getAdminStats() {
  try {
    const articlesResult = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'draft') as draft
       FROM articles`
    );

    const usersResult = await query('SELECT COUNT(*) as total FROM users');

    const reportsResult = await query(
      `SELECT COUNT(*) FILTER (WHERE status = 'open') as open_reports
       FROM reports`
    );

    return {
      articles: articlesResult.rows[0],
      users: usersResult.rows[0],
      reports: reportsResult.rows[0],
    };
  } catch (error) {
    console.error('Failed to fetch admin stats:', error);
    return {
      articles: { published: 0, pending: 0, draft: 0 },
      users: { total: 0 },
      reports: { open_reports: 0 },
    };
  }
}

async function getPendingArticles() {
  try {
    const result = await query(
      `SELECT a.id, a.title, a.slug, a.created_at, u.name
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE a.status = 'pending'
       ORDER BY a.created_at DESC
       LIMIT 5`
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch pending articles:', error);
    return [];
  }
}

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Check admin role
  try {
    const result = await query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    );

    if (!result.rows[0] || !['admin', 'moderator'].includes(result.rows[0].role)) {
      redirect('/');
    }
  } catch (error) {
    redirect('/');
  }

  const stats = await getAdminStats();
  const pendingArticles = await getPendingArticles();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage content, users, and moderation
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Published Articles */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 dark:text-slate-400">Published</h3>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold">{stats.articles.published}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Active articles</p>
          </div>

          {/* Pending Articles */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 dark:text-slate-400">Pending</h3>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold">{stats.articles.pending}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Awaiting review</p>
          </div>

          {/* Users */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 dark:text-slate-400">Users</h3>
              <Users className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{stats.users.total}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Total members</p>
          </div>

          {/* Open Reports */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-600 dark:text-slate-400">Reports</h3>
              <BarChart3 className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-3xl font-bold">{stats.reports.open_reports}</p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">Open cases</p>
          </div>
        </div>

        {/* Pending Articles Section */}
        <div className="card mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Pending Articles</h2>
            <Link
              href="/admin/moderation"
              className="btn btn-secondary text-sm"
            >
              View All
            </Link>
          </div>

          {pendingArticles.length > 0 ? (
            <div className="space-y-4">
              {pendingArticles.map((article: any) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{article.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      By {article.name}
                    </p>
                  </div>
                  <Link
                    href={`/admin/review/${article.id}`}
                    className="btn btn-primary text-sm"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 dark:text-slate-400">
              No pending articles. Great job keeping up!
            </p>
          )}
        </div>

        {/* Admin Tools */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Content Management</h3>
            <div className="space-y-3">
              <Link
                href="/admin/articles"
                className="block btn btn-secondary text-center"
              >
                Manage Articles
              </Link>
              <Link
                href="/admin/moderation"
                className="block btn btn-secondary text-center"
              >
                Moderation Queue
              </Link>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">User Management</h3>
            <div className="space-y-3">
              <Link
                href="/admin/users"
                className="block btn btn-secondary text-center"
              >
                View Users
              </Link>
              <Link
                href="/admin/reports"
                className="block btn btn-secondary text-center"
              >
                User Reports
              </Link>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link
            href="/"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

