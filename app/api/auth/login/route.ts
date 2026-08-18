import { getGoogleAuthUrl } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
 const state = crypto.randomBytes(32).toString('hex');
 const url = getGoogleAuthUrl(state);

 const response = NextResponse.redirect(url);
 response.cookies.set('oauth_state', state, {
 httpOnly: true,
 secure: process.env.NODE_ENV === 'production',
 sameSite: 'lax',
 maxAge: 600, // 10 minutes
 path: '/',
 });

 return response;
}

