import {
 exchangeCodeForToken,
 getGoogleUserInfo,
 createOrUpdateUser,
} from '@/lib/auth';
import { createSession } from '@/lib/session';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
 const code = request.nextUrl.searchParams.get('code');
 const state = request.nextUrl.searchParams.get('state');
 const cookieState = request.cookies.get('oauth_state')?.value;

 // Validate state parameter (CSRF protection)
 if (!code || !state || state !== cookieState) {
 return NextResponse.json(
 { error: 'Invalid OAuth state. Please try logging in again.' },
 { status: 400 }
 );
 }

 try {
 // Exchange authorization code for tokens
 const tokens = await exchangeCodeForToken(code);

 // Get user info from Google
 const googleUser = await getGoogleUserInfo(tokens.access_token);

 // Create or update user in PostgreSQL
 const user = await createOrUpdateUser(googleUser);

 // Create session (JWT in httpOnly cookie)
 await createSession(user.id);

 // Clear OAuth state cookie
 const response = NextResponse.redirect(
 new URL('/dashboard', request.url)
 );
 response.cookies.delete('oauth_state');

 return response;
 } catch (error) {
 console.error('OAuth callback error:', error);
 return NextResponse.json(
 { error: 'Authentication failed. Please try again.' },
 { status: 500 }
 );
 }
}

