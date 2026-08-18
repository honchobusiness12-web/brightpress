import { createOrUpdateUser, exchangeCodeForToken, getGoogleUserInfo } from '@/lib/auth';
import { createSession } from '@/lib/session';
import { NextResponse, type NextRequest } from 'next/server';

const STATE_COOKIE_NAME = 'brightpress_oauth_state';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const storedState = request.cookies.get(STATE_COOKIE_NAME)?.value;

  const failureRedirect = (reason: string) => {
    const url = new URL('/login', request.url);
    url.searchParams.set('error', reason);
    const response = NextResponse.redirect(url);
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  };

  if (error) {
    return failureRedirect('google_oauth_denied');
  }

  if (!code || !state) {
    return failureRedirect('missing_code_or_state');
  }

  if (!storedState || storedState !== state) {
    return failureRedirect('invalid_state');
  }

  try {
    const tokenResponse = await exchangeCodeForToken(code);
    const googleUser = await getGoogleUserInfo(tokenResponse.access_token);

    if (!googleUser.email) {
      return failureRedirect('missing_email');
    }

    const user = await createOrUpdateUser(googleUser);
    await createSession(user.id);

    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    response.cookies.delete(STATE_COOKIE_NAME);
    return response;
  } catch (err) {
    console.error('OAuth callback failed:', err);
    return failureRedirect('oauth_failed');
  }
}
