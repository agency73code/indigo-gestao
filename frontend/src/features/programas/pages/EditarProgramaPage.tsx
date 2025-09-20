import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
    HeaderInfo,
    GoalSection,
    StimuliEditor,
    CriteriaSection,
    NotesSection,
    StatusToggle,
    SaveBar,
    ValidationErrors,
} from '../editar-ocp';
import { fetchProgramById, updateProgram, createProgramVersion } from '../editar-ocp/services';
import type {
    ProgramDetail,
    UpdateProgramInput,
    ValidationErrors as ValidationErrorsType,
} from '../editar-ocp/types';

export default function EditarProgramaPage() {
    const { programaId } = useParams<{ programaId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get('patientId');

    const [program, setProgram] = useState<ProgramDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados do formulário
    const [goalTitle, setGoalTitle] = useState('');
    const [goalDescription, setGoalDescription] = useState('');
    const [stimuli, setStimuli] = useState<UpdateProgramInput['stimuli']>([]);
    const [criteria, setCriteria] = useState('');
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'active' | 'archived'>('active');

    // Estados de controle
    const [validationErrors, setValidationErrors] = useState<ValidationErrorsType>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingVersion, setIsCreatingVersion] = useState(false);

    const loadProgram = async () => {
        if (!programaId) {
            setError('ID do programa não encontrado.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const programData = await fetchProgramById(programaId);
            setProgram(programData);

            // Pré-preencher formulário
            setGoalTitle(programData.goalTitle);
            setGoalDescription(programData.goalDescription || '');
            setStimuli(
                programData.stimuli.map((s) => ({
                    id: s.id,
                    label: s.label,
                    description: s.description,
                    active: s.active,
                    order: s.order,
                })),
            );
            setCriteria(programData.criteria ?? '');
            setNotes(programData.notes ?? '');
            setStatus(programData.status);
        } catch (err) {
            console.error('Erro ao carregar programa:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): ValidationErrorsType => {
        const errors: ValidationErrorsType = {};

        // Validar título do objetivo
        if (!goalTitle.trim()) {
            errors.goalTitle = 'Título do objetivo é obrigatório';
        } else if (goalTitle.length > 120) {
            errors.goalTitle = 'Título deve ter no máximo 120 caracteres';
        }

        // Validar estímulos
        if (!stimuli || stimuli.length === 0) {
            errors.general = 'É necessário ter pelo menos um estímulo';
        } else {
            const stimuliErrors: { [index: number]: { label?: string; description?: string } } = {};

            stimuli.forEach((stimulus, index) => {
                const stimulusErrors: { label?: string; description?: string } = {};

                if (!stimulus.label.trim()) {
                    stimulusErrors.label = 'Nome do estímulo é obrigatório';
                } else if (stimulus.label.length > 60) {
                    stimulusErrors.label = 'Nome deve ter no máximo 60 caracteres';
                }

                if (stimulus.description && stimulus.description.length > 1000) {
                    stimulusErrors.description = 'Descrição deve ter no máximo 1000 caracteres';
                }

                if (Object.keys(stimulusErrors).length > 0) {
                    stimuliErrors[index] = stimulusErrors;
                }
            });

            if (Object.keys(stimuliErrors).length > 0) {
                errors.stimuli = stimuliErrors;
            }
        }

        return errors;
    };

    const handleSave = async () => {
        const errors = validateForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        if (!programaId) return;

        try {
            setIsSaving(true);

            const updateData: UpdateProgramInput = {
                id: programaId,
                name: program?.name,
                goalTitle,
                goalDescription: goalDescription || null,
                stimuli,
                criteria: criteria || null,
                notes: notes || null,
                status,
            };

            await updateProgram(updateData);

            // Toast/notificação (seria implementado com biblioteca de toast)
            console.log('Programa atualizado com sucesso!');

            // Navegar de volta para o detalhe
            const detailUrl = patientId
                ? `/programas/${programaId}?patientId=${patientId}`
                : `/programas/${programaId}`;
            navigate(detailUrl);
        } catch (err) {
            console.error('Erro ao salvar programa:', err);
            setValidationErrors({
                general: err instanceof Error ? err.message : 'Erro ao salvar programa',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAsVersion = async () => {
        const errors = validateForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        if (!programaId) return;

        try {
            setIsCreatingVersion(true);

            const updateData: UpdateProgramInput = {
                id: programaId,
                name: program?.name,
                goalTitle,
                goalDescription: goalDescription || null,
                stimuli,
                criteria: criteria || null,
                notes: notes || null,
                status,
            };

            const { id: newProgramId } = await createProgramVersion(updateData);

            // Toast/notificação
            console.log('Nova versão criada com sucesso!');

            // Navegar para o detalhe da nova versão
            const detailUrl = patientId
                ? `/programas/${newProgramId}?patientId=${patientId}`
                : `/programas/${newProgramId}`;
            navigate(detailUrl);
        } catch (err) {
            console.error('Erro ao criar nova versão:', err);
            setValidationErrors({
                general: err instanceof Error ? err.message : 'Erro ao criar nova versão',
            });
        } finally {
            setIsCreatingVersion(false);
        }
    };

    const handleCancel = () => {
        if (!program) return;

        const detailUrl = patientId
            ? `/programas/${program.id}?patientId=${patientId}`
            : `/programas/${program.id}`;
        navigate(detailUrl);
    };

    // Detectar mudanças
    useEffect(() => {
        if (!program) return;

        const hasGoalChanges =
            goalTitle !== program.goalTitle || goalDescription !== (program.goalDescription || '');

        const hasStatusChanges = status !== program.status;

        const hasStimuliChanges =
            JSON.stringify(stimuli) !==
            JSON.stringify(
                program.stimuli.map((s) => ({
                    id: s.id,
                    label: s.label,
                    description: s.description,
                    active: s.active,
                    order: s.order,
                })),
            );

        const hasCriteriaChanges = criteria !== '';
        const hasNotesChanges = notes !== '';

        setHasChanges(
            hasGoalChanges ||
                hasStatusChanges ||
                hasStimuliChanges ||
                hasCriteriaChanges ||
                hasNotesChanges,
        );
    }, [program, goalTitle, goalDescription, stimuli, criteria, notes, status]);

    useEffect(() => {
        loadProgram();
    }, [programaId]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-40">
                <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-8 p-4 space-y-6">
                    <Skeleton className="h-24 w-full rounded-[5px]" />
                    <Skeleton className="h-48 w-full rounded-[5px]" />
                    <Skeleton className="h-32 w-full rounded-[5px]" />
                    <Skeleton className="h-40 w-full rounded-[5px]" />
                    <Skeleton className="h-56 w-full rounded-[5px]" />
                </div>
            </div>
        );
    }

    // Error state
    if (error || !program) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-8 p-4 pt-8">
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <p className="text-red-700">{error || 'Programa não encontrado.'}</p>
                        <button onClick={loadProgram} className="mt-2 text-red-800 underline">
                            Tentar novamente
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-40 p-1 sm:p-4">
            <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-8 space-y-6">
                {/* Header com informações read-only */}
                <HeaderInfo program={program} />

                {/* Erros de validação */}
                <ValidationErrors errors={validationErrors} />

                {/* Objetivo do programa */}
                <GoalSection
                    goalTitle={goalTitle}
                    goalDescription={goalDescription}
                    onGoalTitleChange={setGoalTitle}
                    onGoalDescriptionChange={setGoalDescription}
                    errors={validationErrors}
                />

                {/* Editor de estímulos */}
                <StimuliEditor
                    stimuli={stimuli || []}
                    onStimuliChange={setStimuli}
                    errors={validationErrors}
                />

                {/* Critérios de domínio */}
                <CriteriaSection
                    criteria={criteria}
                    onCriteriaChange={setCriteria}
                    errors={validationErrors}
                />

                {/* Observações */}
                <NotesSection notes={notes} onNotesChange={setNotes} errors={validationErrors} />

                {/* Status do programa */}
                <StatusToggle status={status} onStatusChange={setStatus} />
            </div>

            {/* Barra de salvamento fixa */}
            <SaveBar
                onSave={handleSave}
                onSaveAsVersion={handleSaveAsVersion}
                onCancel={handleCancel}
                isSaving={isSaving}
                isCreatingVersion={isCreatingVersion}
                hasChanges={hasChanges}
            />
        </div>
    );
}
