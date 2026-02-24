'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Building2, MapPin, Target, Wallet, Users } from 'lucide-react';
import { OffshoreFormData } from '@/types/form';

export default function Step3({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch } = useFormContext<OffshoreFormData>();

    const jurisdicao = watch('jurisdicao');
    const imoveis = watch('imoveis_brasil');
    const conta = watch('conta_bancaria');
    const diretor = watch('diretor_tipo');
    const herdeiros = watch('herdeiros');
    const usoEmpresa = watch('uso_empresa') || [];
    const origemFundos = watch('origem_fundos') || [];

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Estrutura da <span className="accent-text">Nova Empresa</span></h2>

            <div className="form-group">
                <label className="form-label">Sugestões de Nome (em ordem de preferência)</label>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input type="text" placeholder="1ª Opção de Nome" className="form-input" {...register('empresa_opcao1', { required: true })} />
                    </div>
                    <input type="text" placeholder="2ª Opção de Nome" className="form-input" {...register('empresa_opcao2')} />
                    <input type="text" placeholder="3ª Opção de Nome" className="form-input" {...register('empresa_opcao3')} />
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="jurisdicao" className="form-label">Jurisdição de Preferência</label>
                <div style={{ position: 'relative' }}>
                    <select id="jurisdicao" className="form-input" {...register('jurisdicao')} style={{ appearance: 'none' }}>
                        {['Névis', 'BVI', 'Bahamas', 'Panamá', 'São Vicente e Granadinas', 'Ilhas Cayman', 'Seychelles', 'Outra'].map(j => (
                            <option key={j} value={j}>{j}</option>
                        ))}
                    </select>
                    <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>
                        ▼
                    </div>
                </div>
                {jurisdicao === 'Outra' && (
                    <input type="text" placeholder="Especifique a jurisdição..." className="form-input mt-4 animate-fade-in-up" {...register('jurisdicao_outra')} />
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Pretende possuir imóveis no Brasil via Offshore?</label>
                <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {['sim', 'nao'].map((opt) => (
                        <label key={opt} className={`option-card ${imoveis === opt ? 'selected' : ''}`}>
                            <input type="radio" value={opt} {...register('imoveis_brasil')} />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600 }}>{opt === 'sim' ? 'Sim, pretendo' : 'Não'}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Finalidade da nova estrutura</label>
                <div className="option-grid" style={{ gap: '0.75rem' }}>
                    {[
                        { id: 'plataforma_internacional', label: 'Recebimento de faturamento internacional (USD/EUR)' },
                        { id: 'proteger_ativos', label: 'Blindagem Patrimonial e Sucessória' },
                        { id: 'facilitar_investimentos', label: 'Investimentos em ativos globais' },
                        { id: 'centralizar_faturamento', label: 'Holding de múltiplos negócios' },
                        { id: 'outro', label: 'Outro objetivo específico' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${usoEmpresa.includes(opt.id) ? 'selected' : ''}`} style={{ padding: '1rem 1.5rem' }}>
                            <input type="checkbox" value={opt.id} {...register('uso_empresa')} />
                            <div className="option-indicator" />
                            <span className="text-sm" style={{ fontWeight: 500 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
                {usoEmpresa.includes('outro') && (
                    <input type="text" placeholder="Descreva sua finalidade..." className="form-input mt-4 animate-fade-in-up" {...register('uso_empresa_outro')} />
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Origem dos Fundos</label>
                <div className="option-grid" style={{ gap: '0.75rem' }}>
                    {[
                        { id: 'salario', label: 'Salário / Bônus ou Pró-labore' },
                        { id: 'lucros', label: 'Lucros e Dividendos' },
                        { id: 'venda', label: 'Venda de Imóveis ou Empresas' },
                        { id: 'heranca', label: 'Herança ou Doação' },
                        { id: 'cripto', label: 'Mercado Cripto / Ativos Digitais' },
                        { id: 'outro', label: 'Outra Origem' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${origemFundos.includes(opt.id) ? 'selected' : ''}`} style={{ padding: '1rem 1.5rem' }}>
                            <input type="checkbox" value={opt.id} {...register('origem_fundos')} />
                            <div className="option-indicator" />
                            <span className="text-sm" style={{ fontWeight: 500 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
                {origemFundos.includes('outro') && (
                    <input type="text" placeholder="Descreva a origem detalhadamente..." className="form-input mt-4 animate-fade-in-up" {...register('origem_fundos_outro')} />
                )}
            </div>

            <div className="form-group">
                <label className="form-label">Qual o tipo de conta bancária necessária?</label>
                <div className="option-grid">
                    {[
                        { id: 'simples', label: 'Conta Tradicional (Operações Comerciais)' },
                        { id: 'cripto', label: 'Conta Crypto-Friendly / Tech-Focused' },
                        { id: 'nao', label: 'Apenas custódia de ativos (sem conta ativa)' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${conta === opt.id ? 'selected' : ''}`}>
                            <input type="radio" value={opt.id} {...register('conta_bancaria')} />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={20} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Configurar Pessoal <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
