# BBLAW — Plataforma de Atendimento Jurídico Estratégico

> Plataforma web completa para captação, gestão e atendimento de clientes da **Bezerra Borges Advogados**, com formulários inteligentes, painel administrativo, integração com Google Drive e assistente de IA jurídica.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Funcionalidades](#funcionalidades)
- [Módulos Principais](#módulos-principais)
- [Banco de Dados](#banco-de-dados)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Rodar Localmente](#como-rodar-localmente)

---

## Visão Geral

A plataforma **BBLAW Forms** é um sistema de intake jurídico que permite:

- Clientes preencherem formulários estratégicos de múltiplas etapas para diferentes serviços jurídicos
- Envio e armazenamento de documentos no Google Drive
- Acompanhamento do processo pelo painel de administração
- Consultas à IA jurídica treinada na base de conhecimento da BBLAW
- Autenticação segura via Google OAuth ou e-mail/senha

---

## Tecnologias

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| **Next.js** | 16.1.6 | Framework React com App Router |
| **React** | 19.2.3 | Interface de usuário |
| **TypeScript** | 5 | Tipagem estática |
| **Framer Motion** | 12.35.0 | Animações e transições |
| **Lucide React** | 0.575.0 | Ícones |
| **React Hook Form** | 7.71.2 | Gerenciamento de formulários |
| **jsPDF** | 4.2.0 | Geração de PDFs |

### Backend & APIs
| Tecnologia | Versão | Uso |
|---|---|---|
| **Next.js API Routes** | — | Backend serverless |
| **Prisma ORM** | 6.2.1 | Acesso ao banco de dados |
| **NextAuth.js v5** | 5.0.0-beta | Autenticação |
| **Google APIs** | 171.4.0 | Integração com Google Drive |
| **bcryptjs** | 3.0.3 | Hash de senhas |
| **jose** | 6.1.3 | JWT personalizado |

### Banco de Dados & Infraestrutura
| Tecnologia | Uso |
|---|---|
| **PostgreSQL** (via Supabase) | Banco de dados principal |
| **Prisma** | ORM e migrations |
| **Google Drive** | Armazenamento de documentos |
| **Vercel** | Deploy e hosting do frontend/backend |
| **Hugging Face Spaces** | Hospedagem do nanobot de IA |

### IA (Nanobot)
| Tecnologia | Uso |
|---|---|
| **FastAPI** | API Python do nanobot |
| **LangChain** | Orquestração de LLM |
| **FAISS** | Banco vetorial para busca semântica |
| **HuggingFace Embeddings** | Modelo de embeddings multilíngue |
| **OpenRouter** | Gateway para modelos LLM |
| **Docker** | Container no Hugging Face Spaces |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                         │
│                  Next.js 16 — App Router (SSR)                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
    ┌──────▼──────┐                ┌───────▼────────┐
    │  Auth Layer  │                │  API Routes     │
    │  NextAuth v5 │                │  (serverless)   │
    │  JWT + OAuth │                └───────┬────────┘
    └──────┬───────┘                        │
           │                    ┌───────────┼──────────────┐
    ┌──────▼──────┐      ┌──────▼─────┐ ┌──▼──────┐ ┌─────▼──────┐
    │  Middleware  │      │  Prisma    │ │ Google  │ │  Nanobot   │
    │  (RBAC)      │      │  ORM       │ │ Drive   │ │  IA (HF)   │
    └─────────────┘      └──────┬─────┘ └─────────┘ └────────────┘
                                │
                         ┌──────▼──────┐
                         │  PostgreSQL  │
                         │  (Supabase)  │
                         └─────────────┘
```

### Fluxo de Autenticação

```
Usuário → /auth/signin
    ├── Google OAuth → NextAuth callback → JWT com role
    └── Credenciais → bcrypt compare → JWT com role
              │
    JWT callback → verifica ADMIN_EMAILS → atribui role ADMIN/CLIENT
              │
    Middleware → /admin/* exige ADMIN
              └── /funnels, /chat exige CLIENT ou ADMIN
```

### Fluxo de Documentos

```
Cliente → upload arquivo → /api/upload
    → Google Drive Service Account
    → pasta: ROOT / email / funnelType / tipo /
    → salva URL no banco (Document.path)
    → toast de confirmação para o usuário

Admin → painel DOCS → botão "Abrir no Drive"
    → abre pasta do cliente no Google Drive
```

### Fluxo do Chat IA

```
Usuário → mensagem → /api/chat (Next.js)
    ├── isDocumentQuery? → /api/user/pending-documents
    │       → retorna lista de docs pendentes (SSE)
    └── query geral → NANOBOT_URL/chat (HF Spaces)
            → FAISS busca documentos relevantes
            → OpenRouter (LLM) gera resposta
            → SSE streaming de chunks → frontend
```

---

## Estrutura de Pastas

```
froms-bblaw/
├── src/
│   ├── app/
│   │   ├── (protected)/           # Rotas que exigem login
│   │   │   ├── chat/              # Chat com IA
│   │   │   └── documentos/        # Envio de documentos
│   │   ├── admin/                 # Painel administrativo
│   │   │   ├── dashboard/         # Dashboard principal
│   │   │   ├── documentos/        # Gestão de documentos
│   │   │   ├── login/             # Login admin
│   │   │   └── submissions/       # Visualizar formulários
│   │   ├── api/
│   │   │   ├── admin/             # Endpoints admin
│   │   │   ├── auth/              # Autenticação
│   │   │   ├── chat/              # Proxy para nanobot
│   │   │   ├── download/[id]/     # Download de docs
│   │   │   ├── leads/             # Cadastro de leads
│   │   │   ├── submissions/       # Submissão de formulários
│   │   │   ├── upload/            # Upload para Drive
│   │   │   └── user/              # Dados do usuário
│   │   ├── auth/                  # Páginas de autenticação
│   │   ├── form/[funnelId]/       # Formulários dinâmicos
│   │   ├── funnels/               # Listagem de serviços
│   │   └── layout.tsx / page.tsx
│   ├── components/
│   │   ├── LegalGrowthForm/       # Formulário Crescimento Jurídico
│   │   ├── OffshoreForm/          # Formulário Offshore
│   │   ├── StrategicLegalForm/    # Formulário Jurídico Estratégico
│   │   ├── StrategicLitigationForm/ # Formulário Contencioso
│   │   └── WealthPlanningForm/    # Formulário Planejamento Patrimonial
│   ├── lib/
│   │   ├── google-drive.ts        # Integração Google Drive
│   │   ├── funnels.ts             # Configuração dos funis
│   │   ├── prisma.ts              # Cliente Prisma singleton
│   │   └── supabase.ts            # Cliente Supabase
│   ├── types/                     # Tipos TypeScript dos formulários
│   ├── auth.ts                    # Configuração NextAuth
│   └── middleware.ts              # Proteção de rotas (RBAC)
├── prisma/
│   └── schema.prisma              # Schema do banco de dados
├── nanobot-service/               # Serviço Python de IA
│   ├── main.py                    # FastAPI + FAISS + LangChain
│   ├── Dockerfile                 # Container para HF Spaces
│   ├── requirements.txt
│   └── faiss_index/               # Índice vetorial pré-gerado
└── public/                        # Assets estáticos (logos)
```

---

## Funcionalidades

### Para Clientes
- ✅ Cadastro e login (Google OAuth ou e-mail/senha)
- ✅ Listagem de serviços jurídicos disponíveis (funis)
- ✅ Formulários de múltiplas etapas por tipo de serviço
- ✅ Upload de documentos (armazenados no Google Drive)
- ✅ Chat com assistente de IA jurídica (streaming em tempo real)
- ✅ Consulta de documentos pendentes via chat

### Para Administradores
- ✅ Dashboard com métricas de leads e protocolos
- ✅ Visualização e gestão de leads estratégicos
- ✅ Visualização de protocolos ativos (submissions)
- ✅ Repositório de documentos enviados por clientes
- ✅ Acesso direto à pasta do cliente no Google Drive
- ✅ Exportação de dados em batch
- ✅ Diretório de usuários

---

## Módulos Principais

### Funis de Serviço (`src/lib/funnels.ts`)

A plataforma oferece **8 funis** de captação, cada um com formulário multi-etapas:

| Funil | Descrição |
|---|---|
| `residencia_py` | Residência Fiscal no Paraguai |
| `offshore` | Estrutura Offshore Internacional |
| `holding` | Holding Nacional / Planejamento Patrimonial |
| `cripto` | Custódia e Gestão de Criptoativos |
| `sucessorio` | Planejamento Sucessório |
| `contencioso` | Contencioso Estratégico |
| `compliance` | Compliance e Contratos |
| `contabil` | Serviços Contábeis |

### Nanobot de IA (`nanobot-service/`)

Assistente jurídico com **RAG (Retrieval-Augmented Generation)**:

- Base de conhecimento: materiais proprietários da BBLAW/Settee em PDF
- Embeddings: `paraphrase-multilingual-MiniLM-L12-v2` (multilíngue)
- Busca: FAISS com MMR (Maximal Marginal Relevance)
- LLM: via OpenRouter (configurável)
- Deploy: Hugging Face Spaces (Docker, porta 7860)
- Streaming: SSE (Server-Sent Events)

---

## Banco de Dados

### Modelos principais

```prisma
User          — Usuários cadastrados (clientes e admins)
Submission    — Respostas de formulários (protocolos)
Lead          — Dados completos de leads captados
Document      — Documentos enviados (URL do Google Drive)
Account       — OAuth accounts (NextAuth)
Session       — Sessões (NextAuth)
```

### Enums de Funil
```
PARAGUAI | OFFSHORE | HOLDING | CRIPTO | SUCESSORIO | CONTENCIOSO | GERAL
```

---

## Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Autenticação
AUTH_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Admin (suporta múltiplos emails separados por vírgula)
ADMIN_EMAILS=email1@gmail.com,email2@gmail.com
ADMIN_PASSWORD=...

# Google Drive (Service Account)
GOOGLE_DRIVE_FOLDER_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...

# Nanobot IA
NANOBOT_URL=https://bezerraborges-bblaw-nanobot.hf.space
```

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- npm
- PostgreSQL (ou conta Supabase)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Kaiooosz/froms-bblaw.git
cd froms-bblaw

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env.local com as variáveis acima

# Execute as migrations do banco
npx prisma db push

# Inicie o servidor de desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

### Nanobot (opcional, para chat com IA)

```bash
cd nanobot-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Adicione `NANOBOT_URL=http://localhost:8000` no `.env.local`.

---

## Deploy

| Serviço | Plataforma |
|---|---|
| Frontend + Backend | **Vercel** (branch `main`) |
| Banco de Dados | **Supabase** (PostgreSQL) |
| Armazenamento | **Google Drive** (Service Account) |
| Nanobot IA | **Hugging Face Spaces** (Docker) |

---

<p align="center">
  Desenvolvido para <strong>Bezerra Borges Advogados</strong>
</p>
