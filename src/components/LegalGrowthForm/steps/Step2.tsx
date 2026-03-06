'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft, BarChart3, Landmark, Tags } from 'lucide-react';
import { LegalGrowthFormData } from '@/types/legalGrowthForm';

export default function Step2({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<LegalGrowthFormData>();
    const faturamento = watch('faturamento_mensal');
    const cnpjStatus = watch('cnpj_status');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Seu <span className="accent-text">Negócio Digital</span></h2>

            <div className="form-group">
                <label className="form-label">Faturamento Mensal (Média 6 meses)</label>
                <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {[
                        { id: 'nao_faturando', label: 'Zero / Iniciando' },
                        { id: 'ate_10k', label: 'Até R$ 10k' },
                        { id: '10k_50k', label: 'R$ 10k - 50k' },
                        { id: '50k_150k', label: 'R$ 50k - 150k' },
                        { id: '150k_500k', label: 'R$ 150k - 500k' },
                        { id: 'acima_500k', label: 'Acima de R$ 500k' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${faturamento === opt.id ? 'selected' : ''}`} style={{ padding: '0.8rem 1rem' }}>
                            <input type="radio" value={opt.id} {...register('faturamento_mensal', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Situação Fiscal / CNPJ</label>
                <div className="option-grid">
                    {[
                        { id: 'pf', label: 'Pessoa Física (CPF)' },
                        { id: 'mei', label: 'MEI (R$ 81k/ano)' },
                        { id: 'me_epp', label: 'ME ou EPP (Simples Nacional)' },
                        { id: 'lucro_presumido', label: 'Lucro Presumido' },
                        { id: 'quer_abrir', label: 'Não tenho empresa, quero abrir' }
                    ].map(opt => (
                        <label key={opt.id} className={`option-card ${cnpjStatus === opt.id ? 'selected' : ''}`}>
                            <input type="radio" value={opt.id} {...register('cnpj_status', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Plataformas que utiliza:</label>
                <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['Hotmart', 'Kiwify', 'Eduzz', 'Perfect Pay', 'Outras'].map(p => (
                        <label key={p} className="option-card" style={{ padding: '0.75rem', justifyContent: 'center' }}>
                            <input type="checkbox" value={p} {...register('plataformas')} />
                            <div className="option-indicator" style={{ marginRight: '8px' }} />
                            <span style={{ fontSize: '0.8rem' }}>{p}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={20} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary" disabled={!faturamento || !cnpjStatus}>
                    Objetivos <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
