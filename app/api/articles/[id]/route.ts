import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  try {
    const result = await query(
      `SELECT id, title, slug, excerpt, content, cover_url, category, status, author_id
       FROM articles
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const article = result.rows[0];

    // Allow viewing if published or user is author
    if (article.status !== 'published' && session?.userId !== article.author_id) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(article);
  } catch (error: any) {
    console.error('Failed to fetch article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { title, excerpt, content, category, cover_url, status } = await request.json();

    // Get current article
    const articleResult = await query(
      'SELECT author_id, status FROM articles WHERE id = $1',
      [id]
    );

    if (articleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    const article = articleResult.rows[0];

    // Only author can edit
    if (article.author_id !== session.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this article' },
        { status: 403 }
      );
    }

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

    // Update article
    const updateResult = await query(
      `UPDATE articles 
       SET title = $1, excerpt = $2, content = $3, category = $4, cover_url = $5, status = $6
       WHERE id = $7
       RETURNING id, slug`,
      [title, excerpt, content, category || 'News', cover_url || null, status || article.status, id]
    );

    return NextResponse.json(updateResult.rows[0]);
  } catch (error: any) {
    console.error('Failed to update article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get article to check ownership
    const articleResult = await query(
      'SELECT author_id FROM articles WHERE id = $1',
      [id]
    );

    if (articleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    if (articleResult.rows[0].author_id !== session.userId) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this article' },
        { status: 403 }
      );
    }

    // Delete article
    await query('DELETE FROM articles WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

