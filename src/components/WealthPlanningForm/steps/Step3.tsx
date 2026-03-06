'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronLeft, Check, Loader2, ShieldCheck, Heart, Lock, Key } from 'lucide-react';
import { WealthPlanningFormData } from '@/types/wealthPlanningForm';

export default function Step3({ onPrev, isSubmitting }: { onPrev: () => void, isSubmitting: boolean }) {
    const { register, watch } = useFormContext<WealthPlanningFormData>();
    const objetivo = watch('objetivo_principal');
    const aceite = watch('aceita_termos');
    const controle = watch('quer_manter_controle');
    const genrosIncomunicabilidade = watch('preocupacao_genros_noras');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Estratégia e <span className="accent-text">Objetivos</span></h2>

            <div className="form-group">
                <label className="form-label">Qual o seu objetivo prioritário hoje?</label>
                <div className="option-grid">
                    {[
                        { id: 'reduzir_itcmd', label: 'Economia Tributária (ITCMD/ITBI)' },
                        { id: 'evitar_inventario', label: 'Pular a burocracia do Inventário' },
                        { id: 'protecao_blindagem', label: 'Proteção Patrimonial (Blindagem)' },
                        { id: 'sucessao_negocio', label: 'Sucessão na Empresa (Governança)' },
                        { id: 'eficiencia_ir', label: 'Redução de IR na locação/venda' }
                    ].map(opt => (
                        <label key={opt.id} className={`option-card ${objetivo === opt.id ? 'selected' : ''}`} style={{ padding: '1rem' }}>
                            <input type="radio" value={opt.id} {...register('objetivo_principal', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2.5rem' }}>
                <label className="form-label">Recursos Específicos:</label>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <label className={`option-card ${controle ? 'selected' : ''}`} style={{ padding: '1.25rem' }}>
                        <input type="checkbox" {...register('quer_manter_controle')} />
                        <div className="option-indicator" />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Key size={16} className="accent-text" />
                                <span style={{ fontWeight: 700 }}>Manter Controle Absolute (Usufruto)</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Deseja o domínio total dos bens enquanto estiver vivo.</p>
                        </div>
                    </label>

                    <label className={`option-card ${genrosIncomunicabilidade ? 'selected' : ''}`} style={{ padding: '1.25rem' }}>
                        <input type="checkbox" {...register('preocupacao_genros_noras')} />
                        <div className="option-indicator" />
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Lock size={16} className="accent-text" />
                                <span style={{ fontWeight: 700 }}>Proteção contra Terceiros (Genros/Noras)</span>
                            </div>
                            <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>Cláusulas de incomunicabilidade e impenhorabilidade.</p>
                        </div>
                    </label>
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2.5rem' }}>
                <label className="form-label">Nível de Urgência:</label>
                <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                    {['imediata', 'proximos_meses', 'apenas_estudo'].map(o => (
                        <label key={o} className="option-card" style={{ padding: '0.75rem', justifyContent: 'center' }}>
                            <input type="radio" value={o} {...register('urgencia')} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}>{o.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className={`option-card ${aceite ? 'selected' : ''}`} style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <input type="checkbox" {...register('aceita_termos', { required: true })} />
                    <div className="option-indicator" />
                    <span className="text-xs" style={{ opacity: 0.8 }}>
                        Estou ciente que este diagnóstico é preliminar e as informações são protegidas por sigilo profissional entre advogado e cliente.
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
                        <>Solicitar Estruturação <ShieldCheck size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
