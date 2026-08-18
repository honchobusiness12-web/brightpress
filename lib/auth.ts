import crypto from 'crypto';
import { query } from './db';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;

export const REDIRECT_URI = `${NEXTAUTH_URL}/auth/callback`;

export function getGoogleAuthUrl(state: string) {
 const params = new URLSearchParams({
 client_id: GOOGLE_CLIENT_ID,
 redirect_uri: REDIRECT_URI,
 response_type: 'code',
 scope: 'openid profile email',
 state,
 });
 return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCodeForToken(code: string) {
 const response = await fetch('https://oauth2.googleapis.com/token', {
 method: 'POST',
 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
 body: new URLSearchParams({
 client_id: GOOGLE_CLIENT_ID,
 client_secret: GOOGLE_CLIENT_SECRET,
 code,
 grant_type: 'authorization_code',
 redirect_uri: REDIRECT_URI,
 }),
 });
 if (!response.ok) {
 const error = await response.text();
 throw new Error(`Token exchange failed: ${error}`);
 }
 return response.json();
}

export async function getGoogleUserInfo(accessToken: string) {
 const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
 headers: { Authorization: `Bearer ${accessToken}` },
 });
 if (!response.ok) throw new Error('Failed to fetch user info');
 return response.json();
}

export async function createOrUpdateUser(googleUser: any) {
 const userId = crypto.randomUUID();
 const username = generateUsername(googleUser.name || googleUser.email);

 // Create or update user
 const userResult = await query(
 `INSERT INTO users (id, email, name, avatar_url, google_id)
 VALUES ($1, $2, $3, $4, $5)
 ON CONFLICT (google_id) DO UPDATE SET 
 email = $2, 
 name = $3, 
 avatar_url = $4, 
 updated_at = NOW()
 RETURNING id, email, name, avatar_url`,
 [userId, googleUser.email, googleUser.name, googleUser.picture, googleUser.id]
 );
 const user = userResult.rows[0];

 // Ensure profile exists for this user
 await query(
 `INSERT INTO profiles (user_id, username, display_name, avatar_url)
 VALUES ($1, $2, $3, $4)
 ON CONFLICT (user_id) DO NOTHING`,
 [user.id, username, googleUser.name || 'BrightPress Reader', googleUser.picture || null]
 );

 return user;
}

function generateUsername(name: string): string {
 const base = name
 .toLowerCase()
 .replace(/[^a-z0-9_]/g, '')
 .slice(0, 20) || 'reader';
 return base + crypto.randomBytes(4).toString('hex');
}

