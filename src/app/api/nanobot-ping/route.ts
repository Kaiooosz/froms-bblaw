import { NextResponse } from 'next/server';

const NANOBOT_URL = process.env.NANOBOT_URL || 'http://localhost:8000';

export const maxDuration = 60;

// Called by Vercel cron every 30 minutes to keep the HF Space warm
export async function GET() {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 55000);

        const res = await fetch(`${NANOBOT_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'ping', history: [] }),
            signal: controller.signal,
        });
        clearTimeout(timeout);

        return NextResponse.json({ ok: true, status: res.status, ms: Date.now() });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e.message }, { status: 200 });
    }
}
