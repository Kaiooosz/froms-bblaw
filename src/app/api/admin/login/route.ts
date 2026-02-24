import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'bezerraborges@gmail.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bitcoin2025*';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
        const session = await encrypt({ email, expires });

        (await cookies()).set('session', session, { expires, httpOnly: true });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json(
        { message: 'Credenciais inválidas' },
        { status: 401 }
    );
}
