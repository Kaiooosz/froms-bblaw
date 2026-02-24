import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from './src/lib/auth';

export async function middleware(request: NextRequest) {
    const sessionCookie = request.cookies.get('session')?.value;

    // Se estiver tentando acessar rotas do Admin (exceto login) ou API do Admin
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && !request.nextUrl.pathname.startsWith('/admin/login');
    const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin') && !request.nextUrl.pathname.startsWith('/api/admin/login');

    if (isAdminRoute || isAdminApi) {
        if (!sessionCookie) {
            if (isAdminApi) return NextResponse.json({ message: 'Acesso Negado' }, { status: 401 });
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        try {
            const parsed = await decrypt(sessionCookie);
            if (!parsed || !parsed.email) throw new Error('Sessão inválida');
        } catch (error) {
            if (isAdminApi) return NextResponse.json({ message: 'Sessão Expirada' }, { status: 401 });
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
