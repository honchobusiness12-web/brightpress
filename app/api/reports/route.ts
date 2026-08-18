import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { article_id, comment_id, reason } = await request.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    if (!article_id && !comment_id) {
      return NextResponse.json(
        { error: 'Either article_id or comment_id is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO reports (article_id, comment_id, reporter_id, reason, status)
       VALUES ($1, $2, $3, $4, 'open')
       RETURNING id, article_id, comment_id, reason, status, created_at`,
      [article_id || null, comment_id || null, session.userId, reason]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('Failed to create report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check user role
    const userResult = await query(
      'SELECT role FROM users WHERE id = $1',
      [session.userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const role = userResult.rows[0].role;
    if (!['admin', 'moderator'].includes(role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await query(
      `SELECT r.*, a.title as article_title, c.content as comment_content, u.name as reporter_name
       FROM reports r
       LEFT JOIN articles a ON r.article_id = a.id
       LEFT JOIN comments c ON r.comment_id = c.id
       LEFT JOIN users u ON r.reporter_id = u.id
       ORDER BY r.created_at DESC
       LIMIT 100`
    );

    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Failed to fetch reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

