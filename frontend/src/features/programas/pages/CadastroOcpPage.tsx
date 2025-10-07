import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    HeaderInfo,
    GoalSection,
    StimuliList,
    CriteriaSection,
    NotesSection,
    SaveBar,
    fetchPatientById,
    fetchTherapistById,
    createProgram,
} from '../cadastro-ocp';
import type {
    Patient,
    Therapist,
    StimulusInput,
    FormState,
    ValidationErrors,
    CreateProgramInput,
} from '../cadastro-ocp';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function CadastroOcpPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Estado para controlar a visibilidade da SaveBar
    const [showSaveBar, setShowSaveBar] = useState(false);
    const { user } = useAuth();
    // Estados do formulário
    const [formState, setFormState] = useState<FormState>({
        patient: null,
        therapist: null,
        programName: '',
        goalTitle: '',
        goalDescription: '',
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

    useEffect(() => {
        if (user) {
            setFormState((prev) => ({
                ...prev,
                therapist: {
                    id: user.id,
                    name: user.name ?? '',
                    photoUrl: null,
                },
            }));
        }
    }, [user]);

    // Carregar dados iniciais da URL
    useEffect(() => {
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const patientId = searchParams.get('patientId');
                const therapistId = searchParams.get('therapistId');
                const patientName = searchParams.get('patientName');

                // Pré-selecionar paciente se passado na URL
                if (patientId) {
                    try {
                        const patient = await fetchPatientById(patientId);
                        setFormState((prev) => ({ ...prev, patient }));
                    } catch (error) {
                        console.error('Erro ao carregar cliente:', error);
                        // Se não encontrar, mas tiver nome, criar um objeto básico
                        if (patientName) {
                            toast.warning(
                                'Cliente pré-selecionado não encontrado. Selecione novamente.',
                            );
                        }
                    }
                }

                // Pré-selecionar terapeuta se passado na URL
                if (therapistId && !formState.therapist) {
                    try {
                        const therapist = await fetchTherapistById(therapistId);
                        setFormState((prev) => ({ ...prev, therapist }));
                    } catch (error) {
                        console.error('Erro ao carregar terapeuta:', error);
                        toast.warning(
                            'Terapeuta pré-selecionado não encontrado. Selecione novamente.',
                        );
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
    }, [searchParams]);

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

    // Controlar visibilidade da SaveBar baseado no scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;

            // Mostrar SaveBar quando estiver nos últimos 50% da página
            const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
            const shouldShow = scrollPercentage > 0.9;

            setShowSaveBar(shouldShow);
        };

        // Adicionar listener
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Verificar posição inicial (sempre mostrar se página for pequena)
        const isShortPage = document.documentElement.scrollHeight <= window.innerHeight * 1.5;
        if (isShortPage) {
            setShowSaveBar(true);
        } else {
            handleScroll();
        }

        // Cleanup
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Validação
    const validateForm = (): ValidationErrors => {
        const errors: ValidationErrors = {};

        if (!formState.patient) {
            errors.patientId = 'Selecione um cliente';
        }

        if (!formState.therapist) {
            errors.therapistId = 'Selecione um terapeuta';
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

    const canSave = () => {
        const validationErrors = validateForm();
        return Object.keys(validationErrors).length === 0;
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
                goalTitle: formState.goalTitle.trim(),
                goalDescription: formState.goalDescription.trim() || null,
                stimuli: formState.stimuli.filter((s) => s.label.trim()), // Remove estímulos vazios
                stimuliApplicationDescription:
                    formState.stimuliApplicationDescription.trim() || null,
                criteria: formState.criteria.trim() || null,
                notes: formState.notes.trim() || null,
                prazoInicio: formState.prazoInicio.trim() || undefined,
                prazoFim: formState.prazoFim.trim() || undefined,
            };

            const result = await createProgram(payload);

            toast.success('Programa criado com sucesso!');

            if (startSession) {
                // Navegar para nova sessão
                navigate(
                    `/app/programas/sessoes/nova?programaId=${result.id}&patientId=${formState.patient!.id}`,
                );
            } else {
                // Navegar para detalhes do programa
                navigate(`/app/programas/${result.id}`);
            }
        } catch (error) {
            console.error('Erro ao salvar programa:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Erro ao salvar programa. Tente novamente.',
            );
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
            formState.stimuli.some((s) => s.label.trim()) ||
            formState.criteria.trim() ||
            formState.notes.trim();

        if (hasChanges) {
            const confirmLeave = window.confirm(
                'Você tem alterações não salvas. Tem certeza que deseja sair?',
            );
            if (!confirmLeave) return;
        }

        // Voltar para página anterior ou programas
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/app/programas');
        }
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <div className="flex flex-col min-h-full w-full">
                <div className="px-4 sm:px-6 py-4 sm:py-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                </div>
                <main className="flex-1 px-4 sm:px-6 pb-56 w-full">
                    <div className="space-y-6 max-w-4xl md:max-w-none mx-auto">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full w-full p-0 sm:p-0 py-2 sm:py-4">
            {/* Header */}
            <div className="py-2">
                <div className="space-y-2 px-2 lg:px-4">
                    <h1
                        style={{ fontFamily: 'Sora, sans-serif' }}
                        className="text-xl sm:text-2xl font-semibold text-primary leading-tight"
                    >
                        Novo Programa / Objetivos
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Crie um programa / objetivo de treino personalizado para o cliente
                    </p>
                </div>
            </div>

            {/* Conteúdo principal */}
            <main className="flex-1 px-1 sm:px-3 pb-60 sm:pb-30 w-full">
                <div className="space-y-6 md:max-w-none mx-auto">
                    {/* Informações do cabeçalho */}
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
                        onPrazoInicioChange={(date) =>
                            setFormState((prev) => ({ ...prev, prazoInicio: date }))
                        }
                        onPrazoFimChange={(date) =>
                            setFormState((prev) => ({ ...prev, prazoFim: date }))
                        }
                    />

                    {/* Seção de objetivos */}
                    <GoalSection
                        goalTitle={formState.goalTitle}
                        goalDescription={formState.goalDescription}
                        onGoalTitleChange={handleGoalTitleChange}
                        onGoalDescriptionChange={handleGoalDescriptionChange}
                        errors={{ goalTitle: errors.goalTitle }}
                    />

                    {/* Critérios de domínio */}
                    <CriteriaSection
                        criteria={formState.criteria}
                        onCriteriaChange={handleCriteriaChange}
                    />
                    {/* Lista de estímulos */}
                    <StimuliList
                        stimuli={formState.stimuli}
                        stimuliApplicationDescription={formState.stimuliApplicationDescription}
                        goalDescription={formState.goalDescription}
                        onChange={handleStimuliChange}
                        onApplicationDescriptionChange={handleStimuliApplicationDescriptionChange}
                        onGoalDescriptionChange={handleGoalDescriptionChange}
                        errors={{ stimuli: errors.stimuli }}
                    />

                    {/* Observações gerais */}
                    <NotesSection notes={formState.notes} onNotesChange={handleNotesChange} />
                </div>
            </main>

            {/* Barra de salvamento com animação suave */}
            <div
                className={`fixed bottom-0 left-0 right-0 transition-all duration-700 ease-out ${
                    showSaveBar ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
                }`}
                style={{
                    transform: showSaveBar ? 'translateY(0)' : 'translateY(100%)',
                    transition:
                        'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out',
                }}
            >
                <SaveBar
                    onSave={() => handleSave(false)}
                    onSaveAndStart={() => handleSave(true)}
                    onCancel={handleCancel}
                    isSaving={isSaving}
                    canSave={canSave()}
                    patientName={formState.patient?.name}
                />
            </div>

            {/* Validação global se necessário */}
            {errors.general && (
                <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg">
                    {errors.general}
                </div>
            )}
        </div>
    );
}
