import { getGoogleAuthUrl } from '@/lib/auth';
import { NextResponse, type NextRequest } from 'next/server';
import { randomBytes } from 'crypto';

const STATE_COOKIE_NAME = 'brightpress_oauth_state';

export async function GET(request: NextRequest) {
  const state = randomBytes(32).toString('hex');
  const authUrl = getGoogleAuthUrl(state);

  const response = NextResponse.redirect(authUrl);

  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10 // 10 minutes
  });

  return response;
}
