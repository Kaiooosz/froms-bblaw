import os
import re
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
import httpx

load_dotenv()

app = FastAPI(title="Nanobot BBLAW API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.vercel.app", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VECTOR_DB_PATH = "faiss_index"
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
MODEL_NAME = "openai/gpt-4o-mini"
EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"

# Load local vector store on startup
try:
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    vectorstore = FAISS.load_local(VECTOR_DB_PATH, embeddings, allow_dangerous_deserialization=True)
    # MMR: busca fetch_k=20 candidatos, retorna k=4 com máxima diversidade
    retriever = vectorstore.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 4, "fetch_k": 20, "lambda_mult": 0.6}
    )
    print("Vector database loaded successfully with MMR retriever.")
except Exception as e:
    print(f"Warning: Could not load vector database. Error: {e}")
    retriever = None


def clean_document_title(filename: str) -> str:
    """Extract a clean, human-readable title from a raw filename."""
    # Remove extension
    title = re.sub(r'\.(docx?|pdf|epub|azw3)$', '', filename, flags=re.IGNORECASE)
    # Remove "Cópia de" prefix
    title = re.sub(r'^C[oó]pia\s+de\s+', '', title, flags=re.IGNORECASE)
    # Remove leading number + optional underscore/dash separators (e.g. "045_ ", "257 ", "371 - ")
    title = re.sub(r'^\d+[_\s]*[-–]?\s*', '', title)
    # Remove SEO and/or REVISADO prefix in any combination/case (e.g. "SEO REVISADO ", "REVISADO ", "revisado ")
    title = re.sub(r'^(SEO\s+)?(REVISADO|revisado)\s*', '', title, flags=re.IGNORECASE)
    title = re.sub(r'^SEO\s+', '', title, flags=re.IGNORECASE)
    # Remove trailing " rev" or " revisado" artifact
    title = re.sub(r'\s+rev(isado)?$', '', title, flags=re.IGNORECASE)
    # Handle slug-style names (e.g. "planejamento-patrimonial-e-sucessorio-64e669241a79e")
    if re.match(r'^[a-z0-9_-]+$', title):
        title = re.sub(r'[-_][0-9a-f]{6,}$', '', title)   # remove trailing hash ID
        title = re.sub(r'[-_]', ' ', title)                # hyphens/underscores → spaces
        title = title.title()
    # Handle hyphen-capitalized names (e.g. "O-Novo-Paradigma-da-Protecao-...")
    elif re.search(r'[A-ZÀ-Ú][a-zà-ú]+-[A-ZÀ-Ú]', title):
        title = title.replace('-', ' ')
    return title.strip()


def build_system_prompt(context_str: str) -> str:
    return f"""Você é o Consultor da BBLAW e Settee, especializado em internacionalização, proteção de ativos, offshores e planejamento tributário internacional.

Seu papel é orientar o cliente de forma humana, calorosa e profissional — como um especialista que conversa, não como um robô que lista informações. Seja direto, claro e empático. Evite respostas longas demais; prefira ser objetivo e útil.

BASE DE CONHECIMENTO (use apenas estas informações):
{context_str}

INSTRUÇÕES:
1. Responda somente com base no conteúdo acima. Se não houver informação suficiente, diga isso com honestidade.
2. Não invente dados, países, percentuais ou regras que não estejam na base de conhecimento.
3. Quando a resposta puder ser complementada por um de nossos materiais, mencione o título do documento de forma natural — exemplo: "Temos um material completo sobre isso chamado '[Título]' que pode te ajudar a aprofundar o assunto."
4. Não liste fontes ao final da resposta. Incorpore as referências de forma fluida no texto.
5. Finalize sempre com uma pergunta ou observação que continue o diálogo.
6. Tom: profissional, acolhedor, sem gírias, sem excesso de formalidade.
"""


class ChatRequest(BaseModel):
    message: str
    history: list = []


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not OPENROUTER_API_KEY:
        raise HTTPException(status_code=500, detail="OPENROUTER_API_KEY is not configured in .env")
    if retriever is None:
        raise HTTPException(status_code=500, detail="Vector database not loaded. Run build_vector_db.py first.")

    # 1. Retrieve context with MMR
    try:
        docs = retriever.invoke(request.message)
        context_texts = []
        raw_sources = set()
        for doc in docs:
            raw_source = doc.metadata.get('source', 'Unknown')
            clean_title = clean_document_title(raw_source)
            context_texts.append(f"[{clean_title}]:\n{doc.page_content}")
            raw_sources.add(raw_source)
        context_str = "\n\n".join(context_texts)
        recommended_docs = list({clean_document_title(s) for s in raw_sources})
    except Exception as e:
        context_str = ""
        recommended_docs = []
        print(f"Retrieval error: {e}")

    # 2. Build messages
    messages = [{"role": "system", "content": build_system_prompt(context_str)}]
    if request.history:
        messages.extend(request.history[-6:])
    messages.append({"role": "user", "content": request.message})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Portal BBLAW",
        "Content-Type": "application/json"
    }

    # 3. Stream response via SSE
    async def generate():
        # First event: send recommended docs immediately
        yield f"data: {json.dumps({'type': 'docs', 'recommended_docs': recommended_docs})}\n\n"

        payload = {
            "model": MODEL_NAME,
            "messages": messages,
            "temperature": 0.4,
            "stream": True
        }

        async with httpx.AsyncClient() as client:
            try:
                async with client.stream(
                    "POST",
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                ) as response:
                    async for line in response.aiter_lines():
                        if not line.startswith("data: "):
                            continue
                        data_str = line[6:]
                        if data_str == "[DONE]":
                            yield "data: [DONE]\n\n"
                            return
                        try:
                            chunk = json.loads(data_str)
                            content = chunk["choices"][0]["delta"].get("content", "")
                            if content:
                                yield f"data: {json.dumps({'type': 'chunk', 'content': content})}\n\n"
                        except Exception:
                            pass
            except Exception as e:
                yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
                yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
