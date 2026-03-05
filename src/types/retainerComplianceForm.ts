export interface RetainerComplianceFormData {
    // Etapa 1 – Identificação
    nomeCompleto: string;
    whatsapp: string;
    email: string;
    cidadeEstado: string;
    representa:
    | 'Pessoa Física (patrimônio ou investimentos pessoais)'
    | 'Empresário / Sócio (empresa ativa)'
    | 'Holding ou Grupo Empresarial'
    | 'Fundo ou Veículo de Investimento'
    | 'Empresa com ativos no exterior'
    | 'Empresa cripto / fintech / exchange';
    numeroEmpresasGrupo?: number; // Condicional se representa = Holding ou Grupo
    fundoOfOffshore?: 'Nacional (CVM)' | 'Offshore (exterior)' | 'Ambos'; // Condicional se representa = Fundo
    assessoriaRecorrente:
    | 'Não — contrato pontual apenas quando preciso'
    | 'Sim, advogado interno (in-house)'
    | 'Sim, escritório externo generalista'
    | 'Sim, escritório externo especializado'
    | 'Tive, mas encerrei o contrato';
    motivoEncerramento?:
    | 'Custo não justificado pelo valor entregue'
    | 'Falta de proatividade / só reagia a problemas'
    | 'Escritório sem especialização no meu setor'
    | 'Relacionamento ou comunicação ruins'
    | 'Mudança na estrutura da empresa'
    | 'Outro';

    // Etapa 2 – Necessidades e Perfil de Uso
    frequenciaDemandas:
    | 'Quase diariamente (contratos, decisões, dúvidas)'
    | 'Semanalmente'
    | 'Mensalmente'
    | 'Raramente — só em crises';
    areasDemandas: string[]; // múltipla escolha list of areas
    maiorRiscoJuridico: string; // texto livre
    faturamentoAnual:
    | 'Até R$ 1 mi/ano'
    | 'R$ 1 mi – R$ 5 mi/ano'
    | 'R$ 5 mi – R$ 20 mi/ano'
    | 'R$ 20 mi – R$ 100 mi/ano'
    | 'Acima de R$ 100 mi/ano';

    // Etapa 3 – Módulo de Serviço
    servicoPrioritario:
    | 'Retainer Empresarial (consultoria mensal contínua)'
    | 'Compliance Offshore Anual'
    | 'Compliance Cripto Recorrente'
    | 'Governança Patrimonial Contínua';

    // Módulo 7.1 – Retainer Empresarial
    entregasRetainer?: string[]; // múltipla escolha
    numeroConsultasJuridicas?: string; // dropdown description
    canaisPreferidos?: string[]; // múltipla escolha
    demandaImediataPrimeiroMes?: 'Sim — tenho urgência específica' | 'Não — quero estruturar do zero' | 'Sim, várias demandas acumuladas';
    descricaoDemandaImediata?: string; // campo descritivo condicional
    periodicidadeRelatorio?: 'Mensal' | 'Trimestral' | 'Semestral' | 'Sob demanda / só quando necessário';

    // Módulo 7.2 – Compliance Offshore Anual
    jurisdiçõesOffshore?: string[]; // múltipla escolha
    numeroEntidadesOffshore?: number;
    obrigacoesOffshore?: string[]; // múltipla escolha
    contaBancariaExterior?:
    | 'Sim, em banco tradicional'
    | 'Sim, em fintech (Wise, Payoneer, Revolut)'
    | 'Não'
    | 'Sim, mas está com restrições ou solicitação de documentos pendente';
    socioBeneficiarioEstrangeiro?: boolean;
    distribuicaoLucros?:
    | 'Sim, regularmente'
    | 'Sim, esporadicamente'
    | 'Não'
    | 'Não sei como fazer corretamente';

    // Módulo 7.3 – Compliance Cripto Recorrente
    operacoesCripto?: string[]; // múltipla escolha
    registroVASP?: 'Sim, registro ativo' | 'Não, ainda sem registro' | 'Em processo de regularização';
    politicaPLD?:
    | 'Sim, atualizada ao Marco Cripto 2022'
    | 'Sim, mas anterior ao Marco Cripto'
    | 'Não possui'
    | 'Em elaboração';
    frequenciaRevisaoCompliance?: 'Mensal' | 'Trimestral' | 'Anual' | 'Nunca realizei revisão formal';
    volumeMensalTransacoes?:
    | 'Até R$ 500 mil/mês'
    | 'R$ 500 mil – R$ 5 mi/mês'
    | 'R$ 5 mi – R$ 50 mi/mês'
    | 'Acima de R$ 50 mi/mês';
    comunicacaoOrgaos?:
    | 'Não'
    | 'Sim, solicitação de informações'
    | 'Sim, processo administrativo'
    | 'Sim, investigação em andamento';

    // Módulo 7.4 – Governança Patrimonial Contínua
    estruturaPatrimonial?: string[]; // múltipla escolha
    obrigacoesSocietarias?: string[]; // múltipla escolha
    frequenciaReunioesSocios?: 'Mensalmente' | 'Trimestralmente' | 'Anualmente' | 'Nunca houve reunião formal registrada';
    controlePatrimonial?:
    | 'Sim, sistema profissional'
    | 'Sim, planilha própria'
    | 'Não — controlo informalmente'
    | 'Não tenho controle organizado';
    numeroMembrosFamilia?: number;
    herdeirosMenores?: boolean;
    planejamentoSocios?:
    | 'Sim, entrada prevista'
    | 'Sim, saída prevista'
    | 'Sim, ambos'
    | 'Não por enquanto';

    // Etapa 4 — Expectativas e Fit Comercial
    motivosEncerrarRetainer?: string[]; // múltipla escolha
    maiorValorRetainer?:
    | 'Segurança para tomar decisões sem medo'
    | 'Redução de custos com demandas avulsas'
    | 'Compliance sem me preocupar com prazos'
    | 'Ter alguém que conhece profundamente minha estrutura'
    | 'Relatório e visibilidade dos riscos do negócio';
    faixaInvestimentoMensal:
    | 'Até R$ 2 mil/mês'
    | 'R$ 2 mil – R$ 5 mil/mês'
    | 'R$ 5 mil – R$ 15 mil/mês'
    | 'R$ 15 mil – R$ 50 mil/mês'
    | 'Acima de R$ 50 mil/mês'
    | 'Prefiro receber uma proposta antes de opinar';
    prazoMinimoRetainer:
    | 'Mensal (sem fidelidade)'
    | 'Trimestral'
    | 'Semestral'
    | 'Anual (com desconto)'
    | 'Quero analisar a proposta antes de decidir';

    // Etapa 5 — Urgência e Contexto
    urgenciaInicioRetainer:
    | 'Imediata — tenho demanda ativa hoje'
    | 'Curto prazo — próximas 2 semanas'
    | 'Médio prazo — próximo mês'
    | 'Estou pesquisando / sem urgência';
    demandaUrgente?: boolean;
    descricaoDemandaUrgente?: string;

    // Etapa 6 — Revisão e Envio
    comoSoubeDoEscritorio:
    | 'Indicação de cliente do escritório'
    | 'Indicação de contador / parceiro'
    | 'LinkedIn / Instagram'
    | 'Google'
    | 'Evento ou conferência'
    | 'Já fui cliente em serviço pontual'
    | 'Outro';
    observacoesAdicionais?: string;

    // Campos finais
    contatoPreferencia: 'WhatsApp' | 'E-mail' | 'Videoconferência';
    melhorHorario: 'Manhã' | 'Tarde' | 'Noite';
    aceitaLGPD: boolean;
}
