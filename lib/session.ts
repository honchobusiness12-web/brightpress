import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
 process.env.AUTH_SECRET || 'dev-secret-key-change-in-production'
);

export interface SessionPayload {
 userId: string;
}

export async function createSession(userId: string): Promise<string> {
 const token = await new SignJWT({ userId })
 .setProtectedHeader({ alg: 'HS256' })
 .setIssuedAt()
 .setExpirationTime('30d')
 .sign(JWT_SECRET);

 const cookieStore = await cookies();
 cookieStore.set('session', token, {
 httpOnly: true,
 secure: process.env.NODE_ENV === 'production',
 sameSite: 'lax',
 maxAge: 30 * 24 * 60 * 60, // 30 days
 path: '/',
 });

 return token;
}

export async function getSession(): Promise<SessionPayload | null> {
 const cookieStore = await cookies();
 const token = cookieStore.get('session')?.value;

 if (!token) return null;

 try {
 const verified = await jwtVerify(token, JWT_SECRET);
 return {
 userId: verified.payload.userId as string,
 };
 } catch (error) {
 console.error('Session verification failed:', error);
 return null;
 }
}

export async function deleteSession(): Promise<void> {
 const cookieStore = await cookies();
 cookieStore.delete('session');
}

