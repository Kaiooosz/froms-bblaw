export type OffshoreFormData = {
    // Step 1
    relacao_empresa: 'proprietario' | 'socio' | 'diretor';
    whatsapp: string;

    // Step 2
    participacao?: number;
    socio_responsavel?: 'sim' | 'nao';

    // Step 3
    empresa_opcao1: string;
    empresa_opcao2?: string;
    empresa_opcao3?: string;
    jurisdicao: string;
    jurisdicao_outra?: string;
    imoveis_brasil: 'sim' | 'nao';
    uso_empresa: string[];
    uso_empresa_outro?: string;
    atividade_empresa: string;
    conta_bancaria: 'nao' | 'simples' | 'cripto';
    ativos_texto: string;
    diretor_tipo: 'proprio' | 'nominativo';
    herdeiros: 'sim' | 'nao' | 'talvez';
    origem_fundos: string[];
    origem_fundos_outro?: string;
    doc_origem_fundos?: FileList;

    // Step 4
    nome_completo_pessoal: string;
    data_nascimento: string;
    genero?: string;
    estado_civil?: string;
    endereco: string;
    passaporte: string;
    cidade_nascimento: string;
    telefone: string;
    email: string;
    residencia_fiscal: string;
    cpf_nit: string;
    ocupacao: 'empresario' | 'funcionario';
    cnpj?: string;
    empresa_trabalha?: string;
    funcao?: string;
    atividade_empresa_trabalha?: string;
    socio_porcentagem?: string;
    pep: 'sim' | 'nao';
    residencia_eua: 'sim' | 'nao';
    doc_endereco?: FileList;
    doc_passaporte?: FileList;
    doc_banco?: FileList;
    declaracao_aceite: boolean;
};
