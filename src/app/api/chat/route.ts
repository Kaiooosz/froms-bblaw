import { NextResponse } from 'next/server';

const NANOBOT_URL = process.env.NANOBOT_URL || 'http://localhost:8000';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const nanobotResponse = await fetch(`${NANOBOT_URL}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, history: history || [] }),
        });

        if (!nanobotResponse.ok || !nanobotResponse.body) {
            const errText = await nanobotResponse.text();
            console.error('Nanobot error:', errText);
            return NextResponse.json(
                { error: 'Nanobot service error', detail: errText },
                { status: nanobotResponse.status }
            );
        }

        // Pipe the SSE stream through
        return new Response(nanobotResponse.body, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        console.error('API Chat proxy error:', error);
        return NextResponse.json(
            { error: 'Could not reach Nanobot service. Is it running on port 8000?' },
            { status: 502 }
        );
    }
}
