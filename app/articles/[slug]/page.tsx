import { query } from '@/lib/db';
import { getSession } from '@/lib/session';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  try {
    const result = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.content, a.cover_url, a.category, 
        a.published_at, a.status, a.author_id,
        u.id as user_id, u.name, u.email, u.avatar_url,
        p.username, p.bio
       FROM articles a
       JOIN users u ON a.author_id = u.id
       JOIN profiles p ON u.id = p.user_id
       WHERE a.slug = $1 AND a.status = 'published'`,
      [slug]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Failed to fetch article:', error);
    return null;
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  const session = await getSession();

  if (!article) {
    notFound();
  }

  const canEdit = session && session.userId === article.author_id;

  return (
    <article className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      {article.cover_url && (
        <div className="relative h-96 w-full overflow-hidden bg-slate-200 dark:bg-slate-800">
          <Image
            src={article.cover_url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="badge badge-warning">{article.category}</span>
            {canEdit && (
              <Link
                href={`/my-articles/${article.id}/edit`}
                className="btn btn-secondary text-sm"
              >
                Edit Article
              </Link>
            )}
          </div>

          <h1 className="text-5xl font-bold">{article.title}</h1>

          <p className="text-xl text-slate-600 dark:text-slate-400">
            {article.excerpt}
          </p>

          {/* Author Card */}
          <div className="flex items-center space-x-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {article.avatar_url && (
              <Image
                src={article.avatar_url}
                alt={article.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full"
              />
            )}
            <div>
              <Link
                href={`/profile/${article.username}`}
                className="font-semibold hover:text-amber-600 transition"
              >
                {article.name}
              </Link>
              {article.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-400">{article.bio}</p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-500">
                {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose dark:prose-invert max-w-none">
          {article.content.split('\n').map((paragraph: string, idx: number) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/articles"
            className="inline-block px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            ← Back to Articles
          </Link>
        </div>
      </div>
    </article>
  );
}

