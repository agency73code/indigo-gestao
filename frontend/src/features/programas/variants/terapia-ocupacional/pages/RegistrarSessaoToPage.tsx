// Registrar Sessão — Terapia Ocupacional
// Página mobile-first com reuso máximo de componentes base

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, X, ClipboardList, Target, FileText, Clock, FileEdit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { HeaderInfo } from '@/features/programas/cadastro-ocp';
import type { Patient, Therapist } from '@/features/programas/cadastro-ocp/types';
import { toSessionsService } from '../services/toSessions.service';
import type { ToAchieved, ToSessionPayload } from '../types';
import { toConfig } from '../config';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface FormState {
    // Bloco A — Identificação (usando tipos do sistema)
    patient: Patient | null;
    therapist: Therapist | null;
    date: string;
    programId: string | null;

    // Bloco B — Objetivo
    goalTitle: string;

    // Bloco C — Parâmetros clínicos TO
    achieved: ToAchieved | null;
    frequency: string; // string para input, depois convertido
    performanceNotes: string;
    durationMin: string; // string para input
    clinicalNotes: string;

    // Bloco D — Documentos
    documentType: string;
    attachments: File[];
}

interface FormErrors {
    patient?: string;
    goalTitle?: string;
    achieved?: string;
    performanceNotes?: string;
    frequency?: string;
    durationMin?: string;
    attachments?: string;
}

