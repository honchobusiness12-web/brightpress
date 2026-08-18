import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Hero } from '@/components/hero';
import { FeaturedArticles } from '@/components/featured-articles';
import { CategoriesGrid } from '@/components/categories-grid';

export default async function HomePage() {
  const session = await getSession();
  
  // Fetch featured published articles
  let articles: any[] = [];
  try {
    const result = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.cover_url, a.category, a.created_at, 
        a.published_at, u.name, u.avatar_url, p.username
       FROM articles a
       JOIN users u ON a.author_id = u.id
       JOIN profiles p ON u.id = p.user_id
       WHERE a.status = 'published'
       ORDER BY a.published_at DESC
       LIMIT 8`,
      []
    );
    articles = result.rows;
  } catch (error) {
    console.error('Failed to fetch articles:', error);
  }

  return (
    <>
      <Hero user={session} />
      <FeaturedArticles articles={articles} />
      <CategoriesGrid />
    </>
  );
}

