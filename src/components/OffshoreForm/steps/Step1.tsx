'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight } from 'lucide-react';
import { OffshoreFormData } from '@/types/form';

export default function Step1({ onNext }: { onNext: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<OffshoreFormData>();
    const currentRelacao = watch('relacao_empresa');

    return (
        <div className="animate-fade-in-up">
            <h1 className="form-title">
                Solicitação de <span className="accent-text">Abertura Offshore</span>
            </h1>

            <p className="form-description">
                Inicie sua jornada rumo à liberdade financeira e proteção patrimonial.
                Este formulário é o primeiro passo para estruturar sua presença internacional
                com a Bezerra Borges Advogados.
            </p>

            <div className="form-group">
                <label className="form-label">Qual sua relação com a nova estrutura?</label>
                <div className="option-grid">
                    {[
                        { id: 'proprietario', label: 'Proprietário Único' },
                        { id: 'socio', label: 'Sócio Participante' },
                        { id: 'diretor', label: 'Diretor / Gestor' }
                    ].map((opt) => (
                        <label
                            key={opt.id}
                            className={`option-card ${currentRelacao === opt.id ? 'selected' : ''}`}
                        >
                            <input
                                type="radio"
                                value={opt.id}
                                {...register('relacao_empresa')}
                            />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="form-group">
                <label htmlFor="whatsapp" className="form-label">WhatsApp para contato direto</label>
                <input
                    type="tel"
                    id="whatsapp"
                    placeholder="+55 (11) 99999-8888"
                    className={`form-input ${errors.whatsapp ? 'border-destructive' : ''}`}
                    {...register('whatsapp', { required: 'Campo obrigatório' })}
                />
                {errors.whatsapp && <span className="text-destructive text-xs mt-2 block font-medium">{errors.whatsapp.message as string}</span>}
            </div>

            <div className="btn-group">
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Iniciar Processo <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
