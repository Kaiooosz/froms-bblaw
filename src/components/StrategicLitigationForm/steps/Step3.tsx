'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { StrategicLitigationFormData } from '@/types/strategicLitigationForm';

export default function Step3({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch } = useFormContext<StrategicLitigationFormData>();
    const naturezaCaso = watch('naturezaCaso');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Detalhamento <span className="accent-text">Estratégico</span></h2>

            {/* Módulo Societário */}
            {naturezaCaso === 'Litígio Empresarial' && (
                <div className="animate-fade-in-up">
                    <div className="form-group">
                        <label className="form-label">Tipo de Conflito Societário</label>
                        <select className="form-input" {...register('tipoLitigioEmpresarial')}>
                            <option value="Disputa societária (conflito entre sócios)">Disputa societária</option>
                            <option value="Exclusão de sócio">Exclusão de sócio</option>
                            <option value="Dissolução parcial ou total de sociedade">Dissolução de sociedade</option>
                            <option value="Apuração de haveres">Apuração de haveres</option>
                            <option value="Execução de título (cobrança de dívida)">Execução de título</option>
                            <option value="Inadimplemento contratual">Inadimplemento contratual</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Situação do Conflito</label>
                        <div className="option-grid">
                            {['Não, ainda na fase extrajudicial', 'Sim, processo em andamento'].map(o => (
                                <label key={o} className="option-card">
                                    <input type="radio" value={o} {...register('conflitoFormalizado')} />
                                    <div className="option-indicator" />
                                    <span>{o}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Módulo Criminal */}
            {naturezaCaso === 'Defesa em Crimes Econômicos' && (
                <div className="animate-fade-in-up">
                    <div className="form-group">
                        <label className="form-label">Fase da Investigação/Processo</label>
                        <div className="option-grid">
                            {['Investigação preliminar', 'Já foi denunciado (réu)', 'Condenado em 1ª instância'].map(o => (
                                <label key={o} className="option-card">
                                    <input type="radio" value={o} {...register('faseCaso')} />
                                    <div className="option-indicator" />
                                    <span>{o}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="sigilo-box" style={{ background: 'rgba(255,100,100,0.1)', borderColor: 'rgba(255,100,100,0.2)' }}>
                        <Info size={20} color="#ff3b30" />
                        <p style={{ color: '#ff3b30', fontSize: '0.875rem' }}>Atenção: Se houver prisão preventiva ou busca e apreensão, utilize o botão de urgência no próximo passo.</p>
                    </div>
                </div>
            )}

            {/* Cripto */}
            {naturezaCaso === 'Litígio Envolvendo Cripto ou Ativos Digitais' && (
                <div className="animate-fade-in-up">
                    <div className="form-group">
                        <label className="form-label">Natureza do Litígio Cripto</label>
                        <select className="form-input" {...register('naturezaLitigioCripto')}>
                            <option value="Fraude ou golpe (investimento, pirâmide, scam)">Fraude / Golpe / Pirâmide</option>
                            <option value="Exchange que não devolveu ativos">Bloqueio em Exchange</option>
                            <option value="Hack ou acesso não autorizado">Hack / Invasão</option>
                            <option value="Inadimplemento de contrato cripto (OTC, DeFi)">Contrato OTC / DeFi</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Generic placeholder for others or fallback */}
            {!['Litígio Empresarial', 'Defesa em Crimes Econômicos', 'Litígio Envolvendo Cripto ou Ativos Digitais'].includes(naturezaCaso || '') && (
                <div className="form-group">
                    <label className="form-label">Descrição Breve do Caso</label>
                    <textarea className="form-input" rows={4} {...register('observacoesAdicionais')} placeholder="Explique resumidamente os fatos principais..." />
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Tempo do Conflito</label>
                <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {['Menos de 30 dias', '1 a 6 meses', '6 meses a 2 anos', 'Mais de 2 anos'].map(o => (
                        <label key={o} className="option-card" style={{ padding: '1rem' }}>
                            <input type="radio" value={o} {...register('tempoConflito')} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.875rem' }}>{o}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={20} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Avaliar Urgência <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
