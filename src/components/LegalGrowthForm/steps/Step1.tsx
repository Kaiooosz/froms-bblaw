'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, Instagram } from 'lucide-react';
import { LegalGrowthFormData } from '@/types/legalGrowthForm';

export default function Step1({ onNext }: { onNext: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<LegalGrowthFormData>();
    const tipo = watch('tipo_identificacao');

    return (
        <div className="animate-fade-in-up">
            <h1 className="form-title">
                Legal Growth <br /> <span className="accent-text">Infoprodutores</span>
            </h1>

            <p className="form-description">
                Coleta inicial para diagnóstico de escala e proteção de negócios digitais.
            </p>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input
                        type="text"
                        className={`form-input ${errors.nome_completo ? 'border-destructive' : ''}`}
                        {...register('nome_completo', { required: 'Nome é obrigatório' })}
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
                    <label className="form-label">Instagram / Canal Principal</label>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
                            <Instagram size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="@seuusuario"
                            style={{ paddingLeft: '3rem' }}
                            className={`form-input ${errors.instagram ? 'border-destructive' : ''}`}
                            {...register('instagram', { required: 'Link ou @ é obrigatório' })}
                        />
                    </div>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Você se identifica como:</label>
                <div className="option-grid">
                    {[
                        { id: 'infoprodutor', label: 'Infoprodutor(a)', desc: 'Vendo cursos, mentorias ou ebooks' },
                        { id: 'expert', label: 'Expert / Autoridade', desc: 'Ainda não monetizei minha audiência' },
                        { id: 'afiliado', label: 'Afiliado(a) profissional', desc: 'Foco em tráfego e vendas de terceiros' },
                        { id: 'coprodutor', label: 'Co-produtor(a) / Sócio operacional', desc: 'Estrategista de lançamentos' },
                        { id: 'agencia', label: 'Agência ou Gestor de Tráfego', desc: 'Atendo múltiplos infoprodutores' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${tipo === opt.id ? 'selected' : ''}`} style={{ padding: '1rem 1.5rem' }}>
                            <input type="radio" value={opt.id} {...register('tipo_identificacao', { required: true })} />
                            <div className="option-indicator" />
                            <div>
                                <span style={{ fontWeight: 700 }}>{opt.label}</span>
                                <p style={{ fontSize: '0.75rem', opacity: 0.6 }}>{opt.desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Prosseguir <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
