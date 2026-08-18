import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

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

    const articlesResult = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
       FROM articles`
    );

    const usersResult = await query('SELECT COUNT(*) as total FROM users');

    const reportsResult = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as open_reports,
        COUNT(*) FILTER (WHERE status = 'reviewed') as reviewed,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved
       FROM reports`
    );

    const commentsResult = await query(
      `SELECT 
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
       FROM comments`
    );

    return NextResponse.json({
      articles: articlesResult.rows[0],
      users: usersResult.rows[0],
      reports: reportsResult.rows[0],
      comments: commentsResult.rows[0],
    });
  } catch (error: any) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

