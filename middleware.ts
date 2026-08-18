import { getSession } from '@/lib/session';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
 const session = await getSession();

 // Protect admin routes
 if (request.nextUrl.pathname.startsWith('/admin')) {
 if (!session) {
 return NextResponse.redirect(new URL('/admin/login', request.url));
 }

 // Note: Role-based access check moved to layout/page level
 // (middleware runs at build time, can't access database then)
 }

 return NextResponse.next();
}

export const config = {
 matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};

