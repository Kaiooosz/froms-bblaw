'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronRight, Info } from 'lucide-react';
import { WealthPlanningFormData } from '@/types/wealthPlanningForm';

export default function Step1({ onNext }: { onNext: () => void }) {
    const { register, watch, formState: { errors } } = useFormContext<WealthPlanningFormData>();
    const tipoCliente = watch('tipo_cliente');

    return (
        <div className="animate-fade-in-up">
            <h1 className="form-title">
                Planejamento <span className="accent-text">Patrimonial</span>
            </h1>

            <p className="form-description">
                Inicie o diagnóstico para proteção de ativos e sucessão familiar estratégica.
            </p>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input
                        type="text"
                        className={`form-input ${errors.nome_completo ? 'border-destructive' : ''}`}
                        {...register('nome_completo', { required: 'Obrigatório' })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">WhatsApp</label>
                    <input
                        type="tel"
                        className={`form-input ${errors.whatsapp ? 'border-destructive' : ''}`}
                        {...register('whatsapp', { required: 'Obrigatório' })}
                    />
                </div>
            </div>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input
                        type="email"
                        className={`form-input ${errors.email ? 'border-destructive' : ''}`}
                        {...register('email', { required: 'Obrigatório' })}
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Cidade / Estado</label>
                    <input
                        type="text"
                        placeholder="Ex: São Paulo / SP"
                        className={`form-input ${errors.cidade_estado ? 'border-destructive' : ''}`}
                        {...register('cidade_estado', { required: 'Obrigatório para cálculo de ITCMD' })}
                    />
                    <p style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '4px' }}>* Define a alíquota aplicável de ITCMD (imposto de transmissão).</p>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Você é:</label>
                <div className="option-grid">
                    {[
                        { id: 'pf', label: 'Pessoa Física (CPF)' },
                        { id: 'empresario', label: 'Empresário / Sócio (CNPJ)' },
                        { id: 'holding', label: 'Já possuo Holding constituída' },
                        { id: 'produtor_rural', label: 'Produtor Rural' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${tipoCliente === opt.id ? 'selected' : ''}`}>
                            <input type="radio" value={opt.id} {...register('tipo_cliente', { required: true })} />
                            <div className="option-indicator" />
                            <span style={{ fontWeight: 600 }}>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {tipoCliente === 'holding' && (
                <div className="sigilo-box animate-fade-in-up" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <Info size={18} />
                    <p style={{ fontSize: '0.85rem' }}>Analisaremos se sua estrutura atual está otimizada ou se há riscos de desconsideração da personalidade jurídica.</p>
                </div>
            )}

            {(tipoCliente === 'empresario' || tipoCliente === 'holding') && (
                <div className="form-group animate-fade-in-up">
                    <label className="form-label">Número de empresas no grupo:</label>
                    <input type="number" className="form-input" {...register('numero_empresas')} />
                </div>
            )}

            <div className="btn-group">
                <button type="button" onClick={onNext} className="btn btn-primary">
                    Analisar Patrimônio <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
