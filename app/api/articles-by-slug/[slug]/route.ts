import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const result = await query(
      `SELECT 
        a.id, a.title, a.slug, a.excerpt, a.content, a.cover_url, a.category, 
        a.status, a.author_id, a.published_at, a.created_at,
        u.name, u.email, u.avatar_url
       FROM articles a
       JOIN users u ON a.author_id = u.id
       WHERE a.slug = $1`,
      [slug]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

