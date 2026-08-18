import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Moderation Queue | BrightPress Admin',
};

async function getPendingArticles() {
  try {
    const result = await query(
      `SELECT a.id, a.title, a.slug, a.excerpt, a.created_at, u.name, u.avatar_url
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE a.status = 'pending'
       ORDER BY a.created_at ASC`
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch pending articles:', error);
    return [];
  }
}

export default async function ModerationPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  // Check admin/moderator role
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

  const articles = await getPendingArticles();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2">Moderation Queue</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Review and approve pending articles
          </p>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {articles.map((article: any) => (
              <div
                key={article.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-4">
                      {article.avatar_url && (
                        <Image
                          src={article.avatar_url}
                          alt={article.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-semibold">{article.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-2">{article.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 justify-center md:w-48">
                    <Link
                      href={`/admin/review/${article.id}`}
                      className="btn btn-primary text-center"
                    >
                      Review Article
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reject this article?')) {
                          // Will be handled by the review page
                        }
                      }}
                      className="btn btn-danger text-center"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
              🎉 No pending articles! Everything is caught up.
            </p>
            <Link href="/admin" className="btn btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

