'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronLeft, Check, Loader2 } from 'lucide-react';
import { OffshoreFormData } from '@/types/form';

export default function Step4({ onPrev, isSubmitting }: { onPrev: () => void, isSubmitting: boolean }) {
    const { register, watch, formState: { errors } } = useFormContext<OffshoreFormData>();

    const ocupacao = watch('ocupacao');
    const pep = watch('pep');
    const eua = watch('residencia_eua');
    const aceite = watch('declaracao_aceite');

    return (
        <div className="animate-fade-in-up">
            <h2 className="form-title">Dados <span className="accent-text">Pessoais</span></h2>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input type="text" className="form-input" {...register('nome_completo_pessoal', { required: true })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Data de Nascimento</label>
                    <input type="date" className="form-input" {...register('data_nascimento', { required: true })} />
                </div>
            </div>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">E-mail Corporativo/Pessoal</label>
                    <input type="email" className="form-input" {...register('email', { required: true })} />
                </div>
                <div className="form-group">
                    <label className="form-label">Telefone de Contato</label>
                    <input type="tel" className="form-input" {...register('telefone')} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Endereço Residencial Completo</label>
                <input type="text" className="form-input" {...register('endereco')} placeholder="Rua, Número, Complemento, Cidade, Estado, CEP" />
            </div>

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">CPF ou NIT</label>
                    <input type="text" className="form-input" {...register('cpf_nit')} />
                </div>
                <div className="form-group">
                    <label className="form-label">Número do Passaporte</label>
                    <input type="text" className="form-input" {...register('passaporte')} />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Ocupação Atual</label>
                <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    {[
                        { id: 'empresario', label: 'Empresário' },
                        { id: 'funcionario', label: 'Funcionário' }
                    ].map((opt) => (
                        <label key={opt.id} className={`option-card ${ocupacao === opt.id ? 'selected' : ''}`}>
                            <input type="radio" value={opt.id} {...register('ocupacao')} />
                            <div className="option-indicator" />
                            <span>{opt.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            {ocupacao === 'empresario' && (
                <div className="form-group animate-fade-in-up">
                    <label className="form-label">CNPJ da Empresa Principal</label>
                    <input type="text" className="form-input" {...register('cnpj')} />
                </div>
            )}

            {ocupacao === 'funcionario' && (
                <div className="animate-fade-in-up">
                    <div className="form-group">
                        <label className="form-label">Empresa / Instituição</label>
                        <input type="text" className="form-input" {...register('empresa_trabalha')} />
                    </div>
                </div>
            )}

            <div className="responsive-grid">
                <div className="form-group">
                    <label className="form-label">Exposto Politicamente?</label>
                    <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        {['sim', 'nao'].map(opt => (
                            <label key={opt} className={`option-card ${pep === opt ? 'selected' : ''}`}>
                                <input type="radio" value={opt} {...register('pep')} />
                                <div className="option-indicator" />
                                <span className="capitalize">{opt === 'sim' ? 'Sim' : 'Não'}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">Residência nos EUA?</label>
                    <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                        {['sim', 'nao'].map(opt => (
                            <label key={opt} className={`option-card ${eua === opt ? 'selected' : ''}`}>
                                <input type="radio" value={opt} {...register('residencia_eua')} />
                                <div className="option-indicator" />
                                <span className="capitalize">{opt === 'sim' ? 'Sim' : 'Não'}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '3rem' }}>
                <label className="form-label">Documentação Inicial</label>
                <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                    <div className="form-group mb-0">
                        <input type="file" id="doc_endereco" className="hidden" {...register('doc_endereco')} />
                        <label htmlFor="doc_endereco" className="option-card" style={{ cursor: 'pointer', height: '100%', justifyContent: 'center', textAlign: 'center' }}>
                            <span className="text-sm">📎 Comprovante Endereço</span>
                        </label>
                    </div>
                    <div className="form-group mb-0">
                        <input type="file" id="doc_passaporte" className="hidden" {...register('doc_passaporte')} />
                        <label htmlFor="doc_passaporte" className="option-card" style={{ cursor: 'pointer', height: '100%', justifyContent: 'center', textAlign: 'center' }}>
                            <span className="text-sm">📎 Passaporte Válido</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="form-group" style={{ marginTop: '2rem' }}>
                <label className={`option-card ${aceite ? 'selected' : ''}`}>
                    <input type="checkbox" {...register('declaracao_aceite', { required: true })} />
                    <div className="option-indicator" />
                    <span className="text-sm">
                        Declaro que as informações são verdadeiras e aceito os termos de sigilo.
                    </span>
                </label>
            </div>

            <div className="btn-group">
                <button type="button" onClick={onPrev} className="btn btn-secondary" disabled={isSubmitting}>
                    Voltar
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>Finalizando <Loader2 className="animate-spin" size={20} /></>
                    ) : (
                        <>Enviar Solicitação <Check size={20} /></>
                    )}
                </button>
            </div>
        </div>
    );
}
