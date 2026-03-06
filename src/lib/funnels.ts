import {
    Globe,
    MapPin,
    Coins,
    Landmark,
    Briefcase,
    Gavel,
    ShieldCheck,
    Calculator
} from 'lucide-react';

export const funnelConfig: Record<string, any> = {
    residencia_py: {
        title: 'Residência Fiscal Paraguai',
        tags: ['Internacional', 'Residência PY'],
        icon: MapPin,
        pages: [
            {
                title: 'Regras Operacionais Críticas',
                description: '🚨 AVISO: Você deve enviar fotos de todos os seus documentos para nossa conferência ANTES de realizar o Apostilamento de Haia. Isso evita custos desnecessários com documentos incorretos.',
                questions: [
                    { id: 'entendeu_regra', type: 'radio', label: 'Ciente da necessidade de conferência prévia?', options: ['Sim, estou ciente', 'Já realizei o apostilamento'], required: true }
                ]
            },
            {
                title: 'Checklist de Documentos (Bloco A)',
                description: 'Marque os documentos que você já possui em mãos (Originais com Apostila de Haia onde aplicável).',
                questions: [
                    {
                        id: 'docs_obrigatorios',
                        type: 'checkbox',
                        label: 'Selecione os documentos prontos:',
                        options: [
                            'Certidão de Nascimento (Original + Apostila)',
                            'Certidão de Casamento (Se casado, substitui nascimento)',
                            'Antecedentes Criminais (PF + Apostila)',
                            'Passaporte (Documento físico)',
                            'RG (Documento físico)',
                            'Certificado de Vacina Febre Amarela (gov.br)',
                            'Foto para Interpol (Pode ser via celular)'
                        ]
                    }
                ]
            },
            {
                title: 'Informações Pessoais (Bloco B)',
                description: 'Dados necessários para o protocolo migratório inicial.',
                questions: [
                    { id: 'estado_civil', type: 'radio', label: 'Estado Civil:', options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)'], required: true },
                    {
                        id: 'profissao_ocupacao',
                        type: 'radio',
                        label: 'Profissão/Ocupação:',
                        options: ['Comerciante (Recomendado)', 'Profissional Liberal', 'Empresário', 'Outro'],
                        required: true,
                        helpText: 'Dica: Declarar "Comerciante" facilita a obtenção da residência permanente após 2 anos.'
                    }
                ]
            },
            {
                title: 'Qualificação Financeira',
                description: 'Dados para análise de viabilidade e enquadramento tributário.',
                questions: [
                    { id: 'possui_renda_intl', type: 'radio', label: 'Você já possui renda internacional?', options: ['Sim', 'Não', 'Parcialmente'], required: true },
                    { id: 'renda_mensal', type: 'radio', label: 'Qual sua renda média mensal?', options: ['Até R$ 30 mil', 'R$ 30–100 mil', 'R$ 100–300 mil', 'Acima de R$ 300 mil'], required: true },
                    { id: 'patrimonio_estimado', type: 'radio', label: 'Seu patrimônio estimado é:', options: ['Até R$ 500 mil', 'R$ 500 mil – 2 milhões', 'R$ 2 – 10 milhões', 'Acima de R$ 10 milhões'], required: true },
                    { id: 'saida_fiscal', type: 'radio', label: 'Você já declarou saída fiscal do Brasil?', options: ['Sim', 'Não', 'Não sei'], required: true }
                ]
            }
        ]
    },
    offshore: {
        title: 'Offshore Internacional',
        tags: ['Internacional', 'Offshore'],
        icon: Globe,
        pages: [
            {
                title: 'Estrutura Desejada',
                description: 'A conformidade bancária depende da jurisdição escolhida. Recomendamos Névis para maior sigilo patrimonial.',
                questions: [
                    { id: 'jurisdicao_considerada', type: 'radio', label: 'Qual jurisdição você considera?', options: ['BVI', 'Nevis', 'UK', 'Paraguai', 'Não sei, preciso de orientação', 'Outro'], required: true },
                    { id: 'necessita_conta', type: 'radio', label: 'Você precisa de conta bancária internacional?', options: ['Sim', 'Não', 'Apenas fintech'], required: true }
                ]
            },
            {
                title: 'Identificação (Bloco A)',
                description: 'Documentos essenciais para todos os sócios e diretores da estrutura.',
                questions: [
                    {
                        id: 'docs_identificacao',
                        type: 'checkbox',
                        label: 'Documentos Prontos:',
                        options: [
                            'Cópia do Passaporte Válido (Notarizada/Certificada)',
                            'Comprovante de Residência (< 90 dias)'
                        ],
                        helpText: 'O comprovante pode ser conta de luz, água, telefone ou extrato bancário.'
                    }
                ]
            },
            {
                title: 'Due Diligence (Bloco B)',
                description: 'Referências necessárias para abertura de conta bancária e conformidade internacional.',
                questions: [
                    {
                        id: 'referencias_dd',
                        type: 'checkbox',
                        label: 'Referências Disponíveis:',
                        options: [
                            'Carta de Referência Bancária (> 1-2 anos de relacionamento)',
                            'Carta de Referência Profissional (Advogado/Contador)'
                        ]
                    }
                ]
            },
            {
                title: 'Origem de Recursos (Bloco C)',
                description: 'Documentar a origem de fundos é OBRIGATÓRIO para aprovação em bancos Tier 1 (Suíça, EUA, etc).',
                questions: [
                    { id: 'source_of_funds', type: 'textarea', label: 'Declare sua Fonte de Fundos (Source of Funds):', required: true, helpText: 'Ex: Dividendos, Venda de Ativos, Herança.' },
                    { id: 'source_of_wealth', type: 'textarea', label: 'Declare sua Fonte de Patrimônio (Source of Wealth):', required: true, helpText: 'Descreva como o patrimônio total foi construído ao longo dos anos.' },
                    { id: 'docs_suporte_offshore', type: 'file', label: 'Upload de Documentação Suporte (Opcional):', multiple: true, helpText: 'Contrato Social, CNPJ, último balanço ou declaração de faturamento.' }
                ]
            },
            {
                title: 'Estrutura Societária',
                description: 'As leis de CFC (Controlled Foreign Corporation) no Brasil exigem transparência acima de certos limites de faturamento.',
                questions: [
                    { id: 'num_socios', type: 'number', label: 'Quantos sócios?', placeholder: 'Ex: 1' },
                    { id: 'beneficial_owner', type: 'radio', label: 'Você será Beneficial Owner?', options: ['Sim', 'Não'] },
                    { id: 'faturamento_anual', type: 'text', label: 'Faturamento anual estimado?', placeholder: 'Ex: $ 1.000.000' },
                    { id: 'volume_mensal', type: 'text', label: 'Volume mensal médio?' }
                ]
            }
        ]
    },
    holding: {
        title: 'Holding Nacional / Planejamento Patrimonial',
        tags: ['Consultivo', 'Holding Nacional'],
        icon: Landmark,
        pages: [
            {
                title: 'Perguntas Estratégicas',
                description: 'Uma holding eficiente visa evitar o inventário (custo de 10-15% do patrimônio) e reduzir a carga tributária imobiliária.',
                questions: [
                    { id: 'possui_imoveis', type: 'radio', label: 'Você possui imóveis?', options: ['1-3', '4-10', '10+'], required: true },
                    { id: 'valor_patrimonio_imob', type: 'text', label: 'Valor aproximado do patrimônio imobiliário?', placeholder: 'Ex: R$ 5.000.000' },
                    { id: 'empresa_ativa', type: 'radio', label: 'Possui empresa ativa?', options: ['Sim', 'Não'], required: true },
                    { id: 'possui_holding', type: 'radio', label: 'Já possui holding?', options: ['Sim', 'Não'], required: true },
                    { id: 'risco_temido', type: 'textarea', label: 'Qual risco patrimonial você mais teme hoje?', placeholder: 'Ex: Bloqueios, inventários caros...', required: true }
                ]
            }
        ]
    },
    cripto: {
        title: 'Estruturação Cripto / Custódia',
        tags: ['Criptoativos'],
        icon: Coins,
        pages: [
            {
                title: 'Perfil de Ativos Digitais',
                description: 'Atenção: A Instrução Normativa 1888 da RFB exige a declaração de ativos em exchanges estrangeiras acima de certas quantias.',
                questions: [
                    { id: 'patrimonio_cripto', type: 'radio', label: 'Patrimônio em cripto estimado:', options: ['Até R$ 500 mil', 'R$ 500k – 2M', 'R$ 2M – 10M', '10M+'], required: true },
                    { id: 'declarado_ir', type: 'radio', label: 'Está declarado no IR?', options: ['Sim', 'Parcialmente', 'Não'], required: true },
                    { id: 'custodia_utilizada', type: 'checkbox', label: 'Utiliza:', options: ['Exchange', 'Cold wallet', 'Multisig', 'DeFi', 'Outro'] },
                    { id: 'notificado_receita', type: 'radio', label: 'Já foi notificado pela Receita?', options: ['Sim', 'Não'], required: true }
                ]
            }
        ]
    },
    sucessorio: {
        title: 'Planejamento Sucessório',
        tags: ['Planejamento Sucessório'],
        icon: Briefcase,
        pages: [
            {
                title: 'Estrutura de Sucessão',
                questions: [
                    { id: 'num_herdeiros', type: 'number', label: 'Número de herdeiros diretos' },
                    { id: 'conf_familiar', type: 'radio', label: 'Risco de conflito entre herdeiros?', options: ['Baixo', 'Moderado', 'Alto'] },
                    { id: 'objetivo_sucessao', type: 'textarea', label: 'Qual o principal objetivo com a sucessão?', required: true }
                ]
            }
        ]
    },
    contencioso: {
        title: 'Contencioso Estratégico',
        tags: ['Contencioso'],
        icon: Gavel,
        pages: [
            {
                title: 'Natureza da Demanda',
                description: '⚠️ URGENTE: Se o prazo de defesa estiver próximo, anexe os documentos imediatamente para análise prioritária.',
                questions: [
                    { id: 'tipo_problema', type: 'radio', label: 'Tipo de problema:', options: ['Tributário', 'Empresarial', 'Administrativo', 'Outro'], required: true },
                    { id: 'prazo_correndo', type: 'radio', label: 'Existe prazo correndo?', options: ['Sim', 'Não', 'Não sei'], required: true },
                    { id: 'docs_processo', type: 'file', label: 'Anexar documentos do processo', multiple: true },
                    { id: 'resumo_caso', type: 'textarea', label: 'Fale brevemente sobre o problema', required: true }
                ]
            }
        ]
    },
    compliance: {
        title: 'Retainer / Compliance Recorrente',
        tags: ['Consultivo'],
        icon: ShieldCheck,
        pages: [
            {
                title: 'Dados Corporativos',
                questions: [
                    { id: 'faturamento_mensal_corp', type: 'text', label: 'Sua empresa fatura quanto por mês?', placeholder: 'R$ 0,00' },
                    { id: 'tem_contador', type: 'radio', label: 'Possui contador atual?', options: ['Sim', 'Não'] },
                    { id: 'fluxo_intl', type: 'radio', label: 'Opera internacionalmente?', options: ['Sim', 'Não'] },
                    { id: 'autuacao_fiscal', type: 'radio', label: 'Já teve autuação fiscal?', options: ['Sim', 'Não'] }
                ]
            }
        ]
    },
    contabil: {
        title: 'Contabilidade Empresarial',
        tags: ['Contábil'],
        icon: Calculator,
        pages: [
            {
                title: 'Configuração Contábil',
                questions: [
                    { id: 'tipo_empresa', type: 'radio', label: 'Tipo de empresa:', options: ['MEI', 'LTDA', 'Holding', 'Offshore'], required: true },
                    { id: 'regime_tributario', type: 'radio', label: 'Regime tributário atual:', options: ['Simples', 'Lucro Presumido', 'Lucro Real'], required: true },
                    { id: 'ir_atraso', type: 'radio', label: 'Está com IR em atraso?', options: ['Sim', 'Não'], required: true }
                ]
            }
        ]
    }
};
