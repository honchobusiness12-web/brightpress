import { deleteSession } from '@/lib/session';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(new URL('/', request.url));
}
