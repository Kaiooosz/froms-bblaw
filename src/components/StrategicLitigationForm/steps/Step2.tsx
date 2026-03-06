'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Gavel, ShieldAlert, AlertCircle, Scale, Bitcoin } from 'lucide-react';
import { StrategicLitigationFormData } from '@/types/strategicLitigationForm';

export default function Step2({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<StrategicLitigationFormData>();
    const naturezaCaso = watch('naturezaCaso');

    const cards = [
        { id: 'Litígio Empresarial', icon: Scale, label: 'Litígio Empresarial', desc: 'Disputas societárias, exclusão de sócios e quebra de contrato.' },
        { id: 'Defesa em Crimes Econômicos', icon: ShieldAlert, label: 'Defesa Criminal', desc: 'Crimes de colarinho branco, lavagem e investigações.' },
        { id: 'Medida Cautelar Urgente', icon: AlertCircle, label: 'Cautelar Urgente', desc: 'Bloqueios, arresto de bens e medidas liminares.' },
        { id: 'Arbitragem Internacional', icon: Gavel, label: 'Arbitragem', desc: 'Conflitos cross-border regidos por câmaras arbitrais.' },
        { id: 'Litígio Envolvendo Cripto ou Ativos Digitais', icon: Bitcoin, label: 'Cripto & Ativos', desc: 'Golpes, falência de exchanges e disputas DeFi.' }
    ];

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Natureza do <span className="accent-text">Caso</span></h2>
            <p className="form-description">Selecione a área principal do seu litígio para que possamos ativar o módulo específico.</p>

            <div className="option-grid">
                {cards.map((card) => {
                    const Icon = card.icon;
                    return (
                        <label key={card.id} className={`option-card ${naturezaCaso === card.id ? 'selected' : ''}`} style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                            <input type="radio" value={card.id} {...register('naturezaCaso', { required: true })} />
                            <div className="option-indicator" style={{ marginTop: '4px' }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <Icon size={18} className="accent-text" />
                                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{card.label}</span>
                                </div>
                                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>{card.desc}</p>
                            </div>
                        </label>
                    );
                })}
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={20} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary" disabled={!naturezaCaso}>
                    Detalhar Caso <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
