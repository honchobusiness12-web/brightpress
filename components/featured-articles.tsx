import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_url?: string;
  category: string;
  published_at: string;
  name: string;
  avatar_url?: string;
}

interface FeaturedArticlesProps {
  articles: Article[];
}

export function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  if (articles.length === 0) {
    return (
      <section className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">Featured Stories</h2>
          <div className="text-center text-slate-500 dark:text-slate-400">
            <p>No published articles yet. Be the first to share your story!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-slate-50 dark:bg-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-12">Featured Stories</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-105"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                {article.cover_url ? (
                  <Image
                    src={article.cover_url}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-300 to-orange-300 dark:from-amber-900 dark:to-orange-900">
                    <span className="text-4xl">📖</span>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                  </span>
                </div>

                <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-amber-600 transition">
                  {article.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center space-x-3">
                  {article.avatar_url && (
                    <Image
                      src={article.avatar_url}
                      alt={article.name}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {article.name}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/articles"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            View All Stories
          </Link>
        </div>
      </div>
    </section>
  );
}

