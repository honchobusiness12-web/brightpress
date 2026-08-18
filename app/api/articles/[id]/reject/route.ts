import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  const { id } = await params;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reason } = await request.json();

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    // Check user role
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const role = userResult.rows[0].role;
    if (!['admin', 'editor'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update article status to rejected
    const result = await query(
      `UPDATE articles 
       SET status = 'rejected', 
           updated_at = NOW()
       WHERE id = $1 AND status = 'pending'
       RETURNING id, slug, title, status`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Article not found or not in pending state' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ...result.rows[0], rejection_reason: reason });
  } catch (error: any) {
    console.error('Failed to reject article:', error);
    return NextResponse.json(
      { error: 'Failed to reject article' },
      { status: 500 }
    );
  }
}

