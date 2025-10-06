import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
    HeaderProgram,
    GoalSection,
    CriteriaSection,
    StimuliSection,
    NotesSection,
    SessionsList,
    LastSessionPreview,
    SummaryCard,
    ActionBar,
    ErrorBanner,
} from '../detalhe-ocp/index';
import { fetchProgramById, fetchRecentSessions } from '../detalhe-ocp/services';
import type { ProgramDetail, SessionListItem } from '../detalhe-ocp/types';

export default function DetalheProgramaPage() {
    const { programaId } = useParams<{ programaId: string }>();
    const location = useLocation();

    const [program, setProgram] = useState<ProgramDetail | null>(null);
    const [sessions, setSessions] = useState<SessionListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(Date.now());

    const loadData = async () => {
        if (!programaId) {
            setError('ID do programa não encontrado.');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const [programData, sessionsData] = await Promise.all([
                fetchProgramById(programaId),
                fetchRecentSessions(programaId, 5),
            ]);

            setProgram(programData);
            setSessions(sessionsData);
            setRefreshKey(Date.now());
        } catch (err) {
            console.error('Erro ao carregar dados do programa:', err);
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [programaId]);

    useEffect(() => {
        loadData();
    }, [location.pathname, programaId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background pb-28">
                <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-8 p-4 space-y-6">
                    <Skeleton className="h-48 w-full rounded-[5px]" />
                    <Skeleton className="h-32 w-full rounded-[5px]" />
                    <Skeleton className="h-40 w-full rounded-[5px]" />
                    <Skeleton className="h-56 w-full rounded-[5px]" />
                    <Skeleton className="h-32 w-full rounded-[5px]" />
                </div>
            </div>
        );
    }

    if (error || !program) {
        return (
            <div className="min-h-screen bg-background">
                <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-8 p-4 pt-8">
                    <ErrorBanner message={error || 'Programa não encontrado.'} onRetry={loadData} />
                </div>
            </div>
        );
    }

    const lastSession = sessions.length > 0 ? sessions[0] : null;

    return (
        <div className="min-h-screen bg-background pb-28 sm:p-0 my-4">
            <div className="max-w-lg md:max-w-none mx-auto md:mx-4 lg:mx-4 space-y-6">
                {/* Header com informações do paciente e programa */}
                <HeaderProgram key={refreshKey} program={program} />

                {/* Objetivo do programa */}
                <GoalSection program={program} />

                {/* Critérios de domínio */}
                <CriteriaSection program={program} />

                {/* Objetivo a curto prazo e estímulos */}
                <StimuliSection program={program} />

                {/* Observações gerais */}
                <NotesSection program={program} />

                {/* Lista de sessões recentes */}
                <SessionsList sessions={sessions} program={program} />

                {/* Preview da última sessão (se disponível) */}
                {lastSession && <LastSessionPreview lastSession={lastSession} />}

                {/* Resumo com métricas gerais */}
                <SummaryCard sessions={sessions} />
            </div>

            {/* Barra de ações fixa no rodapé */}
            <div className="mt-4">
                <ActionBar program={program} />
            </div>
        </div>
    );
}
