import { query } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

export const metadata = {
  title: 'Browse Articles | BrightPress',
  description: 'Explore all published articles on BrightPress',
};

interface SearchParams {
  category?: string;
  search?: string;
  page?: string;
}

async function searchArticles(searchParams: SearchParams) {
  const category = searchParams.category === 'all' || !searchParams.category ? null : searchParams.category;
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    let whereClause = "a.status = 'published'";
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND a.category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (a.title ILIKE $${paramIndex} OR a.excerpt ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM articles a WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    params.push(limit);
    params.push(offset);

    const result = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.cover_url, a.category, a.published_at,
        u.name, u.avatar_url
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE ${whereClause}
       ORDER BY a.published_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      params
    );

    return {
      articles: result.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Failed to search articles:', error);
    return {
      articles: [],
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0,
    };
  }
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { articles, total, page, totalPages } = await searchArticles(params);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Browse Articles</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {total} published article{total !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <form className="flex-grow" action="/articles">
            <input
              type="search"
              name="search"
              placeholder="Search articles..."
              defaultValue={params.search || ''}
              className="form-input"
            />
          </form>

          <div className="flex flex-wrap gap-2">
            {['all', 'ideas', 'community', 'news', 'adventures'].map((cat) => (
              <Link
                key={cat}
                href={`/articles?category=${cat}`}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  params.category === cat || (!params.category && cat === 'all')
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Link>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.map((article: any) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                {page > 1 && (
                  <Link
                    href={`/articles?category=${params.category}&page=${page - 1}`}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/articles?category=${params.category}&page=${page + 1}`}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-slate-600 dark:text-slate-400">
              No articles found. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

