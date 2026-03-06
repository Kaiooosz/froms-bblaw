'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft, Landmark, Users } from 'lucide-react';
import { WealthPlanningFormData } from '@/types/wealthPlanningForm';

export default function Step2({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<WealthPlanningFormData>();
    const valorPatrimonio = watch('valor_patrimonio_estimado');
    const composicao = watch('composicao_patrimonio') || [];

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Seu <span className="accent-text">Patrimônio</span></h2>

            <div className="form-group">
                <label className="form-label">Valor total estimado dos ativos:</label>
                <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {[
                        { id: 'ate_1mi', label: 'Até R$ 1 mi' },
                        { id: '1mi_5mi', label: 'R$ 1 mi - 5 mi' },
                        { id: '5mi_20mi', label: 'R$ 5 mi - 20 mi' },
                        { id: '20mi_50mi', label: 'R$ 20 mi - 50 mi' },
                        { id: 'acima_50mi', label: 'Acima de R$ 50 mi' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${valorPatrimonio === opt.id ? 'selected' : ''}`} style={{ padding: '0.8rem' }}>
                            <input type="radio" value={opt.id} {...register('valor_patrimonio_estimado', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Composição do Patrimônio (Múltipla):</label>
                <div className="option-grid">
                    {[
                        { id: 'imoveis_urbanos', label: 'Imóveis Urbanos' },
                        { id: 'imoveis_rurais', label: 'Fazendas / Imóveis Rurais' },
                        { id: 'empresa_operacional', label: 'Empresas Operacionais (Cotas/Ações)' },
                        { id: 'investimentos_financeiros', label: 'Aplicações Financeiras / Cash' },
                        { id: 'criptoativos', label: 'Criptoativos / Ativos Digitais' },
                        { id: 'veiculos_luxo', label: 'Aeronaves / Embarcações / Carros' }
                    ].map(opt => (
                        <label key={opt.id} className={`option-card ${composicao.includes(opt.id) ? 'selected' : ''}`} style={{ padding: '1rem' }}>
                            <input type="checkbox" value={opt.id} {...register('composicao_patrimonio')} />
                            <div className="option-indicator" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Número de Herdeiros Diretos:</label>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                        <Users size={18} />
                    </div>
                    <input
                        type="number"
                        placeholder="Quantidade de herdeiros"
                        style={{ paddingLeft: '3rem' }}
                        className="form-input"
                        {...register('numero_herdeiros', { required: true, min: 0 })}
                    />
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={20} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary" disabled={!valorPatrimonio}>
                    Ver Objetivos <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
