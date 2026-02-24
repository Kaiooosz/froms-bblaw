'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { OffshoreFormData } from '@/types/form';
import { Moon, Sun, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import './styles.css';

// Form Steps
import Step1 from '@/components/OffshoreForm/steps/Step1';
import Step2 from '@/components/OffshoreForm/steps/Step2';
import Step3 from '@/components/OffshoreForm/steps/Step3';
import Step4 from '@/components/OffshoreForm/steps/Step4';
import StepSuccess from '@/components/OffshoreForm/steps/StepSuccess';

export default function OffshoreForm() {
    const [step, setStep] = useState(1);
    const [history, setHistory] = useState<number[]>([1]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toggleTheme, theme } = useTheme();

    const methods = useForm<OffshoreFormData>({
        defaultValues: {
            relacao_empresa: 'proprietario',
            imoveis_brasil: 'nao',
            socio_responsavel: 'sim',
            jurisdicao: 'Névis',
            pep: 'nao',
            residencia_eua: 'nao',
            uso_empresa: [],
            origem_fundos: [],
        }
    });

    const { handleSubmit, watch, trigger } = methods;
    const relacao = watch('relacao_empresa');
    const socioResponsavel = watch('socio_responsavel');

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];

        if (step === 1) fieldsToValidate = ['whatsapp', 'relacao_empresa'];
        if (step === 2) fieldsToValidate = ['participacao', 'socio_responsavel'];
        if (step === 3) fieldsToValidate = ['empresa_opcao1', 'jurisdicao'];

        const isStepValid = await trigger(fieldsToValidate);

        if (isStepValid) {
            let next = step + 1;

            if (step === 1) {
                if (relacao === 'proprietario') next = 3;
                else if (relacao === 'diretor') next = 4;
            } else if (step === 2) {
                if (socioResponsavel === 'sim') next = 3;
                else next = 4;
            }

            setStep(next);
            setHistory([...history, next]);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            const prev = newHistory[newHistory.length - 1];
            setHistory(newHistory);
            setStep(prev);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onSubmit = async (data: OffshoreFormData) => {
        setIsSubmitting(true);

        try {
            // 1. Upload de Documentos
            let docEnderecoUrl = null;
            let docPassaporteUrl = null;

            const { supabase } = await import('@/lib/supabase');

            if (data.doc_endereco?.[0]) {
                const file = data.doc_endereco[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_endereco.${fileExt}`;
                const { data: uploadData, error } = await supabase.storage
                    .from('leads-documents')
                    .upload(fileName, file);

                if (!error) docEnderecoUrl = fileName;
            }

            if (data.doc_passaporte?.[0]) {
                const file = data.doc_passaporte[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_passaporte.${fileExt}`;
                const { data: uploadData, error } = await supabase.storage
                    .from('leads-documents')
                    .upload(fileName, file);

                if (!error) docPassaporteUrl = fileName;
            }

            // 2. Enviar dados para API
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...data,
                    documento_residencia: docEnderecoUrl,
                    documento_identidade: docPassaporteUrl
                }),
            });

            const result = await response.json();

            if (result.success) {
                setStep(5);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                alert('Erro ao enviar: ' + result.message);
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Erro de conexão com o servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles = [
        "Início",
        "Sociedade",
        "Sobre a Empresa",
        "Dados Pessoais",
        "Concluído"
    ];

    return (
        <div className="form-page-wrapper">
            <header className="form-header">
                <div className="logo-container">
                    <img
                        src={theme === 'light' ? '/logo-preto.jpg' : '/logo-branco.jpg'}
                        alt="Bezerra Borges Advogados"
                        className="logo-img"
                    />
                </div>
                <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
                </button>
            </header>

            <main className="form-main-container">
                {step < 5 && (
                    <div className="progress-container">
                        <div className="progress-header">
                            <span>Passo {step} de 4</span>
                            <span>{stepTitles[step - 1]}</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="form-card">
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {step === 1 && <Step1 onNext={nextStep} />}
                                    {step === 2 && <Step2 onNext={nextStep} onPrev={prevStep} />}
                                    {step === 3 && <Step3 onNext={nextStep} onPrev={prevStep} />}
                                    {step === 4 && <Step4 onPrev={prevStep} isSubmitting={isSubmitting} />}
                                    {step === 5 && <StepSuccess />}
                                </motion.div>
                            </AnimatePresence>
                        </form>
                    </FormProvider>
                </div>

                {step < 5 && (
                    <div className="sigilo-box mt-8">
                        <ShieldCheck size={24} />
                        <p>Seus dados são criptografados e protegidos seguindo os mais altos padrões de segurança.</p>
                    </div>
                )}
            </main>

            <footer className="form-footer">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p>© {new Date().getFullYear()} Bezerra Borges Advogados. Excelência em assessoria offshore.</p>
                    <p style={{ opacity: 0.7 }}>Desenvolvido com tecnologia de ponta para sua privacidade.</p>
                </div>
            </footer>
        </div>
    );
}
