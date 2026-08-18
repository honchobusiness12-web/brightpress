import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const session = await getSession();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const result = await query<{ role: string }>('select role from users where id = $1', [session.userId]);
    const role = result.rows[0]?.role;

    if (role !== 'admin' && role !== 'moderator') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch (err) {
    console.error('Failed to verify admin role in middleware:', err);
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
  runtime: 'nodejs'
};
