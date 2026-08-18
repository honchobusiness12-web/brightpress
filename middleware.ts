import { getSession } from '@/lib/session';
import { NextResponse, type NextRequest } from 'next/server';
import { query } from '@/lib/db';

export async function middleware(request: NextRequest) {
 const session = await getSession();

 // Protect admin routes
 if (request.nextUrl.pathname.startsWith('/admin')) {
 if (!session) {
 return NextResponse.redirect(new URL('/admin/login', request.url));
 }

 // Check if user is admin/moderator
 try {
 const result = await query(
 'SELECT role FROM users WHERE id = $1',
 [session.userId]
 );

 if (!result.rows[0] || !['admin', 'moderator'].includes(result.rows[0].role)) {
 return NextResponse.redirect(new URL('/', request.url));
 }
 } catch (error) {
 console.error('Admin check error:', error);
 return NextResponse.redirect(new URL('/', request.url));
 }
 }

 return NextResponse.next();
}

export const config = {
 matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

