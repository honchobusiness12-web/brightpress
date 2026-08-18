import { query } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getProfile(username: string) {
  try {
    const result = await query(
      `SELECT p.*, u.email, u.name, u.avatar_url
       FROM profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.username = $1`,
      [username]
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
      `SELECT id, title, slug, excerpt, cover_url, category, published_at
       FROM articles
       WHERE author_id = $1 AND status = 'published'
       ORDER BY published_at DESC`,
      [userId]
    );
    return result.rows;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return [];
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) {
    notFound();
  }

  const articles = await getUserArticles(profile.user_id);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-12">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {profile.avatar_url && (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full"
              />
            )}
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-4xl font-bold mb-2">{profile.display_name}</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">@{profile.username}</p>
              {profile.bio && (
                <p className="text-lg text-slate-700 dark:text-slate-300 mb-4">{profile.bio}</p>
              )}
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8">
            Published Articles ({articles.length})
          </h2>

          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article: any) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                    {article.cover_url ? (
                      <Image
                        src={article.cover_url}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-300 to-orange-300 dark:from-amber-900 dark:to-orange-900">
                        <span className="text-3xl">📖</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="badge badge-warning">{article.category}</span>
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
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-slate-600 dark:text-slate-400">
                No published articles yet.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link
            href="/articles"
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            ← Back to Articles
          </Link>
        </div>
      </div>
    </div>
  );
}

