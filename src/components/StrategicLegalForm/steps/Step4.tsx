'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronLeft, Loader2, ShieldCheck, Clock } from 'lucide-react';
import { StrategicLegalFormData } from '@/types/strategicLegalForm';

export default function Step4({ onPrev, isSubmitting }: { onPrev: () => void, isSubmitting: boolean }) {
    const { register, watch } = useFormContext<StrategicLegalFormData>();
    const urgencia = watch('urgenciaCaso');
    const aceite = watch('aceitaLGPD');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Fechamento do <span className="accent-text">Diagnóstico</span></h2>

            <div className="form-group">
                <label className="form-label">Qual o nível de urgência?</label>
                <div className="option-grid">
                    {[
                        { id: 'Crítica — operação, assinatura ou prazo em menos de 7 dias', label: 'CRÍTICA (Assinatura ou Prazo Próximo)' },
                        { id: 'Média — planejamento nos próximos 3 meses', label: 'MÉDIA (Planejamento Estratégico)' },
                        { id: 'Normal — exploração e diagnóstico inicial', label: 'NORMAL (Apenas Consulta)' }
                    ].map(opt => (
                        <label key={opt.id} className={`option-card ${urgencia === opt.id ? 'selected' : ''}`} style={{ padding: '1rem' }}>
                            <input type="radio" value={opt.id} {...register('urgenciaCaso', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2.5rem' }}>
                <label className="form-label">Preferência de Contato:</label>
                <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['WhatsApp', 'E-mail', 'Videoconferência'].map(o => (
                        <label key={o} className="option-card" style={{ padding: '0.75rem', justifyContent: 'center' }}>
                            <input type="radio" value={o} {...register('contatoPreferencia')} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.875rem' }}>{o}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <textarea
                    className="form-input"
                    rows={3}
                    {...register('observacoesAdicionais')}
                    placeholder="Descreva brevemente o seu maior desafio jurídico hoje..."
                />
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className={`option-card ${aceite ? 'selected' : ''}`} style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <input type="checkbox" {...register('aceitaLGPD', { required: true })} />
                    <div className="option-indicator" />
                    <span className="text-xs" style={{ opacity: 0.8 }}>
                        Autorizo a análise jurídica das informações enviadas. O sigilo será preservado conforme as normas da OAB.
                    </span>
                </label>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
                    Voltar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !aceite}>
                    {isSubmitting ? (
                        <>Processando <Loader2 className="animate-spin" size={20} /></>
                    ) : (
                        <>Solicitar Assessoria <ShieldCheck size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
