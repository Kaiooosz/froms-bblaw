'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { StrategicLegalFormData } from '@/types/strategicLegalForm';

export default function Step2({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<StrategicLegalFormData>();
    const setor = watch('setorAtuacao');
    const faturamento = watch('faturamentoAnual');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Contexto <span className="accent-text">Empresarial</span></h2>

            <div className="form-group">
                <label className="form-label">Setor de Atuação:</label>
                <select className="form-input" {...register('setorAtuacao', { required: true })}>
                    <option value="">Selecione...</option>
                    <option value="Tecnologia / SaaS / Software">Tecnologia / SaaS / Software</option>
                    <option value="E-commerce / Varejo digital">E-commerce / Varejo digital</option>
                    <option value="Saúde e bem-estar">Saúde e bem-estar</option>
                    <option value="Serviços profissionais">Serviços profissionais</option>
                    <option value="Indústria e manufatura">Indústria e manufatura</option>
                    <option value="Agronegócio">Agronegócio</option>
                    <option value="Financeiro / Fintech">Financeiro / Fintech</option>
                    <option value="Outro">Outro</option>
                </select>
            </div>

            <div className="form-group">
                <label className="form-label">Faturamento Anual Estimado:</label>
                <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {[
                        'Até R$ 500 mil/ano',
                        'R$ 500 mil – R$ 3 mi/ano',
                        'R$ 3 mi – R$ 15 mi/ano',
                        'Acima de R$ 15 mi/ano'
                    ].map(o => (
                        <label key={o} className={`option-card ${faturamento === o ? 'selected' : ''}`} style={{ padding: '0.8rem' }}>
                            <input type="radio" value={o} {...register('faturamentoAnual', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.85rem' }}>{o}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Áreas de Maior Demanda (Múltipla):</label>
                <div className="option-grid">
                    {[
                        'Contratos Nacionais/Internacionais',
                        'Acordos Societários / Vesting',
                        'Tributário (Recuperação e Planejamento)',
                        'M&A (Venda ou Fusão)',
                        'Compliance / LGPD',
                        'Trabalhista Estratégico'
                    ].map(p => (
                        <label key={p} className="option-card" style={{ padding: '0.75rem' }}>
                            <input type="checkbox" value={p} {...register('areasDemanda')} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.8rem' }}>{p}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={20} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary" disabled={!setor || !faturamento}>
                    Finalizar <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
