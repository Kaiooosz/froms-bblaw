export interface StrategicLitigationFormData {
    // Etapa 1 – Identificação
    nomeCompleto: string;
    whatsapp: string;
    email: string;
    cidadeEstado: string;
    representa: 'Pessoa Física' | 'Empresa / Pessoa Jurídica' | 'Sócio em conflito com outros sócios' | 'Herdeiro em litígio' | 'Vítima de crime econômico (cliente lesado)' | 'Réu / Investigado em processo criminal';
    cnpjEmpresa?: string; // Condicional se representa = Empresa ou Sócio
    advogadoAtual: 'Não, ainda sem advogado' | 'Sim, mas quero trocar' | 'Sim, quero uma segunda opinião' | 'Sim, preciso de apoio especializado pontual';

    // Etapa 2 – Natureza do Caso
    naturezaCaso: 'Litígio Empresarial' | 'Defesa em Crimes Econômicos' | 'Medida Cautelar Urgente' | 'Arbitragem Internacional' | 'Litígio Envolvendo Cripto ou Ativos Digitais';

    // Campos específicos de Litígio Empresarial (Módulo 5.1)
    tipoLitigioEmpresarial?:
    | 'Disputa societária (conflito entre sócios)'
    | 'Exclusão de sócio'
    | 'Dissolução parcial ou total de sociedade'
    | 'Apuração de haveres'
    | 'Execução de título (cobrança de dívida)'
    | 'Defesa em execução (estou sendo executado)'
    | 'Inadimplemento contratual'
    | 'Concorrência desleal ou quebra de NDA';
    numeroSociosEnvolvidos?: number;
    conflitoFormalizado?: 'Não, ainda na fase extrajudicial' | 'Sim, processo em andamento' | 'Sim, com liminar ou tutela já concedida' | 'Sim, em fase de execução de sentença';
    acordoSocios?:
    | 'Sim, com cláusula de arbitragem'
    | 'Sim, sem cláusula de arbitragem'
    | 'Não existe acordo de sócios'
    | 'Não sei';
    valorDebitoExecucao?: 'Até R$ 50 mil' | 'R$ 50 mil – R$ 500 mil' | 'R$ 500 mil – R$ 5 mi' | 'Acima de R$ 5 mi';
    bensPenhorados?: 'Sim' | 'Não' | 'Em risco iminente';

    // Campos específicos de Defesa em Crimes Econômicos (Módulo 5.2)
    naturezaCrime?: string[]; // múltipla escolha
    faseCaso?:
    | 'Investigação preliminar (inquérito policial)'
    | 'Investigação do Ministério Público (PGJ / GAECO)'
    | 'Já foi denunciado (réu em ação penal)'
    | 'Condenado em 1ª instância (recursos pendentes)'
    | 'Preso ou com prisão preventiva decretada'
    | 'Ainda não fui notificado — me precavendo';
    numeroProcessoCriminal?: string;
    bloqueioBens?: 'Não' | 'Sim, bloqueio judicial (BACEN JUD / Renajud)' | 'Sim, sequestro ou arresto de bens' | 'Sim, indisponibilidade de bens';
    envolvePessoaJuridica?: boolean;
    outrosInvestigados?: 'Sim' | 'Não' | 'Não sei';
    prestouDepoimento?: 'Não' | 'Sim, como testemunha' | 'Sim, como investigado / indiciado' | 'Sim, e assinou termo sem advogado presente';

    // Campos específicos de Medidas Cautelares (Módulo 5.3)
    tipoMedida?: string[]; // múltipla escolha
    medidaExecutada?: 'Já executada (bens bloqueados / penhorados)' | 'Decisão proferida, ainda não cumprida' | 'Receio fundado — quero me proteger preventivamente';
    origemMedida?:
    | 'Execução cível (dívida)'
    | 'Execução fiscal (Receita Federal / PGFN)'
    | 'Processo criminal'
    | 'Ação de improbidade administrativa'
    | 'Ação de família (divórcio / partilha)'
    | 'Não sei a origem exata';
    valorRisco?: 'Até R$ 100 mil' | 'R$ 100 mil – R$ 500 mil' | 'R$ 500 mil – R$ 5 mi' | 'Acima de R$ 5 mi';
    bensEssenciais?: 'Sim' | 'Não' | 'Parcialmente';

    // Campos específicos de Arbitragem Internacional (Módulo 5.4)
    naturezaConflitoArbitragem:
    | 'Contrato comercial internacional'
    | 'Contrato de investimento / M&A'
    | 'Contrato de franquia ou licenciamento internacional'
    | 'Contrato de joint venture ou sociedade'
    | 'Disputa de propriedade intelectual internacional'
    | 'Contrato de construção ou infraestrutura'
    | 'Outro contrato com cláusula compromissória';
    possuiClausulaArbitragem: 'Sim, com câmara definida' | 'Sim, sem câmara definida' | 'Não possui — quero inserir' | 'Não sei';
    camaraArbitragem?:
    | 'ICC — Câmara de Comércio Internacional'
    | 'ICSID — Banco Mundial'
    | 'AAA / ICDR — Arbitragem americana'
    | 'LCIA — Londres'
    | 'CAM-CCBC — Brasil'
    | 'Outra câmara'
    | 'Não especificada';
    paisOutraParte?: string;
    valorDisputaUSD?: 'Até USD 500 mil' | 'USD 500 mil – USD 5 mi' | 'USD 5 mi – USD 50 mi' | 'Acima de USD 50 mi';
    idiomaContrato?: 'Português' | 'Inglês' | 'Espanhol' | 'Outro';
    procedimentoArbitragem?:
    | 'Não'
    | 'Sim, pedido de arbitragem já protocolado'
    | 'Sim, árbitros já nomeados'
    | 'Sim, audiências em andamento';

    // Campos específicos de Litígios Cripto (Módulo 5.5)
    naturezaLitigioCripto:
    | 'Fraude ou golpe (investimento, pirâmide, scam)'
    | 'Exchange que não devolveu ativos (falência, bloqueio, encerramento)'
    | 'Disputa de titularidade de carteira / wallet'
    | 'Hack ou acesso não autorizado'
    | 'Inadimplemento de contrato cripto (OTC, DeFi)'
    | 'Disputa societária em empresa cripto'
    | 'Defesa em investigação envolvendo cripto'
    | 'NFT: disputa de autoria, venda ou royalties';
    valorAtivosDisputa?: 'Até R$ 50 mil' | 'R$ 50 mil – R$ 500 mil' | 'R$ 500 mil – R$ 5 mi' | 'Acima de R$ 5 mi';
    comprovantesTransacoes?:
    | 'Sim, todos (extratos, TXIDs, prints)'
    | 'Sim, parcialmente'
    | 'Não — perdi acesso'
    | 'Nunca recebi comprovantes';
    plataformaEnvolvida?:
    | 'Nacional (Mercado Bitcoin, Foxbit, NovaDAX)'
    | 'Internacional (Binance, Coinbase, Kraken etc.)'
    | 'P2P / Sem plataforma formal'
    | 'Protocolo DeFi (smart contract)'
    | 'Não sei identificar';
    boletimOcorrencia?: 'Sim' | 'Não' | 'Não sabia que podia';

    // Etapa 3 – Histórico e Contexto
    tempoConflito:
    | 'Menos de 30 dias'
    | '1 a 6 meses'
    | '6 meses a 2 anos'
    | 'Mais de 2 anos';
    tentativaAcordoExtrajudicial:
    | 'Não'
    | 'Sim, sem sucesso'
    | 'Sim, acordo feito mas descumprido';
    envolvimentoInternacional?: boolean;
    riscoFugaAtivos?: 'Sim, risco imediato' | 'Suspeito que sim' | 'Não';

    // Etapa 4 – Urgência e Avaliação
    urgenciaCaso:
    | 'Crítica — preso, bloqueio ativo ou prazo processual imediato'
    | 'Alta — decisão proferida ou prazo em até 15 dias'
    | 'Média — processo em andamento sem urgência imediata'
    | 'Normal — fase inicial / exploração';
    prazoProcessualProximo?: boolean;
    descricaoPrazo?: string;
    comoSoube?:
    | 'Indicação de cliente'
    | 'Indicação de advogado parceiro'
    | 'LinkedIn / Instagram'
    | 'Google'
    | 'Evento ou congresso jurídico'
    | 'Outro';
    observacoesAdicionais?: string;

    // Etapa 5 – Revisão e Envio
    contatoPreferencia: 'WhatsApp' | 'E-mail' | 'Ligação';
    melhorHorario: 'Manhã' | 'Tarde' | 'Noite';
    aceitaLGPD: boolean;
}
