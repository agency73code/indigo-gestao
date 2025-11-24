import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
    HeaderInfo,
    GoalSection,
    StimuliList,
    CriteriaSection,
    CurrentPerformanceSection,
    NotesSection,
} from '../../cadastro-ocp';
import type {
    Patient,
    Therapist,
    StimulusInput,
    FormState,
    ValidationErrors,
    CreateProgramInput,
    BaseProgramPageConfig,
} from '../types';

export interface BaseCadastroProgramaPageProps {
    config: BaseProgramPageConfig;
    onFetchPatient: (id: string) => Promise<Patient>;
    onFetchTherapist: (id: string) => Promise<Therapist>;
    onCreateProgram: (data: CreateProgramInput) => Promise<{ id: string }>;
    onFetchTherapistAvatar?: (therapistId: string) => Promise<string | null>;
    detailRoute: (programId: string) => string;
    newSessionRoute?: (programId: string, patientId: string) => string;
    listRoute?: string;
}

export function BaseCadastroProgramaPage({
    config,
    onFetchPatient,
    onFetchTherapist,
    onCreateProgram,
    onFetchTherapistAvatar,
    detailRoute,
    newSessionRoute,
    listRoute = '/app/programas',
}: BaseCadastroProgramaPageProps) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();
    const { user } = useAuth();

    useEffect(() => {
        setPageTitle(config.pageTitle);
    }, [setPageTitle, config.pageTitle]);

    const [formState, setFormState] = useState<FormState>({
        patient: null,
        therapist: null,
        programName: '',
        goalTitle: '',
        goalDescription: '',
        shortTermGoalDescription: '',
        stimuli: [],
        stimuliApplicationDescription: '',
        criteria: '',
        currentPerformanceLevel: '',
        notes: '',
        createdAt: new Date().toISOString(),
        prazoInicio: '',
        prazoFim: '',
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Carregar terapeuta logado automaticamente
    useEffect(() => {
        const loadLoggedTherapist = async () => {
            if (user?.id) {
                try {
                    const therapist = await onFetchTherapist(user.id);
                    let photoUrl = therapist.photoUrl;

                    // Buscar avatar customizado se disponível
                    if (onFetchTherapistAvatar) {
                        try {
                            photoUrl = await onFetchTherapistAvatar(user.id);
                        } catch (err) {
                            console.warn('Erro ao carregar avatar:', err);
                        }
                    }

                    setFormState((prev) => ({
                        ...prev,
                        therapist: { ...therapist, photoUrl },
                    }));
                } catch (error) {
                    console.error('Erro ao carregar terapeuta logado:', error);
                    // Fallback: usar dados básicos do usuário
                    setFormState((prev) => ({
                        ...prev,
                        therapist: {
                            id: user.id,
                            name: user.name ?? 'Terapeuta',
                            photoUrl: user.avatar_url ?? null,
                            especialidade: null,
                        },
                    }));
                }
            }
        };

        loadLoggedTherapist();
    }, [user, onFetchTherapist, onFetchTherapistAvatar]);

    // Carregar dados iniciais da URL
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const patientId = searchParams.get('patientId');
                const patientName = searchParams.get('patientName');

                if (patientId) {
                    try {
                        const patient = await onFetchPatient(patientId);
                        setFormState((prev) => ({ ...prev, patient }));
                    } catch (error) {
                        console.error('Erro ao carregar cliente:', error);
                        if (patientName) {
                            toast.warning('Cliente pré-selecionado não encontrado. Selecione novamente.');
                        }
                    }
                }

                // Adicionar estímulo inicial se não houver nenhum
                if (formState.stimuli.length === 0) {
                    const initialStimulus: StimulusInput = {
                        id: `stimulus_${Date.now()}`,
                        label: '',
                        active: true,
                        order: 1,
                    };
                    setFormState((prev) => ({ ...prev, stimuli: [initialStimulus] }));
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [searchParams, onFetchPatient]);

    // Inicializar com primeiro estímulo vazio
    useEffect(() => {
        if (formState.stimuli.length === 0 && !isLoading) {
            const initialStimulus: StimulusInput = {
                id: `stimulus_${Date.now()}`,
                label: '',
                active: true,
                order: 1,
            };
            setFormState((prev) => ({ ...prev, stimuli: [initialStimulus] }));
        }
    }, [formState.stimuli.length, isLoading]);

    // Validação
    const validateForm = (): ValidationErrors => {
        const errors: ValidationErrors = {};

        if (!formState.patient) {
            errors.patientId = 'Selecione um cliente';
        }

        if (!formState.therapist) {
            errors.therapistId = 'Selecione um terapeuta';
        }

        if (!formState.prazoInicio) {
            errors.prazoInicio = 'Selecione a data de início';
        }

        if (!formState.prazoFim) {
            errors.prazoFim = 'Selecione a data de fim';
        }

        if (!formState.programName.trim()) {
            errors.programName = 'Nome do objetivo geral é obrigatório';
        }

        if (!formState.goalTitle.trim()) {
            errors.goalTitle = 'Título do objetivo é obrigatório';
        } else if (formState.goalTitle.trim().length < 3) {
            errors.goalTitle = 'Título deve ter pelo menos 3 caracteres';
        }

        if (formState.stimuli.length === 0) {
            errors.stimuli = 'Adicione pelo menos um estímulo';
        } else {
            const hasEmptyLabel = formState.stimuli.some((s) => !s.label.trim());
            if (hasEmptyLabel) {
                errors.stimuli = 'Todos os estímulos devem ter um nome';
            }
        }

        return errors;
    };

    // Handlers
    const handlePatientSelect = (patient: Patient | null) => {
        setFormState((prev) => ({ ...prev, patient }));
        if (errors.patientId) {
            setErrors((prev) => ({ ...prev, patientId: undefined }));
        }
    };

    const handleTherapistSelect = (therapist: Therapist | null) => {
        setFormState((prev) => ({ ...prev, therapist }));
        if (errors.therapistId) {
            setErrors((prev) => ({ ...prev, therapistId: undefined }));
        }
    };

    const handleProgramNameChange = (name: string) => {
        setFormState((prev) => ({ ...prev, programName: name }));
        if (errors.programName && name.trim()) {
            setErrors((prev) => ({ ...prev, programName: undefined }));
        }
    };

    const handleGoalTitleChange = (title: string) => {
        setFormState((prev) => ({ ...prev, goalTitle: title }));
        if (errors.goalTitle) {
            setErrors((prev) => ({ ...prev, goalTitle: undefined }));
        }
    };

    const handleGoalDescriptionChange = (description: string) => {
        setFormState((prev) => ({ ...prev, goalDescription: description }));
        if (errors.goalDescription && description.trim()) {
            setErrors((prev) => ({ ...prev, goalDescription: undefined }));
        }
    };

    const handleStimuliChange = (stimuli: StimulusInput[]) => {
        setFormState((prev) => ({ ...prev, stimuli }));
        if (errors.stimuli) {
            setErrors((prev) => ({ ...prev, stimuli: undefined }));
        }
    };

    const handleStimuliApplicationDescriptionChange = (description: string) => {
        setFormState((prev) => ({ ...prev, stimuliApplicationDescription: description }));
    };

    const handleCriteriaChange = (criteria: string) => {
        setFormState((prev) => ({ ...prev, criteria }));
    };

    const handleNotesChange = (notes: string) => {
        setFormState((prev) => ({ ...prev, notes }));
    };

    const handleCurrentPerformanceLevelChange = (currentPerformanceLevel: string) => {
        setFormState((prev) => ({ ...prev, currentPerformanceLevel }));
    };

    const handleSave = async (startSession = false) => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error('Complete os campos obrigatórios antes de salvar');
            return;
        }

        setIsSaving(true);
        setErrors({});

        try {
            const payload: CreateProgramInput = {
                patientId: formState.patient!.id,
                therapistId: formState.therapist!.id,
                name: formState.programName.trim() || null,
                prazoInicio: formState.prazoInicio.trim() || undefined,
                prazoFim: formState.prazoFim.trim() || undefined,
                goalTitle: formState.goalTitle.trim(),
                goalDescription: formState.goalDescription.trim() || null,
                criteria: formState.criteria.trim() || null,
                currentPerformanceLevel: formState.currentPerformanceLevel.trim() || null,
                shortTermGoalDescription: formState.shortTermGoalDescription.trim() || null,
                stimuliApplicationDescription: formState.stimuliApplicationDescription.trim() || null,
                stimuli: formState.stimuli.filter((s) => s.label.trim()),
                notes: formState.notes.trim() || null,
            };

            const result = await onCreateProgram(payload);
            toast.success(config.messages.saveSuccess);

            if (startSession && newSessionRoute) {
                navigate(newSessionRoute(result.id, formState.patient!.id));
            } else {
                navigate(detailRoute(result.id));
            }
        } catch (err) {
            console.error('Erro ao salvar programa:', err);
            const errorMessage = err instanceof Error ? err.message : config.messages.saveError;
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        const hasChanges =
            formState.patient ||
            formState.therapist ||
            formState.programName.trim() ||
            formState.goalTitle.trim() ||
            formState.goalDescription.trim() ||
            formState.shortTermGoalDescription.trim() ||
            formState.stimuli.some((s) => s.label.trim()) ||
            formState.criteria.trim() ||
            formState.notes.trim();

        if (hasChanges) {
            const confirmLeave = window.confirm(config.messages.confirmLeave);
            if (!confirmLeave) return;
        }

        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(listRoute);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-full w-full">
                <div className="px-4 sm:px-6 py-4 sm:py-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
                <main className="flex-1 px-4 sm:px-6 pb-56 w-full">
                    <div className="space-y-4 max-w-4xl md:max-w-none mx-auto">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full w-full p-0 sm:p-0 pt-">
            <main className="flex-1 px-1 sm:px-4 py-4 w-full">
                <div className="space-y-4 md:max-w-none mx-auto">   
                    <HeaderInfo
                        patient={formState.patient}
                        therapist={formState.therapist}
                        programName={formState.programName}
                        createdAt={formState.createdAt}
                        prazoInicio={formState.prazoInicio}
                        prazoFim={formState.prazoFim}
                        onPatientSelect={handlePatientSelect}
                        onTherapistSelect={handleTherapistSelect}
                        onProgramNameChange={handleProgramNameChange}
                        onPrazoInicioChange={(date) => {
                            setFormState((prev) => ({ ...prev, prazoInicio: date }));
                            if (errors.prazoInicio && date) {
                                setErrors((prev) => ({ ...prev, prazoInicio: undefined }));
                            }
                        }}
                        onPrazoFimChange={(date) => {
                            setFormState((prev) => ({ ...prev, prazoFim: date }));
                            if (errors.prazoFim && date) {
                                setErrors((prev) => ({ ...prev, prazoFim: undefined }));
                            }
                        }}
                        readOnlyTherapist={true}
                        programInfoTitle={config.sectionTitles?.programInfo}
                        errors={{
                            patientId: errors.patientId,
                            therapistId: errors.therapistId,
                            programName: errors.programName,
                            prazoInicio: errors.prazoInicio,
                            prazoFim: errors.prazoFim,
                        }}
                    />

                    <GoalSection
                        goalTitle={formState.goalTitle}
                        goalDescription={formState.goalDescription}
                        onGoalTitleChange={handleGoalTitleChange}
                        onGoalDescriptionChange={handleGoalDescriptionChange}
                        customTitle={config.sectionTitles?.goal}
                        errors={{ goalTitle: errors.goalTitle }}
                    />

                    {(config.features?.showCriteria ?? true) && (
                        <CriteriaSection
                            criteria={formState.criteria}
                            onCriteriaChange={handleCriteriaChange}
                            customTitle={config.sectionTitles?.criteria}
                        />
                    )}

                    {(config.features?.showCurrentPerformance ?? false) && (
                        <CurrentPerformanceSection
                            currentPerformanceLevel={formState.currentPerformanceLevel}
                            onCurrentPerformanceLevelChange={handleCurrentPerformanceLevelChange}
                            customTitle={config.sectionTitles?.currentPerformance}
                        />
                    )}

                    <StimuliList
                        stimuli={formState.stimuli}
                        stimuliApplicationDescription={formState.stimuliApplicationDescription}
                        shortTermGoalDescription={formState.shortTermGoalDescription}
                        onChange={handleStimuliChange}
                        onApplicationDescriptionChange={handleStimuliApplicationDescriptionChange}
                        onShortTermGoalDescriptionChange={(desc) =>
                            setFormState((prev) => ({ ...prev, shortTermGoalDescription: desc }))
                        }
                        showDescription={config.features?.showStimulusDescription ?? false}
                        showApplicationDescription={config.features?.showStimuliApplication ?? true}
                        customTitle={config.sectionTitles?.stimuli}
                        errors={{ stimuli: errors.stimuli }}
                    />

                    <NotesSection 
                        notes={formState.notes} 
                        onNotesChange={handleNotesChange}
                        customTitle={config.sectionTitles?.notes}
                    />
                </div>
            </main>

            <div className="bg-background border-t">
                <div className="px-4 py-4 sm:px-6">
                    <div className="max-w-lg mx-auto flex items-center justify-end gap-3">
                        <Button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="h-11 rounded-full gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {config.buttons.save}
                                </>
                            )}
                        </Button>

                        {newSessionRoute && (
                            <Button
                                onClick={() => handleSave(true)}
                                disabled={isSaving}
                                variant="secondary"
                                className="h-11 rounded-full gap-2"
                            >
                                <Play className="h-4 w-4" />
                                {config.buttons.saveAndStart}
                            </Button>
                        )}

                        <Button
                            onClick={handleCancel}
                            variant="ghost"
                            disabled={isSaving}
                            className="h-11 rounded-full gap-2"
                        >
                            <X className="h-4 w-4" />
                            {config.buttons.cancel}
                        </Button>
                    </div>
                </div>
            </div>

            {errors.general && (
                <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg">
                    {errors.general}
                </div>
            )}
        </div>
    );
}
