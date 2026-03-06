'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, User, Phone, Mail, MapPin, Building } from 'lucide-react';
import { StrategicLitigationFormData } from '@/types/strategicLitigationForm';

export default function Step1({ onNext }: { onNext: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<StrategicLitigationFormData>();
    const representa = watch('representa');

    return (
        <div className="animate-fade-in-up">
            <h1 className="form-title">
                Contencioso <span className="accent-text">Estratégico</span>
            </h1>

            <p className="form-description">
                Identificação e análise preliminar para defesa de interesses em litígios complexos.
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
                    <label className="form-label">E-mail</label>
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
                        'Pessoa Física',
                        'Empresa / Pessoa Jurídica',
                        'Sócio em conflito com outros sócios',
                        'Herdeiro em litígio',
                        'Vítima de crime econômico (cliente lesado)',
                        'Réu / Investigado em processo criminal'
                    ].map((opt) => (
                        <label key={opt} className={`option-card ${representa === opt ? 'selected' : ''}`}>
                            <input type="radio" value={opt} {...register('representa', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600 }}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            {(representa === 'Empresa / Pessoa Jurídica' || representa === 'Sócio em conflito com outros sócios') && (
                <div className="form-group animate-fade-in-up">
                    <label className="form-label">CNPJ da Empresa (Opcional)</label>
                    <input type="text" className="form-input" {...register('cnpjEmpresa')} />
                </div>
            )}

            <div className="form-group">
                <label className="form-label">Situação quanto ao Advogado:</label>
                <div className="option-grid">
                    {[
                        'Não, ainda sem advogado',
                        'Sim, mas quero trocar',
                        'Sim, quero uma segunda opinião',
                        'Sim, preciso de apoio especializado pontual'
                    ].map((opt) => (
                        <label key={opt} className="option-card">
                            <input type="radio" value={opt} {...register('advogadoAtual', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600 }}>{opt}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Próxima Etapa <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
