import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, X, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionBar from '@/components/ui/action-bar';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import {
    HeaderInfo,
    DateSection,
    StatusToggle,
    ValidationErrors,
} from '../../../editar-ocp';
import { fetchProgramById, updateProgram } from '../../../editar-ocp/services';
import type { ProgramDetail } from '../../../editar-ocp/types';
import { musiProgramConfig, musiRoutes } from '../config';
import { fetchMusiProgramById } from '../mocks/mockService';
import MusiStimuliEditor from '../components/MusiStimuliEditor';
import MusiNotesSection from '../components/MusiNotesSection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import type { MusiStimulus } from '../types';
import { apiToMusiStimulus } from '../types';

export default function MusiEditarProgramaPage() {
    const { programaId } = useParams<{ programaId: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const patientId = searchParams.get('patientId');
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Editar Programa - Musicoterapia');
    }, [setPageTitle]);

    const [program, setProgram] = useState<ProgramDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Estados do formulário
    const [goalTitle, setGoalTitle] = useState('');
    const [goalDescription, setGoalDescription] = useState('');
    const [currentPerformanceLevel, setCurrentPerformanceLevel] = useState('');
    const [stimuli, setStimuli] = useState<MusiStimulus[]>([]);
    const [notes, setNotes] = useState('');
    const [status, setStatus] = useState<'active' | 'archived'>('active');
    const [prazoInicio, setPrazoInicio] = useState('');
    const [prazoFim, setPrazoFim] = useState('');

    // Estados de controle
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const loadProgram = async () => {
        if (!programaId) {
            setError('ID do programa não encontrado.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Usar mock service se for mock-musi-001
            let programData;
            if (programaId === 'mock-musi-001') {
                programData = await fetchMusiProgramById(programaId);
            } else {
                programData = await fetchProgramById(programaId);
            }

            setProgram(programData);

            // Pré-preencher formulário
            setGoalTitle(programData.goalTitle);
            setGoalDescription(programData.goalDescription || '');
            setCurrentPerformanceLevel((programData as any).currentPerformanceLevel || '');
            // Converter stimuli da API para formato MusiStimulus
            setStimuli(
                programData.stimuli.map((s) => apiToMusiStimulus({
                    id: s.id,
                    order: s.order,
                    label: s.label,
                    description: s.description,
                    active: s.active,
                    metodos: (s as any).metodos,
                    tecnicasProcedimentos: (s as any).tecnicasProcedimentos,
                })),
            );
            setNotes(programData.notes ?? '');
            setStatus(programData.status);
            setPrazoInicio(programData.prazoInicio || '');
            setPrazoFim(programData.prazoFim || '');
        } catch (err) {
            console.error('Erro ao carregar programa:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = (): any => {
        const errors: any = {};

        if (!goalTitle.trim()) {
            errors.goalTitle = 'O título do objetivo é obrigatório.';
        }

        if (!goalDescription.trim()) {
            errors.goalDescription = 'A descrição do objetivo é obrigatória.';
        }

        if (!currentPerformanceLevel.trim()) {
            errors.currentPerformanceLevel = 'O nível atual de desempenho é obrigatório.';
        }

        if (!stimuli || stimuli.length === 0) {
            errors.general = 'Adicione pelo menos um objetivo específico.';
        } else if (stimuli) {
            const hasEmptyStimulus = stimuli.some((s) => !s.objetivo.trim());
            if (hasEmptyStimulus) {
                errors.general = 'Todos os objetivos específicos devem ter um objetivo preenchido.';
            }
        }

        if (!prazoInicio) {
            errors.prazoInicio = 'A data de início é obrigatória.';
        }
        if (!prazoFim) {
            errors.prazoFim = 'A data de fim é obrigatória.';
        }
        if (prazoInicio && prazoFim && new Date(prazoInicio) > new Date(prazoFim)) {
            errors.prazoFim = 'A data de fim deve ser posterior à data de início.';
        }

        return errors;
    };

    const handleSave = async () => {
        const errors = validateForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Por favor, corrija os erros no formulário.');
            return;
        }

        if (!programaId) return;

        try {
            setIsSaving(true);

            // Converter MusiStimulus de volta para formato da API
            const stimuliForApi = stimuli.map((s) => ({
                id: s.id,
                order: s.order,
                label: s.objetivo,
                description: s.objetivoEspecifico || undefined,
                active: s.active,
            }));

            const input: any = {
                id: programaId,
                goalTitle,
                goalDescription,
                currentPerformanceLevel,
                stimuli: stimuliForApi,
                notes,
                status,
                prazoInicio,
                prazoFim,
            };

            await updateProgram(input);
            toast.success('Programa atualizado com sucesso!');

            setHasChanges(false);
            
            const detailUrl = patientId 
                ? `${musiRoutes.detail(programaId)}?patientId=${patientId}`
                : musiRoutes.detail(programaId);
            navigate(detailUrl);
        } catch (err) {
            console.error('Erro ao salvar programa:', err);
            toast.error('Erro ao salvar programa. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (hasChanges) {
            const confirmed = window.confirm(musiProgramConfig.messages.confirmLeave);
            if (!confirmed) return;
        }

        const detailUrl = patientId 
            ? `${musiRoutes.detail(programaId!)}?patientId=${patientId}`
            : musiRoutes.detail(programaId!);
        navigate(detailUrl);
    };

    useEffect(() => {
        loadProgram();
    }, [programaId]);

    // Detectar mudanças
    useEffect(() => {
        if (!program) return;

        // Converter stimuli do programa para formato MusiStimulus para comparação
        const originalStimuli = program.stimuli.map((s) => apiToMusiStimulus({
            id: s.id,
            order: s.order,
            label: s.label,
            description: s.description,
            active: s.active,
            metodos: (s as any).metodos,
            tecnicasProcedimentos: (s as any).tecnicasProcedimentos,
        }));

        const hasFormChanges =
            goalTitle !== program.goalTitle ||
            goalDescription !== (program.goalDescription || '') ||
            currentPerformanceLevel !== ((program as any).currentPerformanceLevel || '') ||
            notes !== (program.notes || '') ||
            status !== program.status ||
            prazoInicio !== (program.prazoInicio || '') ||
            prazoFim !== (program.prazoFim || '') ||
            JSON.stringify(stimuli) !== JSON.stringify(originalStimuli);

        setHasChanges(hasFormChanges);
    }, [
        goalTitle,
        goalDescription,
        currentPerformanceLevel,
        stimuli,
        notes,
        status,
        prazoInicio,
        prazoFim,
        program,
    ]);

    if (loading) {
        return (
            <div className="container mx-auto space-y-6 p-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="container mx-auto p-6">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                    <p className="font-semibold">Erro ao carregar programa</p>
                    <p className="text-sm">{error || 'Programa não encontrado.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-4">
            <div className="max-w-lg md:max-w-none p-0 lg:p-4 space-y-6">
                {/* Header com informações read-only */}
                <HeaderInfo program={program} />

                {/* Seção de datas do programa */}
                <DateSection
                    prazoInicio={prazoInicio}
                    prazoFim={prazoFim}
                    onPrazoInicioChange={setPrazoInicio}
                    onPrazoFimChange={setPrazoFim}
                />

                {/* Erros de validação */}
                {Object.keys(validationErrors).length > 0 && (
                    <ValidationErrors errors={validationErrors} />
                )}

                {/* Objetivo Geral */}
                <Card padding="small" className="rounded-[5px]">
                    <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Objetivo Geral
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="goal-title">Título do Objetivo *</Label>
                            <Input
                                id="goal-title"
                                placeholder="Ex: Desenvolver expressão musical e ritmo"
                                value={goalTitle}
                                onChange={(e) => setGoalTitle(e.target.value)}
                                maxLength={100}
                            />
                            {validationErrors.goalTitle && (
                                <p className="text-sm text-destructive">{validationErrors.goalTitle}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="goal-description">Descrição do Objetivo a Longo Prazo *</Label>
                            <textarea
                                id="goal-description"
                                placeholder="Descreva o objetivo principal de Musicoterapia..."
                                value={goalDescription}
                                onChange={(e) => setGoalDescription(e.target.value)}
                                maxLength={1000}
                                rows={4}
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                            {validationErrors.goalDescription && (
                                <p className="text-sm text-destructive">{validationErrors.goalDescription}</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Nível Atual de Desempenho */}
                <Card padding="small" className="rounded-[5px]">
                    <CardHeader className="pb-2 sm:pb-3 pt-3 sm:pt-6">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Nível atual de Desempenho
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3 sm:pb-6">
                        <textarea
                            placeholder="Descreva o nível atual de desempenho do cliente..."
                            value={currentPerformanceLevel}
                            onChange={(e) => setCurrentPerformanceLevel(e.target.value)}
                            maxLength={1000}
                            rows={4}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        />
                        {validationErrors.currentPerformanceLevel && (
                            <p className="mt-1 text-sm text-destructive">
                                {validationErrors.currentPerformanceLevel}
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Objetivo Específico com Atividades */}
                <MusiStimuliEditor
                    stimuli={stimuli || []}
                    onStimuliChange={setStimuli}
                    errors={validationErrors}
                />

                {/* Observações do Terapeuta */}
                <MusiNotesSection notes={notes} onNotesChange={setNotes} />

                {/* Status do programa */}
                <StatusToggle status={status} onStatusChange={setStatus} />
            </div>

            {/* Barra de ações fixa no rodapé */}
            <ActionBar>
                <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="h-11 rounded-full gap-2"
                    disabled={isSaving}
                >
                    <X className="h-4 w-4" />
                    Cancelar
                </Button>

                <Button
                    onClick={handleSave}
                    className="h-11 rounded-full gap-2"
                    disabled={isSaving || !hasChanges}
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
            </ActionBar>
        </div>
    );
}
