'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronLeft, Check, Loader2, ShieldCheck, Zap } from 'lucide-react';
import { LegalGrowthFormData } from '@/types/legalGrowthForm';

export default function Step4({ onPrev, isSubmitting }: { onPrev: () => void, isSubmitting: boolean }) {
    const { register, watch } = useFormContext<LegalGrowthFormData>();
    const urgencia = watch('urgencia');
    const aceite = watch('lgpd_consent');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Últimos <span className="accent-text">Detalhes</span></h2>

            <div className="form-group">
                <label className="form-label">Quão rápido precisa desta solução?</label>
                <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {[
                        { id: 'critica', label: 'Imediato (Lançamento próximo)', icon: Zap },
                        { id: 'alta', label: 'Próximos 15 dias', icon: Check },
                        { id: 'media', label: 'Desejo para este mês', icon: Check },
                        { id: 'normal', label: 'Apenas planejamento preventivo', icon: Check }
                    ].map(opt => (
                        <label key={opt.id} className={`option-card ${urgencia === opt.id ? 'selected' : ''}`} style={{ padding: '1rem' }}>
                            <input type="radio" value={opt.id} {...register('urgencia', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2.5rem' }}>
                <label className="form-label">Melhor forma de contato:</label>
                <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['whatsapp', 'email', 'dm'].map(o => (
                        <label key={o} className="option-card" style={{ padding: '0.75rem', justifyContent: 'center' }}>
                            <input type="radio" value={o} {...register('contato_preferencia')} />
                            <div className="option-indicator" style={{ marginRight: '8px' }} />
                            <span style={{ fontSize: '0.875rem', textTransform: 'capitalize' }}>{o}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <textarea
                    className="form-input"
                    rows={3}
                    {...register('observacoes')}
                    placeholder="Mais algum detalhe que precisamos saber antes da reunião?"
                />
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className={`option-card ${aceite ? 'selected' : ''}`} style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <input type="checkbox" {...register('lgpd_consent', { required: true })} />
                    <div className="option-indicator" />
                    <span className="text-xs" style={{ opacity: 0.8 }}>
                        Autorizo o envio dessas informações para diagnóstico jurídico. Os dados serão mantidos em sigilo conforme nosso contrato de confidencialidade padrão.
                    </span>
                </label>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
                    Voltar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !aceite}>
                    {isSubmitting ? (
                        <>Analisando <Loader2 className="animate-spin" size={20} /></>
                    ) : (
                        <>Solicitar Diagnóstico <ShieldCheck size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
