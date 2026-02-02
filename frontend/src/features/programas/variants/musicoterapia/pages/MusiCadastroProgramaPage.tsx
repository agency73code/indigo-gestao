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
    CriteriaSection,
    NotesSection,
} from '../../../cadastro-ocp';
import MusiStimuliEditor from '../components/MusiStimuliEditor';
import { musiProgramConfig, musiRoutes } from '../config';
import {
    fetchMusiPatientById,
    fetchMusiTherapistById,
    fetchMusiTherapistAvatar,
    createMusiProgram,
} from '../services';
import { musiStimulusToApi, type MusiStimulus } from '../types';
import type { Patient, Therapist } from '../../../core/types';

// Estado do formulário específico de Musicoterapia
interface MusiFormState {
    patient: Patient | null;
    therapist: Therapist | null;
    programName: string;
    goalTitle: string;
    goalDescription: string;
    shortTermGoalDescription: string;
    stimuli: MusiStimulus[];  // Usa MusiStimulus específico
    stimuliApplicationDescription: string;
    criteria: string;
    notes: string;
    createdAt: string;
    prazoInicio: string;
    prazoFim: string;
}

interface ValidationErrors {
    patientId?: string;
    therapistId?: string;
    programName?: string;
    goalTitle?: string;
    goalDescription?: string;
    stimuli?: string;
    general?: string;
    prazoInicio?: string;
    prazoFim?: string;
}

/**
 * Página de Cadastro de Programa para Musicoterapia
 * Versão customizada que usa MusiStimuliEditor com campos específicos:
 * - Objetivo
 * - Objetivo Específico
 * - Métodos
 * - Técnicas/Procedimentos
 */
