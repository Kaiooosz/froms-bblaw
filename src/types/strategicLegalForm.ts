export interface StrategicLegalFormData {
    // Etapa 1 – Identificação
    nomeCompleto: string;
    whatsapp: string;
    email: string;
    cidadeEstado: string;
    representa:
    | 'Empresário individual / sócio único'
    | 'Sociedade com 2 ou mais sócios'
    | 'Startup (menos de 5 anos / buscando captação)'
    | 'Scale-up (crescimento acelerado / já com receita)'
    | 'Grupo empresarial / Holding operacional'
    | 'Empresa com operações internacionais';
    // Condicionais da Etapa 1
    faseStartup?:
    | 'Ideação (pré-operacional)'
    | 'MVP / Operando sem receita consistente'
    | 'Tração (receita recorrente, equipe formada)'
    | 'Crescimento (buscando Series A ou superior)'
    | 'Pré-IPO ou saída estratégica';
    faturamentoAnual?:
    | 'Pré-receita / ainda não fatura'
    | 'Até R$ 500 mil/ano'
    | 'R$ 500 mil – R$ 3 mi/ano'
    | 'R$ 3 mi – R$ 15 mi/ano'
    | 'R$ 15 mi – R$ 100 mi/ano'
    | 'Acima de R$ 100 mi/ano';
    numeroEmpresasGrupo?: number;
    advogadoAtual:
    | 'Não — resolvemos demandas quando surgem'
    | 'Sim, advogado pontual sem vínculo fixo'
    | 'Sim, escritório generalista'
    | 'Sim, mas quero especialização adicional'
    | 'Sim, e estou considerando trocar';
    motivoTroca?:
    | 'Falta de especialização no meu setor'
    | 'Demora e falta de proatividade'
    | 'Custo sem percepção de valor'
    | 'Escritório não acompanhou o crescimento da empresa'
    | 'Conflito de interesse'
    | 'Outro';

    // Etapa 2 – Contexto Empresarial
    setorAtuacao:
    | 'Tecnologia / SaaS / Software'
    | 'E-commerce / Varejo digital'
    | 'Saúde e bem-estar'
    | 'Educação / Edtech'
    | 'Agronegócio'
    | 'Construção civil / Real estate'
    | 'Indústria e manufatura'
    | 'Serviços profissionais (consultoria, agência)'
    | 'Financeiro / Fintech'
    | 'Cripto / Web3'
    | 'Outro';
    numeroFuncionarios:
    | 'Só eu (sócio solo)'
    | '2 a 10'
    | '11 a 50'
    | '51 a 200'
    | 'Acima de 200';
    regimeTributario:
    | 'MEI'
    | 'Simples Nacional'
    | 'Lucro Presumido'
    | 'Lucro Real'
    | 'Ainda não constituída'
    | 'Não sei';
    areasDemanda: string[]; // múltipla escolha
    maiorRiscoJuridico: string;

    // Etapa 3 – Objetivo Principal
    objetivoPrioritario:
    | 'Contratos Nacionais (prestação de serviços, parcerias, fornecedores)'
    | 'Contratos Internacionais (cross-border, arbitragem, compliance internacional)'
    | 'Acordos Societários (acordo de sócios, vesting, stock options)'
    | 'Planejamento Tributário Empresarial (reestruturação, regime, otimização)'
    | 'Reorganização Societária (cisão, fusão, incorporação)'
    | 'Apoio a Startups e Scale-ups (estruturação, captação, governança)';

    // Módulo 4.1 – Contratos Nacionais
    contratosNacionais?: string[]; // lista de tipos de contrato
    tipoContratoB2B?: 'Exclusivamente B2B' | 'Exclusivamente B2C' | 'Ambos';
    valorMedioContrato?:
    | 'Até R$ 10 mil'
    | 'R$ 10 mil – R$ 100 mil'
    | 'R$ 100 mil – R$ 1 mi'
    | 'Acima de R$ 1 mi';
    contratoLitigio?: 'Não' | 'Sim, resolvemos amigavelmente' | 'Sim, virou processo judicial' | 'Sim, com frequência';

    // Módulo 4.2 – Contratos Internacionais
    operacoesInternacionais?: string[]; // múltipla escolha
    regioesEnvolvidas?: string[]; // múltipla escolha
    clausulaArbitragem?: 'Sim, câmara e sede definidas' | 'Sim, mas genérica' | 'Não' | 'Não sei';
    idiomaContrato?: 'Português' | 'Inglês' | 'Espanhol' | 'Bilíngue (português / inglês)' | 'Outro';
    valorContratoInternacional?:
    | 'Até USD 100 mil/ano'
    | 'USD 100 mil – USD 1 mi/ano'
    | 'USD 1 mi – USD 10 mi/ano'
    | 'Acima de USD 10 mi/ano';
    complianceInternacional?: string[]; // múltipla escolha

    // Módulo 4.3 – Acordos Societários
    acordosSocietarios?: string[]; // itens a estruturar
    numeroSocios?: number;
    acordoSocietarioVigente?: 'Não' | 'Sim, mas nunca foi atualizado' | 'Sim, atualizado nos últimos 2 anos' | 'Tem contrato social mas sem acordo separado';
    participacaoAcionaria?: 'Sim, já temos stock options / vesting' | 'Sim, queremos implementar' | 'Não, apenas sócios fundadores';
    modeloVestingElaborado?: 'Sim, estruturado juridicamente' | 'Não, usamos modelo adaptado' | 'Não sei como foi elaborado';
    entradaInvestidorPrevista?: 'Sim, já em negociação' | 'Sim, planejamos captar' | 'Não por enquanto';

    // Módulo 4.4 – Planejamento Tributário Empresarial
    objetivoTributario:
    | 'Reduzir carga tributária sobre o faturamento'
    | 'Otimizar tributação sobre lucros e dividendos'
    | 'Mudar de regime tributário'
    | 'Reestruturar empresa para reduzir impostos'
    | 'Planejamento para venda de empresa (M&A)'
    | 'Recuperar créditos tributários pagos indevidamente'
    | 'Tributação de operações internacionais';
    cargaTributariaAtual:
    | 'Até 8% (Simples Nacional faixas iniciais)'
    | '8% a 15%'
    | '15% a 25%'
    | 'Acima de 25%'
    | 'Não sei calcular';
    fontesReceita: string[]; // múltipla escolha
    distribuicaoLucros?: 'Sim, regularmente e documentada' | 'Sim, mas sem documentação formal' | 'Não distribuímos lucros' | 'Não sei se estamos fazendo corretamente';
    operacoesExterior?: 'Sim' | 'Não' | 'Em planejamento';
    autuacaoFiscal?: 'Não' | 'Sim, resolvida' | 'Sim, em andamento' | 'Sim, com débito parcelado (PERT/REFIS)';
    processoFiscalNumero?: string; // condicional se autuacaoFiscal = em andamento
    processoFiscalValor?: string;

    // Módulo 4.5 – Reorganização Societária
    tipoReorganizacao:
    | 'Cisão parcial (separar parte da empresa)'
    | 'Cisão total (dividir em duas empresas)'
    | 'Fusão (unir duas empresas em uma nova)'
    | 'Incorporação (absorver empresa por outra)'
    | 'Transformação de tipo societário (LTDA para S.A. ou vice-versa)'
    | 'Constituição de holding sobre empresas operacionais existentes';
    motivacaoReorganizacao:
    | 'Separar risco entre unidades de negócio'
    | 'Reduzir carga tributária do grupo'
    | 'Preparar para venda total ou parcial'
    | 'Facilitar entrada de investidor'
    | 'Resolver conflito entre sócios'
    | 'Sucessão e planejamento patrimonial'
    | 'Expansão internacional';
    passivosConhecidos?: 'Não' | 'Sim, já provisionados no balanço' | 'Sim, ainda não quantificados' | 'Não sei';
    prazoEventoExterno?: 'Sim — venda, captação ou prazo regulatório' | 'Não — estamos planejando com calma' | 'Sim — mudança societária ou saída de sócio';
    descricaoEventoExterno?: string; // condicional se prazoEventoExterno = Sim

    // Módulo 4.6 – Apoio a Startups e Scale-ups
    faseStartupApoio?:
    | 'Ideação / Pré-operacional'
    | 'MVP validado / Primeiros clientes'
    | 'Tração / Crescimento (MRR positivo)'
    | 'Série A ou superior'
    | 'Scale-up (>R$ 10 mi ARR)';
    necessidadesStartup: string[]; // múltipla escolha
    captouInvestimento?:
    | 'Não, ainda bootstrapped'
    | 'Sim, investimento anjo'
    | 'Sim, aceleradora (equity ou não)'
    | 'Sim, seed / Série A ou superior'
    | 'Em negociação ativa agora';
    produtoEmNomeDe?:
    | 'Da empresa (CNPJ)'
    | 'De um dos fundadores (CPF)'
    | 'Não está formalizado'
    | 'Em nome de empresa anterior';
    cofundadorTecnico?:
    | 'Sim, vesting assinado com cliff'
    | 'Sim, mas sem cliff definido'
    | 'Não, apenas acordo verbal'
    | 'Não há co-fundador técnico';
    instrumentoCaptacao?:
    | 'SAFE (Simple Agreement for Future Equity)'
    | 'CCA (Contrato de Mútuo Conversível)'
    | 'Debênture conversível'
    | 'Equity direto (sem instrumento conversível)'
    | 'Não sei qual é mais adequado';

    // Etapa 4 – Urgência e Contexto
    urgenciaCaso:
    | 'Crítica — operação, assinatura ou prazo em menos de 7 dias'
    | 'Alta — prazo em até 30 dias'
    | 'Média — planejamento nos próximos 3 meses'
    | 'Normal — exploração e diagnóstico inicial';
    descricaoUrgencia?: string; // obrigatório se Crítica ou Alta
    dataEventoCritico?: string; // condicional se data ou evento crítico = Sim
    consultouOutroEscritorio?:
    | 'Não — primeira consulta'
    | 'Sim, busco segunda opinião'
    | 'Sim, tenho proposta em mãos';
    comoSoubeDoEscritorio:
    | 'Indicação de cliente ou parceiro'
    | 'Indicação de contador / consultor / aceleradora'
    | 'LinkedIn / Instagram'
    | 'Google'
    | 'Evento, conferência ou comunidade de negócios'
    | 'Outro';
    observacoesAdicionais?: string;

    // Etapa 5 – Revisão e Envio
    contatoPreferencia: 'WhatsApp' | 'E-mail' | 'Videoconferência';
    melhorHorario: 'Manhã' | 'Tarde' | 'Noite';
    aceitaLGPD: boolean;
}
