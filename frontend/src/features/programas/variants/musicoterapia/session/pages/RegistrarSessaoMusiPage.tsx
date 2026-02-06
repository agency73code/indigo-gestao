import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionBar from '@/components/ui/action-bar';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import { SessionBillingData } from '@/features/programas/nova-sessao/components';
import {
    MusiProgramSelector,
    MusiHeaderSessionInfo,
    MusiGoalPreview,
    MusiCurrentPerformanceSection,
    MusiActivitiesPanel,
    MusiAttemptsRegister,
    MusiSessionSummary,
    MusiSessionObservations,
    MusiSessionFiles,
} from '../components';
import {
    searchPatientsForMusiSession,
    getMusiProgramDetail,
    saveMusiSession,
    calculateMusiSessionSummary,
} from '../services';
import type {
    Patient,
    ProgramListItem,
    MusiProgramDetail,
    MusiSessionAttempt,
    MusiSessionState,
    SessionFile,
    DadosFaturamentoSessao,
} from '../types';
import { DADOS_FATURAMENTO_INITIAL, validarDadosFaturamento } from '../types';

export default function RegistrarSessaoMusiPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Nova Sessão - Musicoterapia');
    }, [setPageTitle]);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Estados principais
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<ProgramListItem | null>(null);
    const [programDetail, setProgramDetail] = useState<MusiProgramDetail | null>(null);
    const [sessionState, setSessionState] = useState<MusiSessionState>({
        patientId: null,
        programId: null,
        attempts: [],
        summary: {
            desempenhou: 0,
            desempenhouComAjuda: 0,
            naoDesempenhou: 0,
            totalAttempts: 0,
            avgParticipacao: null,
            avgSuporte: null,
        },
        notes: '',
        files: [],
        billing: DADOS_FATURAMENTO_INITIAL,
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
            const patients = await searchPatientsForMusiSession('');
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
            const detail = await getMusiProgramDetail(programId);
            setProgramDetail(detail);

            const programListItem: ProgramListItem = {
                id: detail.id,
                title: detail.name ?? '',
                objective: detail.goalTitle,
                status: detail.status as any,
                lastSession: null,
                patientId: detail.patientId,
                patientName: detail.patientName,
            };
            setSelectedProgram(programListItem);

            setSessionState((prev: MusiSessionState) => ({
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
        setSessionState((prev: MusiSessionState) => ({
            ...prev,
            patientId: patient.id,
        }));

        if (selectedProgram && selectedProgram.patientId !== patient.id) {
            setSelectedProgram(null);
            setProgramDetail(null);
            setSessionState((prev: MusiSessionState) => ({
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
                avgParticipacao: null,
                avgSuporte: null,
            },
            files: [],
            billing: DADOS_FATURAMENTO_INITIAL,
        });
    };

    const handleProgramSelect = async (program: ProgramListItem) => {
        setSelectedProgram(program);
        setSessionState((prev: MusiSessionState) => ({
            ...prev,
            programId: program.id,
        }));

        await loadProgramData(program.id);
    };

    const handleProgramClear = () => {
        setSelectedProgram(null);
        setProgramDetail(null);
        setSessionState((prev: MusiSessionState) => ({
            ...prev,
            programId: null,
        }));
    };

    const handleAddAttempt = (attempt: MusiSessionAttempt) => {
        setSessionState((prev: MusiSessionState) => {
            const newAttempts = [...prev.attempts, attempt];
            const newSummary = calculateMusiSessionSummary(newAttempts);

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

    const handleBillingChange = (billing: DadosFaturamentoSessao) => {
        setSessionState((prev) => ({
            ...prev,
            billing,
        }));
    };

    const handleSave = async () => {
        if (!canSave) return;

        // Validar dados de faturamento
        const billingValidation = validarDadosFaturamento(sessionState.billing);
        if (!billingValidation.valido) {
            toast.error('Dados de faturamento incompletos', {
                description: billingValidation.mensagem,
                duration: 4000,
            });
            return;
        }

        setSavingSession(true);
        setError(null);

        try {
            await saveMusiSession({
                patientId: sessionState.patientId!,
                programId: sessionState.programId!,
                attempts: sessionState.attempts,
                notes: sessionState.notes,
                files: sessionState.files,
                faturamento: sessionState.billing,
            });

            toast.success('Sessão registrada com sucesso! 🎵', {
                description:
                    'Os dados da sessão foram salvos e estão disponíveis no histórico do cliente.',
                duration: 4000,
            });

            const redirectUrl = `/app/programas/musicoterapia/programa/${sessionState.programId}?patientId=${sessionState.patientId}`;
            navigate(redirectUrl);
        } catch (err) {
            console.error('Erro ao salvar sessão:', err);
            setError('Erro ao salvar sessão. Tente novamente.');

            toast.error('Erro ao salvar sessão', {
                description:
                    'Não foi possível registrar a sessão. Verifique sua conexão e tente novamente.',
                duration: 5000,
            });
        } finally {
            setSavingSession(false);
        }
    };

    const handleCancel = () => {
        if (sessionState.programId && sessionState.patientId) {
            const backUrl = `/app/programas/musicoterapia/programa/${sessionState.programId}?patientId=${sessionState.patientId}`;
            navigate(backUrl);
        } else {
            navigate('/app/programas/musicoterapia');
        }
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
                        <PatientSelector
                            selected={selectedPatient}
                            onSelect={handlePatientSelect}
                            onClear={handlePatientClear}
                            autoOpenIfEmpty={true}
                        />
                    )}

                    {/* Seleção de Programa */}
                    {selectedPatient && !selectedProgram && (
                        <MusiProgramSelector
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
                            <MusiHeaderSessionInfo patient={selectedPatient} program={programDetail} />

                            {/* Preview do objetivo */}
                            <MusiGoalPreview program={programDetail} />

                            {/* Nível atual de desempenho */}
                            <MusiCurrentPerformanceSection program={programDetail} />

                            {/* Painel de atividades */}
                            <MusiActivitiesPanel
                                program={programDetail}
                                attempts={sessionState.attempts}
                                onAddAttempt={handleAddAttempt}
                            />

                            {/* Dados de Faturamento da Sessão */}
                            <SessionBillingData
                                billing={sessionState.billing || DADOS_FATURAMENTO_INITIAL}
                                onChange={handleBillingChange}
                                disabled={savingSession}
                            />

                            {/* Observações da sessão */}
                            <MusiSessionObservations
                                notes={sessionState.notes || ''}
                                onNotesChange={handleNotesChange}
                            />

                            {/* Upload de arquivos da sessão */}
                            <MusiSessionFiles
                                files={sessionState.files || []}
                                onFilesChange={handleFilesChange}
                                disabled={savingSession}
                            />

                            {/* Registro de tentativas */}
                            <MusiAttemptsRegister attempts={sessionState.attempts} />

                            {/* Resumo da sessão */}
                            <MusiSessionSummary summary={sessionState.summary} />
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