export default function MusiCadastroProgramaPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setPageTitle } = usePageTitle();
    const { user } = useAuth();

    useEffect(() => {
        setPageTitle(musiProgramConfig.pageTitle);
    }, [setPageTitle]);

    const [formState, setFormState] = useState<MusiFormState>({
        patient: null,
        therapist: null,
        programName: '',
        goalTitle: '',
        goalDescription: '',
        shortTermGoalDescription: '',
        stimuli: [],
        stimuliApplicationDescription: '',
        criteria: '',
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
                    const therapist = await fetchMusiTherapistById(user.id);
                    let photoUrl = therapist.photoUrl;

                    // Buscar avatar customizado se disponível
                    try {
                        photoUrl = await fetchMusiTherapistAvatar(user.id);
                    } catch (err) {
                        console.warn('Erro ao carregar avatar:', err);
                    }

                    setFormState((prev) => ({
                        ...prev,
                        therapist: { ...therapist, photoUrl },
                    }));
                } catch (error) {
                    console.error('Erro ao carregar terapeuta logado:', error);
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
    }, [user]);

    // Carregar dados iniciais da URL
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const patientId = searchParams.get('patientId');
                const patientName = searchParams.get('patientName');

                if (patientId) {
                    try {
                        const patient = await fetchMusiPatientById(patientId);
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
                    const initialStimulus: MusiStimulus = {
                        objetivo: '',
                        objetivoEspecifico: '',
                        metodos: '',
                        tecnicasProcedimentos: '',
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
    }, [searchParams]);

    // Inicializar com primeiro estímulo vazio
    useEffect(() => {
        if (formState.stimuli.length === 0 && !isLoading) {
            const initialStimulus: MusiStimulus = {
                objetivo: '',
                objetivoEspecifico: '',
                metodos: '',
                tecnicasProcedimentos: '',
                active: true,
                order: 1,
            };
            setFormState((prev) => ({ ...prev, stimuli: [initialStimulus] }));
        }
    }, [formState.stimuli.length, isLoading]);

    // Validação
    const validateForm = (): ValidationErrors => {
        const validationErrors: ValidationErrors = {};

        if (!formState.patient) {
            validationErrors.patientId = 'Selecione um cliente';
        }

        if (!formState.therapist) {
            validationErrors.therapistId = 'Selecione um terapeuta';
        }

        if (!formState.prazoInicio) {
            validationErrors.prazoInicio = 'Selecione a data de início';
        }

        if (!formState.prazoFim) {
            validationErrors.prazoFim = 'Selecione a data de fim';
        }

        if (!formState.programName.trim()) {
            validationErrors.programName = 'Nome do objetivo geral é obrigatório';
        }

        if (!formState.goalTitle.trim()) {
            validationErrors.goalTitle = 'Título do objetivo é obrigatório';
        } else if (formState.goalTitle.trim().length < 3) {
            validationErrors.goalTitle = 'Título deve ter pelo menos 3 caracteres';
        }

        if (formState.stimuli.length === 0) {
            validationErrors.stimuli = 'Adicione pelo menos um objetivo específico';
        } else {
            const hasEmptyObjetivo = formState.stimuli.some((s) => !s.objetivo.trim());
            if (hasEmptyObjetivo) {
                validationErrors.stimuli = 'Todos os objetivos específicos devem ter um objetivo preenchido';
            }
        }

        return validationErrors;
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
    };

    const handleStimuliChange = (stimuli: MusiStimulus[]) => {
        setFormState((prev) => ({ ...prev, stimuli }));
        if (errors.stimuli) {
            setErrors((prev) => ({ ...prev, stimuli: undefined }));
        }
    };

    const handleCriteriaChange = (criteria: string) => {
        setFormState((prev) => ({ ...prev, criteria }));
    };

    const handleNotesChange = (notes: string) => {
        setFormState((prev) => ({ ...prev, notes }));
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
            // Converte MusiStimulus para formato da API
            const stimuliForApi = formState.stimuli
                .filter((s) => s.objetivo.trim())
                .map((s) => musiStimulusToApi(s));

            const payload = {
                patientId: formState.patient!.id,
                therapistId: formState.therapist!.id,
                name: formState.programName.trim() || null,
                prazoInicio: formState.prazoInicio.trim() || undefined,
                prazoFim: formState.prazoFim.trim() || undefined,
                goalTitle: formState.goalTitle.trim(),
                goalDescription: formState.goalDescription.trim() || null,
                criteria: formState.criteria.trim() || null,
                currentPerformanceLevel: null,
                shortTermGoalDescription: formState.shortTermGoalDescription.trim() || null,
                stimuliApplicationDescription: formState.stimuliApplicationDescription.trim() || null,
                stimuli: stimuliForApi,
                notes: formState.notes.trim() || null,
            };

            const result = await createMusiProgram(payload);
            toast.success(musiProgramConfig.messages.saveSuccess);

            if (startSession) {
                navigate(musiRoutes.newSession(result.id, formState.patient!.id));
            } else {
                navigate(musiRoutes.detail(result.id));
            }
        } catch (err) {
            console.error('Erro ao salvar programa:', err);
            const errorMessage = err instanceof Error ? err.message : musiProgramConfig.messages.saveError;
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
            formState.stimuli.some((s) => s.objetivo.trim()) ||
            formState.criteria.trim() ||
            formState.notes.trim();

        if (hasChanges) {
            const confirmLeave = window.confirm(musiProgramConfig.messages.confirmLeave);
            if (!confirmLeave) return;
        }

        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate(musiRoutes.list);
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
        <div className="flex flex-col min-h-full w-full p-0 sm:p-0">
            <main className="flex-1 px-1 sm:px-4 py-1 sm:py-4 w-full">
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
                        programInfoTitle={musiProgramConfig.sectionTitles?.programInfo}
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
                        customTitle={musiProgramConfig.sectionTitles?.goal}
                        errors={{ goalTitle: errors.goalTitle }}
                    />

                    {(musiProgramConfig.features?.showCriteria ?? true) && (
                        <CriteriaSection
                            criteria={formState.criteria}
                            onCriteriaChange={handleCriteriaChange}
                            customTitle={musiProgramConfig.sectionTitles?.criteria}
                        />
                    )}

                    {/* MusiStimuliEditor customizado para Musicoterapia */}
                    <MusiStimuliEditor
                        stimuli={formState.stimuli}
                        onStimuliChange={handleStimuliChange}
                        errors={{ stimuli: errors.stimuli }}
                    />

                    <NotesSection
                        notes={formState.notes}
                        onNotesChange={handleNotesChange}
                        customTitle={musiProgramConfig.sectionTitles?.notes}
                    />
                </div>
            </main>

            <div className="bg-background border-t">
                <div className="px-4 py-4 sm:px-6">
                    <div className="max-w-lg mx-auto flex items-center justify-end gap-2 sm:gap-3">
                        <Button
                            onClick={() => handleSave(false)}
                            disabled={isSaving}
                            className="h-10 sm:h-11 px-4 sm:px-6 rounded-full gap-2"
                        >
                            {isSaving ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    <span className="hidden sm:inline">Salvando...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 hidden sm:block" />
                                    <span className="hidden sm:inline">{musiProgramConfig.buttons.save}</span>
                                    <span className="sm:hidden">Salvar</span>
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={() => handleSave(true)}
                            disabled={isSaving}
                            variant="secondary"
                            className="h-10 w-10 sm:w-auto sm:h-11 sm:px-6 rounded-full gap-2 p-0 sm:p-3"
                        >
                            <Play className="h-4 w-4" />
                            <span className="hidden sm:inline">{musiProgramConfig.buttons.saveAndStart}</span>
                        </Button>

                        <Button
                            onClick={handleCancel}
                            variant="ghost"
                            disabled={isSaving}
                            className="h-10 w-10 sm:h-11 sm:w-auto sm:px-4 rounded-full gap-2 p-0 sm:p-3"
                        >
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline">{musiProgramConfig.buttons.cancel}</span>
                        </Button>
                    </div>
                </div>
            </div>

            {errors.general && (
                <div className="fixed top-4 right-4 z-50 bg-destructive text-white p-4 rounded-md shadow-lg">
                    {errors.general}
                </div>
            )}
        </div>
    );
}
