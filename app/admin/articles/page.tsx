import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Manage Articles | BrightPress Admin',
};

async function getAllArticles() {
  try {
    const result = await query(
      `SELECT a.id, a.title, a.slug, a.status, a.created_at, a.published_at, u.name
       FROM articles a
       JOIN users u ON a.author_id = u.id
       ORDER BY a.created_at DESC
       LIMIT 50`
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export default async function ManageArticlesPage() {
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

    if (!result.rows[0] || result.rows[0].role !== 'admin') {
      redirect('/');
    }
  } catch (error) {
    redirect('/');
  }

  const articles = await getAllArticles();

  const grouped = {
    published: articles.filter((a: any) => a.status === 'published'),
    pending: articles.filter((a: any) => a.status === 'pending'),
    draft: articles.filter((a: any) => a.status === 'draft'),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Articles</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            View and moderate all articles on the platform
          </p>
        </div>

        {/* Article List by Status */}
        {['published', 'pending', 'draft'].map((status) => (
          <div key={status} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 capitalize">
              {status} ({grouped[status as keyof typeof grouped].length})
            </h2>

            {grouped[status as keyof typeof grouped].length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold">Title</th>
                      <th className="px-6 py-3 text-left font-semibold">Author</th>
                      <th className="px-6 py-3 text-left font-semibold">Status</th>
                      <th className="px-6 py-3 text-left font-semibold">Date</th>
                      <th className="px-6 py-3 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grouped[status as keyof typeof grouped].map((article: any) => (
                      <tr
                        key={article.id}
                        className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-6 py-4 font-medium">{article.title}</td>
                        <td className="px-6 py-4">{article.name}</td>
                        <td className="px-6 py-4">
                          <span className={`badge text-xs ${
                            article.status === 'published'
                              ? 'badge-success'
                              : article.status === 'pending'
                              ? 'badge-warning'
                              : 'badge-primary'
                          }`}>
                            {article.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                          {formatDistanceToNow(
                            new Date(article.published_at || article.created_at),
                            { addSuffix: true }
                          )}
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <Link
                            href={`/articles/${article.slug}`}
                            className="text-amber-600 dark:text-amber-400 hover:underline text-sm"
                          >
                            View
                          </Link>
                          {article.status === 'pending' && (
                            <Link
                              href={`/admin/review/${article.id}`}
                              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                            >
                              Review
                            </Link>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-600 dark:text-slate-400">No {status} articles</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

