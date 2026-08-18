import { getSession } from '@/lib/session';
import { query } from '@/lib/db';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

export default async function AdminLayout({ children }: { children: ReactNode }) {
 const session = await getSession();

 if (!session) {
 redirect('/admin/login');
 }

 try {
 const result = await query(
 'SELECT role FROM users WHERE id = $1',
 [session.userId]
 );

 if (!result.rows[0] || !['admin', 'moderator'].includes(result.rows[0].role)) {
 redirect('/');
 }
 } catch (error) {
 console.error('Admin check error:', error);
 redirect('/');
 }

 return <>{children}</>;
}

