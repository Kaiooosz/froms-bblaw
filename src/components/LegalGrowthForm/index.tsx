'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { LegalGrowthFormData } from '@/types/legalGrowthForm';
import { Moon, Sun, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import '../OffshoreForm/styles.css';

// Form Steps
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step3';
import Step4 from './steps/Step4';
import StepSuccess from '../OffshoreForm/steps/StepSuccess';

export default function LegalGrowthForm() {
    const [step, setStep] = useState(1);
    const [history, setHistory] = useState<number[]>([1]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toggleTheme, theme } = useTheme();

    const methods = useForm<LegalGrowthFormData>({
        defaultValues: {
            lgpd_consent: false,
            plataformas: [],
            modelo_negocio: [],
            forma_recebimento: [],
            ip_proteger: [],
            contratos_necessarios: [],
            regioes_venda: []
        }
    });

    const { handleSubmit, watch, trigger } = methods;

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ['nome_completo', 'whatsapp', 'email', 'tipo_identificacao', 'instagram'];
        if (step === 2) fieldsToValidate = ['faturamento_mensal', 'cnpj_status', 'ticket_medio'];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            const next = step + 1;
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

    const onSubmit = async (data: LegalGrowthFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, formType: 'legal-growth' }),
            });
            const result = await response.json();
            if (result.success) setStep(5);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles = ["Identificação", "Negócio Digital", "Objetivos", "Envio", "Concluído"];

    return (
        <div className="form-page-wrapper">
            <header className="form-header">
                <Link href="/admin/dashboard" style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <ChevronLeft size={20} /> Painel
                </Link>
                <div className="logo-container">
                    <img src="/LogoBranco.svg" alt="BBLAW" className="logo-img" />
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
                            <div className="progress-fill" style={{ width: `${(step / 4) * 100}%` }} />
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
                                    transition={{ duration: 0.5 }}
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
                        <p>Seus dados estão protegidos. Somos especialistas em Direito Digital para Infoprodutores.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
