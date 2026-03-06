'use client';

import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, ShieldCheck, Loader2, CheckCircle2, Moon, Sun } from 'lucide-react';
import { funnelConfig } from '@/lib/funnels';
import { useTheme } from '@/components/ThemeProvider';
import '@/app/forms.css';

export default function DynamicForm() {
    const params = useParams();
    const funnelId = params?.funnelId as string;
    const { theme, toggleTheme } = useTheme();
    const config = funnelConfig[funnelId as string];
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const router = useRouter();

    const methods = useForm();
    const { handleSubmit, register, watch } = methods;

    if (!config) {
        return <div className="p-20 text-center">Configuração de formulário não encontrada.</div>;
    }

    const totalPages = config.pages.length;
    const currentPageData = config.pages[step];

    const nextStep = async () => {
        const fields = currentPageData.questions.map((q: { id: string }) => q.id);
        const isValid = await methods.trigger(fields);

        if (isValid && step < totalPages - 1) {
            setStep(s => s + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(s => s - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const calculateScore = (data: Record<string, string | string[]>) => {
        let score = 0;
        let priority = 'NORMAL';
        const tags = [...(config.tags || [])];

        const patrimonioStr = (data.patrimonio_estimado as string) || (data.patrimonio_cripto as string) || '';
        const rendaStr = (data.renda_media as string) || '';

        if (patrimonioStr.includes('10 milhões') || patrimonioStr === '10M+') {
            score += 100;
            priority = 'VIP';
            tags.push('VIP');
        } else if (patrimonioStr.includes('2 – 10 milhões') || patrimonioStr.includes('2M – 10M')) {
            score += 50;
            priority = 'ALTA';
            tags.push('Prioridade Alta');
        }

        if (rendaStr.includes('100') || rendaStr.includes('300')) {
            score += 30;
            priority = priority === 'VIP' ? 'VIP' : 'ALTA';
        }

        if (data.prazo_correndo === 'Sim') {
            priority = 'URGENTE';
            tags.push('URGENTE');
        }

        return { score, priority, tags };
    };

    const onSubmit = async (formData: Record<string, any>) => {
        setIsSubmitting(true);

        try {
            const processedData = { ...formData };

            // Loop para detectar e processar arquivos em qualquer campo do formulário
            for (const key in processedData) {
                const value = processedData[key];

                // Verificação flexível para FileList ou Array de Files (comum no React Hook Form)
                const isFile = value instanceof File;
                const isFileList = value instanceof FileList;
                const isArrayOfFiles = Array.isArray(value) && value.length > 0 && value[0] instanceof File;

                if (isFile || isFileList || isArrayOfFiles) {
                    const filesToProcess = isFile ? [value] : Array.from(value as any);

                    // Validação de Tamanho Total (Limite de 3MB para segurança no Vercel/NextJS)
                    const totalSize = (filesToProcess as File[]).reduce((acc, file) => acc + file.size, 0);
                    if (totalSize > 3 * 1024 * 1024) {
                        alert("Anexos muito pesados (limite 3MB). Por favor, reduza a qualidade das fotos ou envie arquivos menores.");
                        setIsSubmitting(false);
                        return;
                    }

                    const filesPromises = (filesToProcess as File[]).map(file => {
                        return new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve({
                                name: file.name,
                                type: file.type,
                                size: file.size,
                                base64: reader.result
                            });
                            reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
                            reader.readAsDataURL(file);
                        });
                    });

                    processedData[key] = await Promise.all(filesPromises);
                } else if (key.endsWith('_outro_especificar')) {
                    const baseKey = key.replace('_outro_especificar', '');
                    const specValue = processedData[key];
                    const baseValue = processedData[baseKey];

                    if (specValue) {
                        if (Array.isArray(baseValue)) {
                            processedData[baseKey] = baseValue.map(v => ['Outro', 'Outros'].includes(v) ? `${v} (${specValue})` : v);
                        } else if (['Outro', 'Outros'].includes(baseValue)) {
                            processedData[baseKey] = `${baseValue} (${specValue})`;
                        }
                    }
                    delete processedData[key];
                }
            }

            const { score, priority, tags } = calculateScore(processedData);

            const res = await fetch('/api/submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    funnelType: funnelId,
                    data: processedData,
                    score,
                    priority,
                    tags
                })
            });

            if (res.ok) {
                setIsDone(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.message || 'Erro ao processar formulário no servidor.');
            }
        } catch (submitError) {
            console.error('Submission error:', submitError);
            alert('Falha na transmissão. Certifique-se de que os arquivos não são muito grandes.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isDone) {
        const adminWhatsAppNumber = "5511982712025";
        const message = `Olá! O formulário estratégico "${config.title}" da BBLAW foi preenchido!`;
        const waUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`;

        return (
            <div className="form-page-wrapper responsive-padding" style={{ justifyContent: 'center', alignItems: 'center', padding: '4rem 1rem' }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="form-card" style={{ maxWidth: '640px', width: '100%', textAlign: 'center', margin: 'auto' }}>
                    <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', color: 'var(--foreground)' }}>
                        <CheckCircle2 size={56} />
                    </div>
                    <h1 className="form-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Protocolo <span className="accent-text">Transmitido</span></h1>

                    {config.completionAdvice ? (
                        <div style={{ textAlign: 'left', background: 'var(--secondary)', padding: '2rem', borderRadius: '1rem', marginTop: '2rem', marginBottom: '2.5rem', borderLeft: '4px solid var(--accent)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
                                {config.completionAdvice.title}
                            </h3>
                            <div style={{ fontSize: '0.9rem', opacity: 0.8, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                                {config.completionAdvice.message}
                            </div>
                        </div>
                    ) : (
                        <p style={{ opacity: 0.5, fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
                            As informações foram enviadas com sucesso e o setor administrativo já foi notificado.
                        </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                borderRadius: '100px',
                                background: 'var(--foreground)',
                                border: 'none',
                                color: 'var(--background)',
                                fontWeight: 900,
                                letterSpacing: '0.05em',
                                padding: '1.25rem'
                            }}
                        >
                            {config.completionAdvice?.buttonText || "NOTIFICAR EQUIPE NO WHATSAPP"}
                        </a>
                        <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                            <button onClick={() => router.push('/funnels')} style={{ flex: 1, padding: '1rem', borderRadius: '100px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer' }}>
                                ABRIR NOVO FORMULÁRIO
                            </button>
                            <button onClick={() => router.push('/admin/dashboard')} style={{ flex: 1, padding: '1rem', borderRadius: '100px', border: '1px solid var(--border)', background: 'var(--secondary)', color: 'var(--foreground)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em', cursor: 'pointer' }}>
                                PAINEL ADMIN
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="form-page-wrapper">
            <header className="form-header responsive-padding" style={{ maxWidth: 'none', background: 'transparent', border: 'none' }}>
                <img src={theme === 'dark' ? "/logo-branco.svg" : "/logo-preto.svg"} alt="BBLAW" style={{ maxWidth: '100px' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginLeft: 'auto' }}>
                    <button onClick={toggleTheme} title="Alternar Tema" style={{ opacity: 0.8, padding: '0.5rem', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <span className="mobile-hide" style={{ fontSize: '0.6rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4, paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
                        {config.title}
                    </span>
                </div>
            </header>

            <main className="form-main-container responsive-padding" style={{ maxWidth: '800px' }}>
                <div style={{ marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', fontWeight: 800, opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
                        <span>Progressão: {Math.round(((step + 1) / totalPages) * 100)}%</span>
                        <span>Etapa {step + 1}/{totalPages}</span>
                    </div>
                    <div className="progress-bar" style={{ height: '2px', background: 'var(--border)' }}>
                        <div className="progress-fill" style={{ width: `${((step + 1) / totalPages) * 100}%`, background: 'var(--foreground)' }} />
                    </div>
                </div>

                <div className="form-card" style={{ border: 'none', background: 'transparent', padding: 0, boxShadow: 'none' }}>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    <h2 className="form-title" style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: currentPageData.description ? '1.5rem' : '2.5rem' }}>{currentPageData.title}</h2>

                                    {currentPageData.description && (
                                        <div style={{
                                            padding: '1.25rem',
                                            background: 'var(--secondary)',
                                            borderRadius: '0.5rem',
                                            marginBottom: '2.5rem',
                                            fontSize: '0.85rem',
                                            lineHeight: 1.6,
                                            borderLeft: '4px solid var(--foreground)',
                                            opacity: 0.8
                                        }}>
                                            {currentPageData.description}
                                        </div>
                                    )}

                                    {currentPageData.questions.map((q: any) => (
                                        <div key={q.id} className="form-group" style={{ marginBottom: '3.5rem' }}>
                                            <label className="form-label" style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'none', letterSpacing: '0', marginBottom: '1.25rem', display: 'block' }}>
                                                {q.label} {q.required && <span style={{ opacity: 0.3 }}>*</span>}
                                                {q.helpText && (
                                                    <span style={{
                                                        display: 'block',
                                                        fontSize: '0.8rem',
                                                        opacity: 0.6,
                                                        marginTop: '0.5rem',
                                                        fontWeight: 500,
                                                        color: 'var(--muted-foreground)',
                                                        padding: '0.5rem 0.75rem',
                                                        background: 'var(--accent)',
                                                        borderRadius: '0.4rem',
                                                        borderLeft: '3px solid var(--foreground)'
                                                    }}>
                                                        💡 {q.helpText}
                                                    </span>
                                                )}
                                            </label>

                                            {(q.type === 'text' || q.type === 'number') && (
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    style={{ border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '0.75rem 0', background: 'transparent' }}
                                                    placeholder={q.placeholder || 'Preencher...'}
                                                    {...register(q.id, { required: q.required })}
                                                />
                                            )}

                                            {q.type === 'textarea' && (
                                                <textarea
                                                    className="form-input"
                                                    style={{ minHeight: '100px', border: '1px solid var(--border)', padding: '1.25rem', borderRadius: '0.5rem', background: 'transparent' }}
                                                    placeholder={q.placeholder || 'Detalhar informações...'}
                                                    {...register(q.id, { required: q.required })}
                                                />
                                            )}

                                            {q.type === 'file' && (
                                                <div className="file-upload-wrapper">
                                                    <label className="file-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', width: '100%', cursor: 'pointer', border: '1px dashed var(--border)', borderRadius: '0.5rem', display: 'block' }}>
                                                        <input type="file" multiple={q.multiple} className="hidden-file-input" {...register(q.id)} />
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Anexar Documentação</span>
                                                        <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '0.5rem' }}>Toque para selecionar arquivos</p>
                                                    </label>
                                                </div>
                                            )}

                                            {(q.type === 'radio' || q.type === 'checkbox') && q.options && (
                                                <div className="option-grid" style={{ gap: '0.75rem' }}>
                                                    {q.options.map((opt: string) => (
                                                        <label key={opt} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            padding: '1.1rem',
                                                            border: '1px solid var(--border)',
                                                            borderRadius: '0.5rem',
                                                            cursor: 'pointer',
                                                            background: (q.type === 'radio' ? watch(q.id) === opt : (watch(q.id) || []).includes(opt)) ? 'var(--foreground)' : 'transparent',
                                                            color: (q.type === 'radio' ? watch(q.id) === opt : (watch(q.id) || []).includes(opt)) ? 'var(--background)' : 'inherit',
                                                            transition: 'all 0.2s ease'
                                                        }}>
                                                            <input type={q.type} value={opt} style={{ display: 'none' }} {...register(q.id, { required: q.required })} />
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{opt}</span>
                                                        </label>
                                                    ))}

                                                    {/* Campo de especificação dinâmica para "Outro" */}
                                                    <AnimatePresence>
                                                        {((q.type === 'radio' && ['Outro', 'Outros'].includes(watch(q.id))) ||
                                                            (q.type === 'checkbox' && (watch(q.id) || []).some((v: string) => ['Outro', 'Outros'].includes(v)))) && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    exit={{ opacity: 0, height: 0 }}
                                                                    style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}
                                                                >
                                                                    <input
                                                                        type="text"
                                                                        className="form-input"
                                                                        style={{ border: 'none', borderBottom: '1px solid var(--border)', borderRadius: 0, padding: '0.6rem 0', background: 'transparent', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.02em' }}
                                                                        placeholder="Especifique qual..."
                                                                        {...register(`${q.id}_outro_especificar`, { required: true })}
                                                                    />
                                                                </motion.div>
                                                            )}
                                                    </AnimatePresence>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="btn-group" style={{ marginTop: '4rem', display: 'flex', gap: '1rem' }}>
                                        {step > 0 && (
                                            <button type="button" onClick={prevStep} className="btn-secondary" style={{ padding: '0.85rem 1.5rem', fontWeight: 700, borderRadius: '100px', border: '1px solid var(--border)', background: 'transparent', fontSize: '0.85rem' }}>
                                                VOLTAR
                                            </button>
                                        )}

                                        <button
                                            type={step < totalPages - 1 ? "button" : "submit"}
                                            onClick={step < totalPages - 1 ? nextStep : undefined}
                                            className="btn btn-primary"
                                            disabled={isSubmitting}
                                            style={{ flex: 1, justifyContent: 'center', padding: '1rem', borderRadius: '100px', fontSize: '0.9rem' }}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (step < totalPages - 1 ? 'PROSSEGUIR' : 'CONCLUIR')}
                                        </button>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </form>
                    </FormProvider>
                </div>
            </main>

            <footer style={{ padding: '3rem 1.5rem', textAlign: 'center', opacity: 0.2 }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700 }}>BBLAW — PROTOCOLO SEGURO</p>
            </footer>
        </div>
    );
}
