export type LegalGrowthFormData = {
    // Etapa 1 – Identificação
    nome_completo: string;
    whatsapp: string;
    email: string;
    instagram: string;
    tipo_identificacao: 'infoprodutor' | 'expert' | 'afiliado' | 'agencia' | 'coprodutor';

    // Condicionais da Etapa 1
    volume_afiliado?: 'ate_5k' | '5k_20k' | '20k_100k' | 'acima_100k';
    contrato_coprodutor?: 'sim' | 'nao' | 'documento';

    // Etapa 2 – Situação do negócio digital
    faturamento_mensal:
    | 'nao_faturando'
    | 'ate_10k'
    | '10k_50k'
    | '50k_150k'
    | '150k_500k'
    | 'acima_500k';
    cnpj_status:
    | 'mei'
    | 'me_epp'
    | 'lucro_presumido'
    | 'pf'
    | 'nao_quer_abrir'
    | 'quer_abrir';
    plataformas: string[]; // array of platform identifiers
    ticket_medio:
    | 'ate_197'
    | '197_997'
    | '997_3000'
    | 'acima_3000';
    modelo_negocio: string[]; // multiple selection

    // Etapa 3 – Objetivo principal
    objetivo_principal:
    | 'abertura_empresa'
    | 'reduzir_impostos'
    | 'proteger_ip'
    | 'contratos_seguros'
    | 'protecao_consumidor'
    | 'estruturar_lancamento'
    | 'escala_exterior';

    // Módulo A – Abertura/regularização
    motivo_abertura:
    | 'reduzir_imposto'
    | 'emitir_nota'
    | 'separar_patrimonio'
    | 'exigencia_parceiro'
    | 'todos';
    possui_socios?: boolean;
    numero_socios?: number;
    acordo_socios?: 'sim' | 'nao' | 'nunca';
    possui_contador?: 'sim_especializado' | 'sim_generalista' | 'nao';

    // Módulo B – Tributação
    forma_recebimento: string[];
    planejamento_tributario?: 'nao' | 'nao_otimizado' | 'satisfeito';
    maior_duvida_tributaria:
    | 'das_irpj_irpf'
    | 'receitas_internacionais'
    | 'distribuir_lucros'
    | 'nota_fiscal'
    | 'coproducao'
    | 'inicio';

    // Módulo C – Propriedade Intelectual
    ip_proteger: string[];
    registro_existente?: 'nao' | 'marca' | 'direito_autoral' | 'oposicao';
    plagiado?: 'sim' | 'nao' | 'suspeita';
    descricao_plagio?: string;

    // Módulo D – Contratos
    contratos_necessarios: string[];
    conflito_contratos?: 'sim' | 'nao';
    descricao_conflito?: string;
    contrato_avogado?: 'sim' | 'modelo_internet' | 'nao_tem' | 'nunca_precisou';

    // Módulo E – Proteção de Consumidores
    reclamacao_consumidor?:
    | 'nao'
    | 'chargeback'
    | 'reclame_aqui'
    | 'procon'
    | 'multiplas';
    garantia_produto?:
    | '7_dias'
    | 'mais_7'
    | 'nao_oferece'
    | 'desconhece';
    pagina_vendas_obrigatoria?: 'sim_avaliada' | 'sim_nao_avaliada' | 'nao_certeza' | 'nao';
    equipe_protocolo?: 'sim' | 'nao' | 'soeu';

    // Módulo F – Lançamento / Evento
    tipo_lancamento:
    | 'digital'
    | 'evento_online'
    | 'evento_presencial'
    | 'com_coprodutor'
    | 'saas';
    data_lancamento?: string; // ISO date
    faturamento_esperado:
    | 'ate_50k'
    | '50k_200k'
    | '200k_1mi'
    | 'acima_1mi';
    capta_publico_presencial?: boolean;
    contratos_lancamento?: 'todos' | 'parcial' | 'nao' | 'sem_parceiros';

    // Módulo G – Exterior / Internacional
    vende_exterior?: 'sim_regular' | 'sim_esporadico' | 'nao_quero' | 'nao_interessa';
    regioes_venda: string[];
    pagamento_internacional:
    | 'plataforma'
    | 'conta_exterior'
    | 'paypal'
    | 'nao_recebe'
    | 'nao_sabe_declarar';
    interesse_exterior?: 'llc_usa' | 'empresa_portugal' | 'nao_interesse';

    // Etapa 4 – Urgência e Contexto
    urgencia:
    | 'critica'
    | 'alta'
    | 'media'
    | 'normal';
    data_critica?: string;
    consultou_outro?: 'nao' | 'segunda_opiniao' | 'proposta';
    como_soube: string;
    observacoes?: string;

    // Etapa 5 – Revisão e Envio
    lgpd_consent?: boolean;
    contato_preferencia: 'whatsapp' | 'email' | 'dm';
    horario_preferencia: 'manha' | 'tarde' | 'noite';
};