export default function RegistrarSessaoToPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Registrar Sessão - TO');
    }, [setPageTitle]);

    const [formState, setFormState] = useState<FormState>({
        patient: null,
        therapist: null,
        date: new Date().toISOString().split('T')[0], // hoje
        programId: null,
        goalTitle: '',
        achieved: null,
        frequency: '',
        performanceNotes: '',
        durationMin: '',
        clinicalNotes: '',
        documentType: '',
        attachments: [],
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Carregar terapeuta logado
    useEffect(() => {
        const loadTherapistAvatar = async () => {
            if (user) {
                try {
                    const avatarRes = await fetch(
                        `${import.meta.env.VITE_API_URL}/arquivos/getAvatar?ownerId=${user.id}&ownerType=terapeuta`,
                        { credentials: 'include' }
                    );
                    const avatarData = await avatarRes.json();

                    setFormState((prev) => ({
                        ...prev,
                        therapist: {
                            id: user.id,
                            name: user.name ?? '',
                            photoUrl: avatarData.avatarUrl ?? null,
                        },
                    }));
                } catch (error) {
                    console.error('Erro ao carregar avatar do terapeuta:', error);
                    setFormState((prev) => ({
                        ...prev,
                        therapist: {
                            id: user.id,
                            name: user.name ?? '',
                            photoUrl: null,
                        },
                    }));
                }
            }
        };

        loadTherapistAvatar();
    }, [user]);

    // Pré-preencher paciente se vier da URL
    useEffect(() => {
        const patientId = searchParams.get('patientId');
        if (patientId) {
            // TODO: carregar dados completos do paciente via API
            setFormState((prev) => ({ 
                ...prev, 
                patient: { 
                    id: patientId, 
                    name: 'Carregando...', 
                    photoUrl: null 
                } 
            }));
        }
    }, [searchParams]);

    const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormState((prev) => ({ ...prev, [field]: value }));
        setIsDirty(true);
        // Limpar erro do campo quando usuário digitar
        if (errors[field as keyof FormErrors]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formState.patient) {
            newErrors.patient = 'Selecione um paciente.';
        }

        if (!formState.goalTitle.trim()) {
            newErrors.goalTitle = 'Informe um título para o objetivo.';
        }

        if (!formState.achieved) {
            newErrors.achieved = 'Selecione o resultado (Sim/Não/Parcial/N.A.).';
        }

        if (formState.performanceNotes.trim().length < 10) {
            newErrors.performanceNotes = 'Descreva o desempenho (mín. 10 caracteres).';
        }

        const freq = parseInt(formState.frequency, 10);
        if (formState.frequency && (isNaN(freq) || freq < 0)) {
            newErrors.frequency = 'Use um número inteiro maior ou igual a zero.';
        }

        const dur = parseInt(formState.durationMin, 10);
        if (formState.durationMin && (isNaN(dur) || dur < 0)) {
            newErrors.durationMin = 'Use um número inteiro maior ou igual a zero.';
        }

        // Validar arquivos
        const maxSize = 5 * 1024 * 1024; // 5 MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (formState.attachments.length > 5) {
            newErrors.attachments = 'Máximo 5 arquivos.';
        }
        for (const file of formState.attachments) {
            if (!allowedTypes.includes(file.type)) {
                newErrors.attachments = 'Tipo ou tamanho de arquivo não permitido.';
                break;
            }
            if (file.size > maxSize) {
                newErrors.attachments = 'Tipo ou tamanho de arquivo não permitido.';
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error('Corrija os erros antes de salvar.');
            return;
        }

        setIsSaving(true);

        try {
            const payload: ToSessionPayload = {
                area: 'TO',
                patientId: formState.patient!.id,
                programId: formState.programId,
                date: formState.date,
                therapistId: formState.therapist?.id || null,
                goalTitle: formState.goalTitle.trim(),
                achieved: formState.achieved!,
                frequency: formState.frequency ? parseInt(formState.frequency, 10) : null,
                durationMin: formState.durationMin ? parseInt(formState.durationMin, 10) : null,
                performanceNotes: formState.performanceNotes.trim(),
                clinicalNotes: formState.clinicalNotes.trim() || null,
                documentType: formState.documentType || null,
                attachments: formState.attachments,
                notes: formState.clinicalNotes.trim() || undefined,
            };

            const response = await toSessionsService.save(payload);

            toast.success(response.message || 'Sessão registrada com sucesso.');
            setIsDirty(false);

            // Redirecionar
            if (formState.programId) {
                navigate(`/app/programas/${formState.programId}`);
            } else {
                navigate(toConfig.routes.listSessions);
            }
        } catch (error) {
            console.error('Erro ao salvar sessão TO:', error);
            toast.error('Não foi possível salvar. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            if (window.confirm('Descartar alterações?')) {
                navigate(toConfig.routes.hub);
            }
        } else {
            navigate(toConfig.routes.hub);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        updateField('attachments', [...formState.attachments, ...files]);
    };

    const removeFile = (index: number) => {
        const newFiles = formState.attachments.filter((_, i) => i !== index);
        updateField('attachments', newFiles);
    };

    const isValid = !errors.patient && 
                    !errors.goalTitle && 
                    !errors.achieved && 
                    !errors.performanceNotes &&
                    formState.patient &&
                    formState.goalTitle.trim() &&
                    formState.achieved &&
                    formState.performanceNotes.trim().length >= 10;

    return (
        <div className="flex flex-col min-h-full w-full p-0 sm:p-0 pt-0 sm:py-4">
            {/* Main Content */}
            <main className="flex-1 px-1 sm:px-3 pb-60 sm:pb-30 w-full pt-4">
                <div className="space-y-4 md:max-w-none mx-auto">
                    {/* Cabeçalho com Cliente e Terapeuta - Seguindo padrão do sistema */}
                    <HeaderInfo
                        patient={formState.patient}
                        therapist={formState.therapist}
                        programName="" // Não usado em sessão
                        createdAt={formState.date}
                        prazoInicio="" // Não usado em sessão
                        prazoFim="" // Não usado em sessão
                        onPatientSelect={(patient: Patient | null) => {
                            updateField('patient', patient);
                            setIsDirty(true);
                        }}
                        onTherapistSelect={(therapist: Therapist | null) => {
                            updateField('therapist', therapist);
                            setIsDirty(true);
                        }}
                        onProgramNameChange={() => {}} // Não usado
                        onPrazoInicioChange={() => {}} // Não usado
                        onPrazoFimChange={() => {}} // Não usado
                    />

                    {/* Bloco B — Objetivo */}
                    <Card className="rounded-[5px] px-6 py-4 md:px-8 md:py-10 lg:px-8 lg:py-6">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Objetivo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="">
                            <div className="space-y-2">
                                <Label htmlFor="goal-title" className="font-medium">
                                    Título do objetivo <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="goal-title"
                                    value={formState.goalTitle}
                                    onChange={(e) => updateField('goalTitle', e.target.value)}
                                    placeholder="Ex.: Melhorar coordenação para abotoar camisa"
                                    className="rounded-[5px]"
                                    aria-invalid={!!errors.goalTitle}
                                    aria-describedby={errors.goalTitle ? 'goal-title-error' : 'goal-title-helper'}
                                />
                                <p id="goal-title-helper" className="text-xs text-muted-foreground">
                                    Descreva de forma clara o objetivo trabalhado nesta sessão.
                                </p>
                                {errors.goalTitle && (
                                    <p id="goal-title-error" className="text-xs text-destructive" role="alert">
                                        {errors.goalTitle}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bloco C — Parâmetros clínicos TO */}
                    <Card className="rounded-[5px] px-6 py-4 md:px-8 md:py-10 lg:px-8 lg:py-6">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Parâmetros clínicos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="">
                            {/* Grid com 2 colunas no desktop */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                                {/* Coluna esquerda: Cliente conseguiu realizar o objetivo? */}
                                <div className="space-y-2">
                                    <Label className="font-medium">
                                        O cliente conseguiu realizar o objetivo? <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex items-center gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="achieved"
                                                value="sim"
                                                checked={formState.achieved === 'sim'}
                                                onChange={(e) => updateField('achieved', e.target.value as ToAchieved)}
                                                className="w-4 h-4 text-primary"
                                                aria-invalid={!!errors.achieved}
                                            />
                                            <span className="text-sm">Sim</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="achieved"
                                                value="nao"
                                                checked={formState.achieved === 'nao'}
                                                onChange={(e) => updateField('achieved', e.target.value as ToAchieved)}
                                                className="w-4 h-4 text-primary"
                                                aria-invalid={!!errors.achieved}
                                            />
                                            <span className="text-sm">Não</span>
                                        </label>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Selecione a opção mais fiel ao desempenho de hoje.
                                    </p>
                                    {errors.achieved && (
                                        <p className="text-xs text-destructive" role="alert">
                                            {errors.achieved}
                                        </p>
                                    )}
                                </div>

                                {/* Coluna direita: Frequência */}
                                <div className="space-y-2">
                                    <Label htmlFor="frequency" className="font-medium">
                                        Quantas vezes foi feito? <span className="font-normal text-muted-foreground">Frêquencia</span>
                                    </Label>
                                    <Input
                                        id="frequency"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formState.frequency}
                                        onChange={(e) => updateField('frequency', e.target.value)}
                                        placeholder="0"
                                        className="rounded-[5px]"
                                        aria-invalid={!!errors.frequency}
                                        aria-describedby="frequency-helper"
                                    />
                                    <p id="frequency-helper" className="text-xs text-muted-foreground">
                                        Helper text goes here
                                    </p>
                                    {errors.frequency && (
                                        <p className="text-xs text-destructive" role="alert">
                                            {errors.frequency}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Descrição do desempenho — full width */}
                            <div className="space-y-2">
                                <Label htmlFor="performance-notes" className="font-medium">
                                    Descrição do desempenho
                                </Label>
                                <Textarea
                                    id="performance-notes"
                                    value={formState.performanceNotes}
                                    onChange={(e) => updateField('performanceNotes', e.target.value)}
                                    placeholder="Descreva como o cliente executou a atividade, incluindo assistências necessárias, pausas e observações relevantes"
                                    rows={4}
                                    className="rounded-[5px]"
                                    aria-invalid={!!errors.performanceNotes}
                                    aria-describedby={errors.performanceNotes ? 'performance-notes-error' : 'performance-notes-helper'}
                                />
                                <div className="flex justify-between items-center">
                                    <p id="performance-notes-helper" className="text-xs text-muted-foreground">
                                        {formState.performanceNotes.length}/1000 caracteres
                                    </p>
                                </div>
                                {errors.performanceNotes && (
                                    <p id="performance-notes-error" className="text-xs text-destructive" role="alert">
                                        {errors.performanceNotes}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bloco D — Duração e Desempenho */}
                    <Card className="rounded-[5px] px-6 py-4 md:px-8 md:py-10 lg:px-8 lg:py-6">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Duração da atividade
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="duration" className="font-medium">
                                    Quanto tempo o cliente fez o objetivo? <span className="font-normal text-muted-foreground">Minutos</span>
                                </Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={formState.durationMin}
                                    onChange={(e) => updateField('durationMin', e.target.value)}
                                    placeholder="0"
                                    className="rounded-[5px]"
                                    aria-invalid={!!errors.durationMin}
                                    aria-describedby="duration-helper"
                                />
                                <p id="duration-helper" className="text-xs text-muted-foreground">
                                    Tempo descrito em minutos
                                </p>
                                {errors.durationMin && (
                                    <p className="text-xs text-destructive" role="alert">
                                        {errors.durationMin}
                                    </p>
                                )}
                            </div>

                            {/* Descrição do desempenho */}
                            <div className="space-y-2">
                                <Label htmlFor="performance-notes" className="font-medium">
                                    Descrição do desempenho
                                </Label>
                                <Textarea
                                    id="performance-notes"
                                    value={formState.performanceNotes}
                                    onChange={(e) => updateField('performanceNotes', e.target.value)}
                                    placeholder="Descreva como o cliente executou a atividade, incluindo assistências necessárias, pausas e observações relevantes"
                                    rows={4}
                                    className="rounded-[5px]"
                                    aria-invalid={!!errors.performanceNotes}
                                    aria-describedby={errors.performanceNotes ? 'performance-notes-error' : 'performance-notes-helper'}
                                />
                                <div className="flex justify-between items-center">
                                    <p id="performance-notes-helper" className="text-xs text-muted-foreground">
                                        {formState.performanceNotes.length}/1000 caracteres
                                    </p>
                                </div>
                                {errors.performanceNotes && (
                                    <p id="performance-notes-error" className="text-xs text-destructive" role="alert">
                                        {errors.performanceNotes}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bloco E — Outras observações clínicas */}
                    <Card className="rounded-[5px] px-6 py-4 md:px-8 md:py-10 lg:px-8 lg:py-6">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileEdit className="h-4 w-4" />
                                Outras observações clínicas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="">
                            <div className="space-y-2">
                                <Textarea
                                    id="clinical-notes"
                                    value={formState.clinicalNotes}
                                    onChange={(e) => updateField('clinicalNotes', e.target.value)}
                                    placeholder="Registre informações adicionais relevantes sobre o atendimento, como reações emocionais, dificuldades específicas, interações ou quaisquer observações que complementem o registro"
                                    rows={4}
                                    className="rounded-[5px]"
                                />
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-muted-foreground">
                                        {formState.clinicalNotes.length}/1000 caracteres
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bloco F — Documentos */}
                    <Card className="rounded-[5px] px-6 py-4 md:px-8 md:py-10 lg:px-8 lg:py-6">
                        <CardHeader className="pb-2 sm:pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Documentos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="document-type" className="font-medium">Tipo de documento</Label>
                                <Select
                                    value={formState.documentType}
                                    onValueChange={(val) => updateField('documentType', val)}
                                >
                                    <SelectTrigger id="document-type" className="rounded-[5px]">
                                        <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="laudo">Laudo</SelectItem>
                                        <SelectItem value="avaliacao">Avaliação</SelectItem>
                                        <SelectItem value="prescricao">Prescrição</SelectItem>
                                        <SelectItem value="termo">Termo</SelectItem>
                                        <SelectItem value="outro">Outro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="upload" className="font-medium">Upload</Label>
                                <div className="border-2 border-dashed border-muted rounded-[5px] p-6 text-center">
                                    <Input
                                        id="upload"
                                        type="file"
                                        multiple
                                        accept="application/pdf,image/jpeg,image/png"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="upload"
                                        className="cursor-pointer text-sm text-muted-foreground"
                                    >
                                        Clique ou arraste o arquivo aqui
                                        <br />
                                        <span className="text-xs">PDF, imagens. Até 5 arquivos. Máx. 5 MB cada.</span>
                                    </label>
                                </div>
                                {errors.attachments && (
                                    <p className="text-xs text-destructive" role="alert">
                                        {errors.attachments}
                                    </p>
                                )}

                                {/* Lista de arquivos */}
                                {formState.attachments.length > 0 && (
                                    <ul className="space-y-2 mt-4">
                                        {formState.attachments.map((file, idx) => (
                                            <li
                                                key={idx}
                                                className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                                            >
                                                <span className="truncate">{file.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(idx)}
                                                    aria-label={`Remover ${file.name}`}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            {/* SaveBar fixa - Seguindo padrão do sistema */}
            <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg z-20">
                <div className="container max-w-5xl mx-auto flex gap-3 justify-end">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isValid || isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                Salvando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Salvar sessão
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
