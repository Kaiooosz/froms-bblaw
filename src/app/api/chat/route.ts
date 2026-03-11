import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        console.log("Recebendo requisição no chat. Mensagem:", message);

        /**
         * ==========================================
         * 🚨 PREPARAÇÃO PARA CONEXÃO COM IA 🚨
         * ==========================================
         * 
         * Aqui você pode integrar com o OpenAI, Anthropic, Gemini, etc.
         * 
         * Exemplo para OpenAI:
         * 
         * import OpenAI from 'openai';
         * const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
         * 
         * const completion = await openai.chat.completions.create({
         *   model: "gpt-4o",
         *   messages: [
         *      { role: "system", content: "Você é o assistente estratégico da BBLAW..." },
         *      ...history.map(m => ({ role: m.role, content: m.content })),
         *      { role: "user", content: message }
         *   ],
         * });
         * 
         * const aiResponse = completion.choices[0].message.content;
         * return NextResponse.json({ reply: aiResponse });
         */

        // FIXME: Resposta simulada (até que a key e IA original sejam configuradas)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência de rede

        const simulatedReply = `Integração de I.A pronta. Este espaço foi modularizado e agora está pronto para receber o modelo escolhido (como o GPT-4o ou Claude) pelo Backend, respeitando a sua restrição. Recebi sua mensagem: "${message}"`;

        // Simulando a IA sugerindo novas dúvidas e ramificações da conversa
        const baseSuggestions = [
            "Quais as vantagens tributárias de operar em jurisdições de common law?",
            "Como a legislação brasileira enxerga uma Offshore não declarada?",
            "Pode me dar exemplos de blindagem de capital corporativo em LLCs?",
            "Quais os prazos médios de sucessão num cenário internacional?"
        ];
        
        // Randomizar (dummy behavior)
        const suggestions = baseSuggestions.sort(() => 0.5 - Math.random()).slice(0, 4);

        return NextResponse.json({ reply: simulatedReply, suggestions });

    } catch (error) {
        console.error('API Chat Error:', error);
        return NextResponse.json(
            { error: 'Internal server error while processing chat message' },
            { status: 500 }
        );
    }
}
