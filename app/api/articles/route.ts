import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') +
    '-' +
    crypto.randomBytes(4).toString('hex');
}

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in first.' },
      { status: 401 }
    );
  }

  try {
    const { title, excerpt, content, category, cover_url, status } = await request.json();

    // Validation
    if (!title || title.length < 3 || title.length > 140) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 140 characters' },
        { status: 400 }
      );
    }

    if (!excerpt || excerpt.length < 10 || excerpt.length > 300) {
      return NextResponse.json(
        { error: 'Excerpt must be between 10 and 300 characters' },
        { status: 400 }
      );
    }

    if (!content || content.length < 30) {
      return NextResponse.json(
        { error: 'Content must be at least 30 characters' },
        { status: 400 }
      );
    }

    if (!['draft', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const slug = generateSlug(title);
    const now = new Date();
    const publishedAt = status === 'published' ? now : null;

    const result = await query(
      `INSERT INTO articles (author_id, title, slug, excerpt, content, cover_url, category, status, published_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, slug`,
      [
        session.userId,
        title,
        slug,
        excerpt,
        content,
        cover_url || null,
        category || 'News',
        status,
        publishedAt,
      ]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Failed to create article:', error);

    if (error.message?.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Article with this title already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

