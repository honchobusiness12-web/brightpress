import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const result = await query(
      'SELECT id, email, name, avatar_url FROM users WHERE id = $1',
      [session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    return NextResponse.json({
      session,
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

