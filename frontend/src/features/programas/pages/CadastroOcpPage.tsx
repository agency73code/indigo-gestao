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

export default function CadastroOcpPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Estados do formulário
    const [formState, setFormState] = useState<FormState>({
        patient: null,
        therapist: null,
        programName: '',
        goalTitle: '',
        goalDescription: '',
        stimuli: [],
        criteria: '',
        notes: '',
        createdAt: new Date().toISOString(),
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
                        console.error('Erro ao carregar paciente:', error);
                        // Se não encontrar, mas tiver nome, criar um objeto básico
                        if (patientName) {
                            toast.warning(
                                'Paciente pré-selecionado não encontrado. Selecione novamente.',
                            );
                        }
                    }
                }

                // Pré-selecionar terapeuta se passado na URL
                if (therapistId) {
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
                        description: '',
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
                description: '',
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
            errors.patientId = 'Selecione um paciente';
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
                criteria: formState.criteria.trim() || null,
                notes: formState.notes.trim() || null,
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
                <main className="flex-1 px-4 sm:px-6 pb-32 w-full">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-40 bg-muted rounded-lg animate-pulse"></div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full w-full">
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-6">
                <div className="space-y-2">
                    <h1
                        style={{ fontFamily: 'Sora, sans-serif' }}
                        className="text-xl sm:text-2xl font-semibold text-primary leading-tight"
                    >
                        Novo Programa OCP
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                        Crie um programa de treino personalizado para o paciente
                    </p>
                </div>
            </div>

            {/* Conteúdo principal */}
            <main className="flex-1 px-4 sm:px-6 pb-32 w-full">
                <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Informações do cabeçalho */}
                    <HeaderInfo
                        patient={formState.patient}
                        therapist={formState.therapist}
                        programName={formState.programName}
                        createdAt={formState.createdAt}
                        onPatientSelect={handlePatientSelect}
                        onTherapistSelect={handleTherapistSelect}
                        onProgramNameChange={handleProgramNameChange}
                    />

                    {/* Seção de objetivos */}
                    <GoalSection
                        goalTitle={formState.goalTitle}
                        goalDescription={formState.goalDescription}
                        onGoalTitleChange={handleGoalTitleChange}
                        onGoalDescriptionChange={handleGoalDescriptionChange}
                        errors={{ goalTitle: errors.goalTitle }}
                    />

                    {/* Lista de estímulos */}
                    <StimuliList
                        stimuli={formState.stimuli}
                        onChange={handleStimuliChange}
                        errors={{ stimuli: errors.stimuli }}
                    />

                    {/* Critérios de domínio */}
                    <CriteriaSection
                        criteria={formState.criteria}
                        onCriteriaChange={handleCriteriaChange}
                    />

                    {/* Observações gerais */}
                    <NotesSection notes={formState.notes} onNotesChange={handleNotesChange} />
                </div>
            </main>

            {/* Barra de salvamento */}
            <SaveBar
                onSave={() => handleSave(false)}
                onSaveAndStart={() => handleSave(true)}
                onCancel={handleCancel}
                isSaving={isSaving}
                canSave={canSave()}
                patientName={formState.patient?.name}
            />

            {/* Validação global se necessário */}
            {errors.general && (
                <div className="fixed top-4 right-4 z-50 bg-destructive text-destructive-foreground p-4 rounded-md shadow-lg">
                    {errors.general}
                </div>
            )}
        </div>
    );
}
