'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft, ShieldCheck, Target, TrendingUp, FileText, Globe } from 'lucide-react';
import { LegalGrowthFormData } from '@/types/legalGrowthForm';

export default function Step3({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch } = useFormContext<LegalGrowthFormData>();
    const objetivo = watch('objetivo_principal');

    const goals = [
        { id: 'abertura_empresa', icon: Target, label: 'Abertura / Regularização', desc: 'Sair do CPF para o CNPJ com segurança.' },
        { id: 'reduzir_impostos', icon: TrendingUp, label: 'Redução de Imposto', desc: 'Estratégias de elisão fiscal permitidas.' },
        { id: 'contratos_seguros', icon: FileText, label: 'Contratos Segmentados', desc: 'Coprodução, agência e prestações de serviço.' },
        { id: 'proteger_ip', icon: ShieldCheck, label: 'Registro de Marcas (IP)', desc: 'Proteger seu nome e conteúdo contra plágio.' },
        { id: 'escala_exterior', icon: Globe, label: 'Escala Offshore / Exterior', desc: 'Expandir vendas para outros países.' }
    ];

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Qual seu foco <span className="accent-text">Principal?</span></h2>
            <p className="form-description">Selecione o objetivo que mais faz sentido para o seu momento de escala atual.</p>

            <div className="option-grid">
                {goals.map((goal) => {
                    const Icon = goal.icon;
                    return (
                        <label key={goal.id} className={`option-card ${objetivo === goal.id ? 'selected' : ''}`} style={{ padding: '1.25rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <input type="radio" value={goal.id} {...register('objetivo_principal', { required: true })} />
                            <div className="option-indicator" style={{ marginTop: '4px' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <Icon size={18} className="accent-text" />
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{goal.label}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>{goal.desc}</p>
                            </div>
                        </label>
                    );
                })}
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={20} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary" disabled={!objetivo}>
                    Finalizar <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
