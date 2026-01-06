import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionBar from '@/components/ui/action-bar';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useCurrentArea, AREA_LABELS } from '@/contexts/AreaContext';
import {
    ToPatientSelector,
    ToProgramSelector,
    ToHeaderSessionInfo,
    ToGoalPreview,
    ToCurrentPerformanceSection,
    ToActivitiesPanel,
    ToAttemptsRegister,
    FisioSessionSummary,
    ToSessionObservations,
    ToSessionFiles,
} from '../session/components';
import {
    searchPatientsForFisioSession,
    getFisioProgramDetail,
    saveFisioSession,
    calculateFisioSessionSummary,
} from '../session/services';
import type {
    Patient,
    ProgramListItem,
    FisioProgramDetail,
    FisioSessionAttempt,
    ToSessionState,
    SessionFile,
} from '../session/types';

/**
 * Página de Registro de Sessão - Fisioterapia
 * Segue o mesmo padrão de Fono, mas adaptado para terminologia TO
 */
export default function RegistrarSessaoToPage() {
    const { setPageTitle } = usePageTitle();
    const area = useCurrentArea('fisioterapia');
    const areaLabel = AREA_LABELS[area] || 'Fisioterapia';

    useEffect(() => {
        setPageTitle(`Nova Sessão - ${areaLabel}`);
    }, [setPageTitle, areaLabel]);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Estados principais
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<ProgramListItem | null>(null);
    const [programDetail, setProgramDetail] = useState<FisioProgramDetail | null>(null);
    const [sessionState, setSessionState] = useState<ToSessionState>({
        patientId: null,
        programId: null,
        attempts: [],
        summary: {
            desempenhou: 0,
            desempenhouComAjuda: 0,
            naoDesempenhou: 0,
            totalAttempts: 0,
        },
        notes: '',
        files: [],
    });

    // Estados de carregamento
    const [loadingProgram, setLoadingProgram] = useState(false);
    const [savingSession, setSavingSession] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extrair parâmetros da URL na inicialização
    useEffect(() => {
        let patientId = searchParams.get('pacienteId');
        if (!patientId) patientId = searchParams.get('patientId');

        const programId = searchParams.get('programaId');

        if (patientId) {
            loadPatientData(patientId);
        }

        if (programId) {
            loadProgramData(programId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Carregar dados do paciente
    const loadPatientData = async (patientId: string) => {
        try {
            const patients = await searchPatientsForFisioSession('');
            const patient = patients.find((p: Patient) => p.id === patientId);
            if (patient) {
                handlePatientSelect(patient);
            }
        } catch (err) {
            console.error('Erro ao carregar cliente:', err);
        }
    };

    // Carregar dados do programa
    const loadProgramData = async (programId: string) => {
        try {
            setLoadingProgram(true);
            const detail = await getFisioProgramDetail(programId);
            setProgramDetail(detail);

            const programListItem: ProgramListItem = {
                id: detail.id,
                title: detail.name,
                objective: detail.goalTitle,
                status: detail.status as any,
                lastSession: null,
                patientId: detail.patientId,
                patientName: detail.patientName,
            };
            setSelectedProgram(programListItem);

            setSessionState((prev: ToSessionState) => ({
                ...prev,
                programId: detail.id,
            }));
        } catch (err) {
            console.error('Erro ao carregar programa:', err);
            setError('Erro ao carregar detalhes do programa');
        } finally {
            setLoadingProgram(false);
        }
    };

    // Handlers
    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        setSessionState((prev: ToSessionState) => ({
            ...prev,
            patientId: patient.id,
        }));

        if (selectedProgram && selectedProgram.patientId !== patient.id) {
            setSelectedProgram(null);
            setProgramDetail(null);
            setSessionState((prev: ToSessionState) => ({
                ...prev,
                programId: null,
            }));
        }
    };

    const handlePatientClear = () => {
        setSelectedPatient(null);
        setSelectedProgram(null);
        setProgramDetail(null);
        setSessionState({
            patientId: null,
            programId: null,
            attempts: [],
            summary: {
                desempenhou: 0,
                desempenhouComAjuda: 0,
                naoDesempenhou: 0,
                totalAttempts: 0,
            },
        });
    };

    const handleProgramSelect = async (program: ProgramListItem) => {
        setSelectedProgram(program);
        setSessionState((prev: ToSessionState) => ({
            ...prev,
            programId: program.id,
        }));

        await loadProgramData(program.id);
    };

    const handleProgramClear = () => {
        setSelectedProgram(null);
        setProgramDetail(null);
        setSessionState((prev: ToSessionState) => ({
            ...prev,
            programId: null,
        }));
    };

    const handleAddAttempt = (attempt: FisioSessionAttempt) => {
        setSessionState((prev: ToSessionState) => {
            const newAttempts = [...prev.attempts, attempt];
            const newSummary = calculateFisioSessionSummary(newAttempts);

            return {
                ...prev,
                attempts: newAttempts,
                summary: newSummary,
            };
        });
    };

    const handleNotesChange = (value: string) => {
        setSessionState((prev) => ({
            ...prev,
            notes: value,
        }));
    };

    const handleFilesChange = (files: SessionFile[]) => {
        setSessionState((prev) => ({
            ...prev,
            files,
        }));
    };

    const handleSave = async () => {
        if (!canSave) return;

        setSavingSession(true);
        setError(null);

        try {
            await saveFisioSession({
                patientId: sessionState.patientId!,
                programId: sessionState.programId!,
                attempts: sessionState.attempts,
                notes: sessionState.notes,
                files: sessionState.files,
                area,
            });

            toast.success('Sessão registrada com sucesso! 🎉', {
                description:
                    'Os dados da sessão foram salvos e estão disponíveis no histórico do cliente.',
                duration: 4000,
            });

            // Redirecionar para o hub da área atual ao invés de página específica de fisioterapia
            // const areaHubRoutes: Record<string, string> = {
            //     'fisioterapia': `/app/programas/fisioterapia/programa/${sessionState.programId}`,
            //     'psicomotricidade': `/app/programas/psicomotricidade/programa/${sessionState.programId}`,
            //     'educacao-fisica': `/app/programas/educacao-fisica/programa/${sessionState.programId}`,
            // };

            /*
                O codigo comentado acima faria as sessoes depois de registradas irem para a consulta de programas de cada area,
                atualmente todas elas levam para o mesmo caminho '/app/programas/fisioterapia/programa/idPrograma'
                por esse motivo o codigo duplicado com todos indo pro mesmo lugar, quando corrigir apaga o de baixo e só deixa o de cima rodando
            */
           
            const areaHubRoutes: Record<string, string> = {
                'fisioterapia': `/app/programas/fisioterapia/programa/${sessionState.programId}`,
                'psicomotricidade': `/app/programas/fisioterapia/programa/${sessionState.programId}`,
                'educacao-fisica': `/app/programas/fisioterapia/programa/${sessionState.programId}`,
            };
            navigate(areaHubRoutes[area] || '/app/programas/fisioterapia');
        } catch (err: any) {
            console.error('Erro ao salvar sessão:', err);
            
            if (err.message === 'FILE_TOO_LARGE') {
                toast.error('Arquivo muito grande', {
                    description: 'O arquivo excede o limite de tamanho permitido. Envie um arquivo menor.',
                    duration: 5000,
                })
            }
            
            toast.error('Erro ao salvar sessão', {
                description:
                'Não foi possível registrar a sessão. Verifique sua conexão e tente novamente.',
                duration: 5000,
            });

            setError('Erro ao salvar sessão. Tente novamente.');
        } finally {
            setSavingSession(false);
        }
    };

    const handleCancel = () => {
        // Mapeamento de área para hub correto
        const areaHubRoutes: Record<string, string> = {
            'fisioterapia': '/app/programas/fisioterapia',
            'psicomotricidade': '/app/programas/psicomotricidade',
            'educacao-fisica': '/app/programas/educacao-fisica',
        };
        navigate(areaHubRoutes[area] || '/app/programas/fisioterapia');
    };

    // Validações
    const canSave = !!(
        sessionState.patientId &&
        sessionState.programId &&
        sessionState.attempts.length > 0
    );

    return (
        <div className="flex flex-col w-full">
            {/* Container principal */}
            <main className="flex-1 px-0 py-4 lg:p-4 sm:py-6 md:pb-4 w-full">
                <div className="space-y-4 sm:space-y-6">
                    {/* Seleção de Paciente */}
                    {!selectedPatient && (
                        <ToPatientSelector
                            selected={selectedPatient}
                            onSelect={handlePatientSelect}
                            onClear={handlePatientClear}
                            autoOpenIfEmpty={true}
                        />
                    )}

                    {/* Seleção de Programa */}
                    {selectedPatient && !selectedProgram && (
                        <ToProgramSelector
                            patient={selectedPatient}
                            selected={selectedProgram}
                            onSelect={handleProgramSelect}
                            onClear={handleProgramClear}
                            autoOpenIfEmpty={true}
                        />
                    )}

                    {/* Conteúdo principal - exibir após ter paciente e programa */}
                    {selectedPatient && selectedProgram && programDetail && (
                        <>
                            {/* Header com informações da sessão */}
                            <ToHeaderSessionInfo patient={selectedPatient} program={programDetail} />

                            {/* Preview do objetivo */}
                            <ToGoalPreview program={programDetail} />

                            {/* Nível atual de desempenho */}
                            <ToCurrentPerformanceSection program={programDetail} />

                            {/* Painel de atividades (objetivos específicos) */}
                            <ToActivitiesPanel
                                program={programDetail}
                                attempts={sessionState.attempts}
                                onAddAttempt={handleAddAttempt}
                            />

                            {/* Observações da sessão */}
                            <ToSessionObservations
                                notes={sessionState.notes || ''}
                                onNotesChange={handleNotesChange}
                            />

                            {/* Arquivos da sessão */}
                            <ToSessionFiles
                                files={sessionState.files || []}
                                onFilesChange={handleFilesChange}
                                disabled={savingSession}
                            />

                            {/* Registro de tentativas */}
                            <ToAttemptsRegister attempts={sessionState.attempts} />

                            {/* Resumo da sessão */}
                            <FisioSessionSummary summary={sessionState.summary} />
                        </>
                    )}

                    {/* Loading state */}
                    {loadingProgram && (
                        <div className="text-center py-8">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4" />
                            <p className="text-muted-foreground">Carregando programa...</p>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[5px]">
                            {error}
                        </div>
                    )}
                </div>
            </main>

            {/* Barra de ação fixa no rodapé */}
            {selectedPatient && selectedProgram && (
                <ActionBar>
                    <Button
                        onClick={handleSave}
                        disabled={!canSave || savingSession}
                        className="h-11 rounded-full gap-2"
                    >
                        {savingSession ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                Salvando sessão...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Salvar Sessão
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleCancel}
                        variant="outline"
                        disabled={savingSession}
                        className="h-11 rounded-full gap-2"
                    >
                        <X className="h-4 w-4" />
                        Cancelar
                    </Button>
                </ActionBar>
            )}
        </div>
    );
}
