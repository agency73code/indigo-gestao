import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    PatientSelector,
    ProgramSelector,
    HeaderSessionInfo,
    GoalPreview,
    StimuliPanel,
    AttemptsRegister,
    SessionSummary,
    SaveBar,
} from '../components/index.ts';
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
} from '../types.ts';

export default function CadastroSessaoPage() {
    const [showSaveBar, setShowSaveBar] = useState(false);

    const handleSaveBarVisibility = useCallback(() => {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        const saveBarElement = document.getElementById('save-bar-container');
        const saveBarHeight = saveBarElement?.offsetHeight ?? 0;

        // Ajusta o calculo para desconsiderar a altura da SaveBar quando ela ja esta visivel
        const threshold = docHeight - saveBarHeight - 80;
        setShowSaveBar(scrollY + windowHeight >= threshold);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleSaveBarVisibility);
        window.addEventListener('resize', handleSaveBarVisibility);
        handleSaveBarVisibility();
        return () => {
            window.removeEventListener('scroll', handleSaveBarVisibility);
            window.removeEventListener('resize', handleSaveBarVisibility);
        };
    }, [handleSaveBarVisibility]);

    useEffect(() => {
        handleSaveBarVisibility();
    }, [handleSaveBarVisibility, showSaveBar]);
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
    });

    // Estados de carregamento
    const [loadingProgram, setLoadingProgram] = useState(false);
    const [savingSession, setSavingSession] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Extrair parâmetros da URL na inicialização
    useEffect(() => {
        const patientId = searchParams.get('patientId');
        const programId = searchParams.get('programaId');

        if (patientId) {
            // Buscar dados do paciente se patientId estiver na URL
            loadPatientData(patientId);
        }

        if (programId) {
            // Se programId estiver na URL, também carregar os detalhes do programa
            loadProgramData(programId);
        }
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
            console.error('Erro ao carregar paciente:', err);
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
        });
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

    const handleSave = async () => {
        if (!canSave) return;

        setSavingSession(true);
        setError(null);

        try {
            await saveSession({
                patientId: sessionState.patientId!,
                programId: sessionState.programId!,
                attempts: sessionState.attempts,
            });

            const redirectUrl = `/app/programas/${sessionState.programId}?patientId=${sessionState.patientId}`;
            navigate(redirectUrl);
        } catch (err) {
            console.error('Erro ao salvar sessão:', err);
            setError('Erro ao salvar sessão. Tente novamente.');
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

    const getValidationMessage = () => {
        if (!selectedPatient) {
            return 'Selecione um paciente';
        }
        if (!selectedProgram) {
            return 'Selecione um programa (OCP)';
        }
        if (sessionState.attempts.length === 0) {
            return 'Registre ao menos 1 tentativa';
        }
        return '';
    };

    return (
        <div className="flex flex-col min-h-screen w-full">
            {/* Container principal */}
            <main className="flex-1 max-w-4xl mx-auto px-4 md:px-4 lg:px-2 py-4 sm:py-6 md:pb-4 w-full">
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

                            {/* Painel de estímulos */}
                            <StimuliPanel
                                program={programDetail}
                                attempts={sessionState.attempts}
                                onAddAttempt={handleAddAttempt}
                            />

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

            {/* Save Bar só aparece ao final da página */}
            {selectedPatient && selectedProgram && showSaveBar && (
                <div id="save-bar-container">
                    <SaveBar
                        onSave={handleSave}
                        onCancel={handleCancel}
                        isSaving={savingSession}
                        canSave={canSave}
                        validationMessage={getValidationMessage()}
                    />
                </div>
            )}
        </div>
    );
}
