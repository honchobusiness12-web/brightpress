import { query } from '@/lib/db';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

function getRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${appUrl.replace(/\/$/, '')}/api/auth/callback`;
}

export function getGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
    state
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token?: string;
}

export async function exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variable is not set');
  }

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code'
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to exchange code for token: ${errorBody}`);
  }

  return response.json();
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture?: string;
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to fetch Google user info: ${errorBody}`);
  }

  return response.json();
}

export interface AppUser {
  id: string;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: string;
}

export async function generateUsername(name: string): Promise<string> {
  let base = name
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '')
    .slice(0, 24);

  if (base.length < 3) {
    base = 'reader';
  }

  let candidate = base;
  let suffix = 0;

  while (true) {
    const existing = await query('select 1 from profiles where username = $1', [candidate]);

    if (existing.rowCount === 0) {
      return candidate;
    }

    suffix += 1;
    candidate = `${base.slice(0, 20)}${suffix}`;
  }
}

export async function createOrUpdateUser(googleUser: GoogleUserInfo): Promise<AppUser> {
  const existing = await query<AppUser>('select * from users where google_id = $1', [googleUser.id]);

  if (existing.rowCount > 0) {
    const updated = await query<AppUser>(
      `update users
       set email = $1, name = $2, avatar_url = $3, updated_at = now()
       where google_id = $4
       returning *`,
      [googleUser.email, googleUser.name, googleUser.picture ?? null, googleUser.id]
    );

    return updated.rows[0];
  }

  const inserted = await query<AppUser>(
    `insert into users (google_id, email, name, avatar_url, role)
     values ($1, $2, $3, $4, 'user')
     returning *`,
    [googleUser.id, googleUser.email, googleUser.name, googleUser.picture ?? null]
  );

  const newUser = inserted.rows[0];

  const username = await generateUsername(googleUser.name || googleUser.email.split('@')[0]);

  await query(
    `insert into profiles (user_id, username, display_name, bio)
     values ($1, $2, $3, $4)
     on conflict (user_id) do nothing`,
    [newUser.id, username, googleUser.name || 'BrightPress reader', '']
  );

  return newUser;
}
