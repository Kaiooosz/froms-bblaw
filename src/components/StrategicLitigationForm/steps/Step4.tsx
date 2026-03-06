'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronLeft, Check, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { StrategicLitigationFormData } from '@/types/strategicLitigationForm';

export default function Step4({ onPrev, isSubmitting }: { onPrev: () => void, isSubmitting: boolean }) {
    const { register, watch, formState: { errors } } = useFormContext<StrategicLitigationFormData>();
    const urgencia = watch('urgenciaCaso');
    const aceite = watch('aceitaLGPD');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Urgência e <span className="accent-text">Fechamento</span></h2>

            <div className="form-group">
                <label className="form-label">Qual o nível de urgência do seu caso?</label>
                <div className="option-grid">
                    {[
                        { id: 'Crítica — preso, bloqueio ativo ou prazo processual imediato', label: 'CRÍTICA', desc: 'Prazo em menos de 48h ou risco à liberdade/patrimônio imediato.' },
                        { id: 'Alta — decisão proferida ou prazo em até 15 dias', label: 'ALTA', desc: 'Processo com movimentação recente ou prazo curto.' },
                        { id: 'Média — processo em andamento sem urgência imediata', label: 'MÉDIA', desc: 'Acompanhamento estratégico ou segunda opinião.' },
                        { id: 'Normal — fase inicial / exploração', label: 'NORMAL', desc: 'Análise preventiva ou planejamento de ação.' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${urgencia === opt.id ? 'selected' : ''}`} style={{ padding: '1.25rem' }}>
                            <input type="radio" value={opt.id} {...register('urgenciaCaso', { required: true })} />
                            <div className="option-indicator" />
                            <div>
                                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: opt.label === 'CRÍTICA' ? '#ff3b30' : 'inherit' }}>{opt.label}</span>
                                <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>{opt.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {(urgencia?.includes('Crítica') || urgencia?.includes('Alta')) && (
                <div className="form-group animate-fade-in-up">
                    <label className="form-label">Descreva o evento crítico ou prazo:</label>
                    <textarea
                        className="form-input"
                        rows={3}
                        {...register('descricaoPrazo')}
                        placeholder="Ex: Prazo para recurso vence amanhã; Bens bloqueados hoje pelo BACEN..."
                    />
                </div>
            )}

            <div className="form-group" style={{ marginTop: '3rem' }}>
                <label className="form-label">Preferência de Primeiro Contato</label>
                <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['WhatsApp', 'E-mail', 'Ligação'].map(o => (
                        <label key={o} className="option-card" style={{ padding: '1rem', justifyContent: 'center' }}>
                            <input type="radio" value={o} {...register('contatoPreferencia')} />
                            <div className="option-indicator" style={{ marginRight: '8px' }} />
                            <span style={{ fontSize: '0.875rem' }}>{o}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className={`option-card ${aceite ? 'selected' : ''}`} style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <input type="checkbox" {...register('aceitaLGPD', { required: true })} />
                    <div className="option-indicator" />
                    <span className="text-xs" style={{ opacity: 0.8 }}>
                        Autorizo o tratamento dos dados para fins de análise jurídica inicial, ciente do sigilo profissional advogado-cliente conforme o Estatuto da OAB.
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
                        <>Enviar para Análise <ShieldCheck size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
