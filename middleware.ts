import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './src/lib/auth';

export async function middleware(request: NextRequest) {
    const session = await getSession();

    // If the user is trying to access admin pages (except login)
    if (request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login')) {
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
