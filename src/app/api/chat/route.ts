import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const NANOBOT_URL = process.env.NANOBOT_URL || 'http://localhost:8000';

const DOCUMENT_KEYWORDS = [
    'document', 'enviar', 'pendente', 'falta', 'preciso enviar',
    'lista', 'arquivos', 'anexo', 'o que preciso', 'quais documento',
    'documentação', 'doc ', 'docs', 'enviei', 'já enviei', 'faltando'
];

function isDocumentQuery(message: string): boolean {
    const lower = message.toLowerCase();
    return DOCUMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

function formatDocumentResponse(data: any[]): string {
    if (!data || data.length === 0) {
        return 'Você ainda não possui nenhum formulário em andamento. Acesse o portal e escolha uma das operações disponíveis para iniciar. 📋';
    }

    let response = '**Situação dos seus documentos:**\n\n';

    for (const item of data) {
        const percent = item.total > 0 ? Math.round((item.sentCount / item.total) * 100) : 0;
        response += `📁 **${item.funnelLabel}** — ${item.sentCount}/${item.total} enviados (${percent}%)\n`;

        if (item.pendingCount > 0) {
            response += `\n⏳ *Ainda pendentes:*\n`;
            item.pending.forEach((doc: string) => {
                response += `  • ${doc}\n`;
            });
        } else {
            response += `  ✅ Todos os documentos foram enviados!\n`;
        }
        response += '\n';
    }

    response += 'Para enviar os documentos pendentes, acesse **Portal → Documentação de Suporte**.';
    return response;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Detecta se é uma pergunta sobre documentos — responde diretamente sem nanobot
        if (isDocumentQuery(message)) {
            const session = await auth();
            if (session?.user?.id) {
                try {
                    const baseUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
                    const res = await fetch(`${baseUrl}/api/user/pending-documents`, {
                        headers: { Cookie: req.headers.get('cookie') || '' },
                    });

                    if (res.ok) {
                        const data = await res.json();
                        const responseText = formatDocumentResponse(data);

                        // Retorna como SSE para manter consistência com o cliente
                        const encoder = new TextEncoder();
                        const stream = new ReadableStream({
                            start(controller) {
                                // Chunk por chunk para simular streaming
                                const words = responseText.split(' ');
                                let i = 0;
                                const interval = setInterval(() => {
                                    if (i < words.length) {
                                        const chunk = (i === 0 ? '' : ' ') + words[i];
                                        controller.enqueue(
                                            encoder.encode(
                                                `data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`
                                            )
                                        );
                                        i++;
                                    } else {
                                        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                                        clearInterval(interval);
                                        controller.close();
                                    }
                                }, 15);
                            },
                        });

                        return new Response(stream, {
                            headers: {
                                'Content-Type': 'text/event-stream',
                                'Cache-Control': 'no-cache',
                                'Connection': 'keep-alive',
                            },
                        });
                    }
                } catch (docErr) {
                    console.error('Document query error:', docErr);
                    // Continua para o nanobot se falhar
                }
            }
        }

        // Proxy para o nanobot (comportamento padrão)
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
