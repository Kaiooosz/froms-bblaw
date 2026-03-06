'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { StrategicLegalFormData } from '@/types/strategicLegalForm';
import { Moon, Sun, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import '../OffshoreForm/styles.css';

// Form Steps
import Step1 from './steps/Step1';
import Step2 from './steps/Step2';
import Step3 from './steps/Step4'; // Urgência/Envio (Pulando detalhamentos técnicos para exemplo)
import StepSuccess from '../OffshoreForm/steps/StepSuccess';

export default function StrategicLegalForm() {
    const [step, setStep] = useState(1);
    const [history, setHistory] = useState<number[]>([1]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toggleTheme, theme } = useTheme();

    const methods = useForm<StrategicLegalFormData>({
        defaultValues: {
            aceitaLGPD: false,
            areasDemanda: [],
            fontesReceita: []
        }
    });

    const { handleSubmit, watch, trigger } = methods;

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (step === 1) fieldsToValidate = ['nomeCompleto', 'whatsapp', 'email', 'representa'];
        if (step === 2) fieldsToValidate = ['setorAtuacao', 'faturamentoAnual'];

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

    const onSubmit = async (data: StrategicLegalFormData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, formType: 'strategic-legal' }),
            });
            const result = await response.json();
            if (result.success) setStep(4);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepTitles = ["Identificação", "Contexto", "Envio", "Concluído"];

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
                {step < 4 && (
                    <div className="progress-container">
                        <div className="progress-header">
                            <span>Passo {step} de 3</span>
                            <span>{stepTitles[step - 1]}</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} />
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
                                    {step === 3 && <Step3 onPrev={prevStep} isSubmitting={isSubmitting} />}
                                    {step === 4 && <StepSuccess />}
                                </motion.div>
                            </AnimatePresence>
                        </form>
                    </FormProvider>
                </div>

                {step < 4 && (
                    <div className="sigilo-box mt-8">
                        <ShieldCheck size={24} />
                        <p>Assessoria jurídica de elite para empresas em crescimento. Sigilo garantido.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
