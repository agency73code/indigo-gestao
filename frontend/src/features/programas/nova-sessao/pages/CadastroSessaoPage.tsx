import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ActionBar from '@/components/ui/action-bar';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import {
    PatientSelector,
    ProgramSelector,
    HeaderSessionInfo,
    GoalPreview,
    CriteriaSection,
    StimuliPanel,
    AttemptsRegister,
    SessionSummary,
    SessionObservations,
    FonoSessionFiles,
    SessionBillingData,
} from '../components/index.ts';
import type { SessionFile } from '../components/index.ts';
import {
    searchPatientsForSession,
    getProgramDetail,
    saveSession,
    calculateSessionSummary,
} from '../services.ts';
import type {
    Patient,
    ProgramListItem,
    ProgramDetail,
    SessionAttempt,
    SessionState,
    DadosFaturamentoSessao,
} from '../types.ts';
import { DADOS_FATURAMENTO_INITIAL, validarDadosFaturamento } from '../types.ts';

export default function CadastroSessaoPage() {
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle('Nova Sessão');
    }, [setPageTitle]);

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Estados principais
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<ProgramListItem | null>(null);
    const [programDetail, setProgramDetail] = useState<ProgramDetail | null>(null);
    const [sessionState, setSessionState] = useState<SessionState>({
        patientId: null,
        programId: null,
        attempts: [],
        summary: {
            overallAccuracy: 0,
            independenceRate: 0,
            totalAttempts: 0,
        },
        notes: '',
        billing: DADOS_FATURAMENTO_INITIAL,
    });

    // Estado para arquivos da sessão
    const [sessionFiles, setSessionFiles] = useState<SessionFile[]>([]);
    
    // Estado para erros de validação de faturamento
    const [billingErrors, setBillingErrors] = useState<Record<string, string>>({});

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
            // Buscar dados do paciente se patientId estiver na URL
            loadPatientData(patientId);
        }

        if (programId) {
            // Se programId estiver na URL, também carregar os detalhes do programa
            loadProgramData(programId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Carregar dados do paciente
    const loadPatientData = async (patientId: string) => {
        try {
            const patients = await searchPatientsForSession('');
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
            const detail = await getProgramDetail(programId);
            setProgramDetail(detail);

            // Criar um ProgramListItem mock para o seletor
            const programListItem: ProgramListItem = {
                id: detail.id,
                title: detail.name,
                objective: detail.goalTitle,
                status: detail.status,
                lastSession: null,
                patientId: detail.patientId,
                patientName: detail.patientName,
            };
            setSelectedProgram(programListItem);

            setSessionState((prev: SessionState) => ({
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
        setSessionState((prev: SessionState) => ({
            ...prev,
            patientId: patient.id,
        }));

        // Limpar programa selecionado se mudar paciente
        if (selectedProgram && selectedProgram.patientId !== patient.id) {
            setSelectedProgram(null);
            setProgramDetail(null);
            setSessionState((prev: SessionState) => ({
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
                overallAccuracy: 0,
                independenceRate: 0,
                totalAttempts: 0,
            },
            billing: DADOS_FATURAMENTO_INITIAL,
        });
        setBillingErrors({});
    };

    // Handler para dados de faturamento
    const handleBillingChange = (billing: DadosFaturamentoSessao) => {
        setSessionState((prev) => ({
            ...prev,
            billing,
        }));
        // Limpar erros ao editar
        setBillingErrors({});
    };

    const handleProgramSelect = async (program: ProgramListItem) => {
        setSelectedProgram(program);
        setSessionState((prev: SessionState) => ({
            ...prev,
            programId: program.id,
        }));

        await loadProgramData(program.id);
    };

    const handleProgramClear = () => {
        setSelectedProgram(null);
        setProgramDetail(null);
        setSessionState((prev: SessionState) => ({
            ...prev,
            programId: null,
        }));
    };

    const handleAddAttempt = (attempt: SessionAttempt) => {
        setSessionState((prev: SessionState) => {
            const newAttempts = [...prev.attempts, attempt];
            const newSummary = calculateSessionSummary(newAttempts);

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

    const handleSave = async () => {
        if (!canSave) return;

        // Validar dados de faturamento
        if (sessionState.billing) {
            const validacao = validarDadosFaturamento(sessionState.billing);
            if (!validacao.valido) {
                setBillingErrors(validacao.erros);
                toast.error('Dados de faturamento incompletos', {
                    description: 'Preencha os campos obrigatórios de faturamento.',
                    duration: 4000,
                });
                return;
            }
        }

        setSavingSession(true);
        setError(null);

        try {
            await saveSession({
                patientId: sessionState.patientId!,
                programId: sessionState.programId!,
                attempts: sessionState.attempts,
                notes: sessionState.notes,
                files: sessionFiles,
                faturamento: sessionState.billing,
            });

            // Toast de confirmação com mensagem focada na experiência do usuário
            toast.success('Sessão registrada com sucesso! 🎉', {
                description:
                    'Os dados da sessão foram salvos e estão disponíveis no histórico do cliente.',
                duration: 4000,
            });

            const redirectUrl = `/app/programas/${sessionState.programId}?patientId=${sessionState.patientId}`;
            navigate(redirectUrl);
        } catch (err) {
            console.error('Erro ao salvar sessão:', err);
            setError('Erro ao salvar sessão. Tente novamente.');

            // Toast de erro para melhor feedback
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
        // Se veio de um programa específico, volta para ele
        if (sessionState.programId && sessionState.patientId) {
            const backUrl = `/app/programas/${sessionState.programId}?patientId=${sessionState.patientId}`;
            navigate(backUrl);
        } else {
            // Caso contrário, volta para a lista de programas
            navigate('/app/programas');
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
            <main className="flex-1 px-0 py-4  lg:p-4 sm:py-6 md:pb-4 w-full">
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
                        <ProgramSelector
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
                            <HeaderSessionInfo patient={selectedPatient} program={programDetail} />

                            {/* Preview do objetivo */}
                            <GoalPreview program={programDetail} />

                            {/* Critérios de domínio */}
                            <CriteriaSection program={programDetail} />

                            {/* Painel de estímulos */}
                            <StimuliPanel
                                program={programDetail}
                                attempts={sessionState.attempts}
                                onAddAttempt={handleAddAttempt}
                            />

                            {/* Observações da sessão */}
                            <SessionObservations
                                notes={sessionState.notes || ''}
                                onNotesChange={handleNotesChange}
                            />

                            {/* Upload de arquivos da sessão */}
                            <FonoSessionFiles
                                files={sessionFiles}
                                onFilesChange={setSessionFiles}
                                disabled={savingSession}
                            />

                            {/* 
                              * ============================================
                              * DADOS DE FATURAMENTO
                              * ============================================
                              * Seção para captura de dados de faturamento.
                              * Separada das observações clínicas.
                              * 
                              * BACKEND: Os dados são enviados no campo `faturamento`
                              * do payload de saveSession.
                              * ============================================
                              */}
                            {sessionState.billing && (
                                <SessionBillingData
                                    value={sessionState.billing}
                                    onChange={handleBillingChange}
                                    errors={billingErrors}
                                    disabled={savingSession}
                                    title="Dados de Faturamento"
                                    defaultExpanded={true}
                                />
                            )}

                            {/* Registro de tentativas */}
                            <AttemptsRegister attempts={sessionState.attempts} />

                            {/* Resumo da sessão */}
                            <SessionSummary summary={sessionState.summary} />
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
