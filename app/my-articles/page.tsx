import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'My Articles | BrightPress',
};

async function getUserArticles(userId: string) {
  try {
    const result = await query(
      `SELECT id, title, slug, excerpt, cover_url, category, status, created_at, published_at
       FROM articles
       WHERE author_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch user articles:', error);
    return [];
  }
}

export default async function MyArticlesPage() {
  const session = await getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const articles = await getUserArticles(session.userId);

  const groupedArticles = {
    drafts: articles.filter((a: any) => a.status === 'draft'),
    pending: articles.filter((a: any) => a.status === 'pending'),
    published: articles.filter((a: any) => a.status === 'published'),
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Articles</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Manage all your articles in one place
            </p>
          </div>
          <Link href="/write" className="btn btn-primary">
            Write New Article
          </Link>
        </div>

        {/* Published Articles */}
        {groupedArticles.published.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Published ({groupedArticles.published.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedArticles.published.map((article: any) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                >
                  {article.cover_url && (
                    <div className="relative h-32 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <Image
                        src={article.cover_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-success text-xs">Published</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                    <div className="flex gap-2">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="flex-1 btn btn-secondary text-sm text-center"
                      >
                        View
                      </Link>
                      <Link
                        href={`/my-articles/${article.id}/edit`}
                        className="flex-1 btn btn-secondary text-sm text-center"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pending Articles */}
        {groupedArticles.pending.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Pending Review ({groupedArticles.pending.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedArticles.pending.map((article: any) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                >
                  {article.cover_url && (
                    <div className="relative h-32 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <Image
                        src={article.cover_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-warning text-xs">Pending</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                    <div className="flex gap-2">
                      <Link
                        href={`/my-articles/${article.id}/edit`}
                        className="flex-1 btn btn-secondary text-sm text-center"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Draft Articles */}
        {groupedArticles.drafts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Drafts ({groupedArticles.drafts.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupedArticles.drafts.map((article: any) => (
                <div
                  key={article.id}
                  className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition"
                >
                  {article.cover_url && (
                    <div className="relative h-32 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                      <Image
                        src={article.cover_url}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-primary text-xs">Draft</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="font-semibold line-clamp-2">{article.title}</h3>
                    <div className="flex gap-2">
                      <Link
                        href={`/my-articles/${article.id}/edit`}
                        className="flex-1 btn btn-secondary text-sm text-center"
                      >
                        Continue
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {articles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-6">
              You haven't written any articles yet.
            </p>
            <Link href="/write" className="btn btn-primary">
              Start Writing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

