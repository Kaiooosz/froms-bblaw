'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight } from 'lucide-react';
import { StrategicLegalFormData } from '@/types/strategicLegalForm';

export default function Step1({ onNext }: { onNext: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<StrategicLegalFormData>();
    const representa = watch('representa');

    return (
        <div className="animate-fade-in-up">
            <h1 className="form-title">
                Jurídico Estratégico <br /> <span className="accent-text">Empresarial</span>
            </h1>

            <p className="form-description">
                Diagnóstico para estruturação, governança e conformidade de empresas.
            </p>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input
                        type="text"
                        className={`form-input ${errors.nomeCompleto ? 'border-destructive' : ''}`}
                        {...register('nomeCompleto', { required: 'Nome é obrigatório' })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input
                        type="tel"
                        className={`form-input ${errors.whatsapp ? 'border-destructive' : ''}`}
                        {...register('whatsapp', { required: 'WhatsApp é obrigatório' })}
                    />
                </div>
            </div>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">E-mail Corporativo</label>
                    <input
                        type="email"
                        className={`form-input ${errors.email ? 'border-destructive' : ''}`}
                        {...register('email', { required: 'E-mail é obrigatório' })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Cidade / Estado</label>
                    <input
                        type="text"
                        className={`form-input ${errors.cidadeEstado ? 'border-destructive' : ''}`}
                        {...register('cidadeEstado', { required: 'Cidade/Estado é obrigatório' })}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Você representa:</label>
                <div className="option-grid">
                    {[
                        'Empresário individual / sócio único',
                        'Sociedade com 2 ou mais sócios',
                        'Startup (menos de 5 anos / buscando captação)',
                        'Scale-up (crescimento acelerado / já com receita)',
                        'Grupo empresarial / Holding operacional'
                    ].map((opt) => (
                        <label key={opt} className={`option-card ${representa === opt ? 'selected' : ''}`} style={{ padding: '1rem' }}>
                            <input type="radio" value={opt} {...register('representa', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Avançar <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
