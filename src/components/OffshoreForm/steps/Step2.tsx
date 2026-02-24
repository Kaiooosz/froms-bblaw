'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { OffshoreFormData } from '@/types/form';

export default function Step2({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<OffshoreFormData>();
    const isResponsavel = watch('socio_responsavel');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Informações de Sócio</h2>

            <div className="form-group">
                <label htmlFor="participacao" className="form-label">Qual a porcentagem da sua participação?</label>
                <input
                    type="number"
                    id="participacao"
                    placeholder="Ex: 50"
                    min="1"
                    max="100"
                    className="form-input"
                    {...register('participacao')}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Você é o sócio responsável pela abertura da empresa?</label>
                <div className="option-grid">
                    {[
                        { id: 'sim', label: 'Sim' },
                        { id: 'nao', label: 'Não' }
                    ].map((opt) => (
                        <label
                            key={opt.id}
                            className={`option-card ${isResponsavel === opt.id ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                value={opt.id}
                                {...register('socio_responsavel')}
                            />
                            <div className="option-indicator" />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary">
                    <ChevronLeft size={18} /> Voltar
                </button>
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Prosseguir <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
