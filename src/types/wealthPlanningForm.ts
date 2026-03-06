export interface WealthPlanningFormData {
    // Etapa 1 – Identificação
    nome_completo: string;
    whatsapp: string;
    email: string;
    cidade_estado: string; // Observação: define alíquota de ITCMD
    tipo_cliente: 'pf' | 'empresario' | 'holding' | 'produtor_rural';

    // Condicionais Etapa 1
    numero_empresas?: number; // Para empresário/holding
    faturamento_anual?: string; // Para empresário/produtor rural
    possui_imoveis_exterior?: boolean;
    flag_rural?: boolean; // Ativado se produtor_rural

    // Etapa 2 – Inventário e Ativos
    valor_patrimonio_estimado:
    | 'ate_1mi'
    | '1mi_5mi'
    | '5mi_20mi'
    | '20mi_50mi'
    | 'acima_50mi';
    composicao_patrimonio: string[]; // ['imoveis_urbanos', 'imoveis_rurais', 'empresa_operacional', 'investimentos_financeiros', 'criptoativos', 'veiculos_luxo']
    numero_herdeiros: number;
    conflito_familiar?: 'harmonico' | 'divergencias_leves' | 'litigio_potencial' | 'inventario_em_andamento';

    // Etapa 3 – Objetivos e Problemas (SWITCH)
    objetivo_principal:
    | 'reduzir_itcmd'
    | 'evitar_inventario'
    | 'protecao_blindagem'
    | 'governanca_familiar'
    | 'sucessao_negocio'
    | 'eficiencia_ir';

    // Módulos Sucessórios
    quer_manter_controle: boolean; // Reserva de usufruto
    preocupacao_genros_noras: boolean; // Cláusulas de incomunicabilidade
    interesse_offshore?: boolean; // Se patrimônio alto ou ativos exterior

    // Etapa 4 – Urgência e Envio
    urgencia: 'imediata' | 'proximos_meses' | 'apenas_estudo';
    como_soube: string;
    aceita_termos: boolean;
}
