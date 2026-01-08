/**
 * Página de criação/edição de Ata de Reunião
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { AtaForm } from '../components/AtaForm';
import { getAtaById } from '../services/atas.service';
import type { AtaReuniao, AtaFormData } from '../types';

export function NovaAtaPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { setPageTitle, setShowBackButton } = usePageTitle();
    const isEditing = !!id;

    const [loading, setLoading] = useState(isEditing);
    const [ata, setAta] = useState<AtaReuniao | null>(null);
    const [notFound, setNotFound] = useState(false);

    // Definir título dinâmico no header e mostrar botão de voltar
    useEffect(() => {
        setPageTitle(isEditing ? 'Editar Ata' : 'Nova Ata de Reunião');
        setShowBackButton(true);
        
        return () => {
            setShowBackButton(false);
        };
    }, [isEditing, setPageTitle, setShowBackButton]);

    // Carregar ata para edição
    useEffect(() => {
        async function loadAta() {
            if (!id) return;

            setLoading(true);
            try {
                const data = await getAtaById(id);
                if (data) {
                    setAta(data);
                } else {
                    setNotFound(true);
                }
            } catch (error) {
                console.error('Erro ao carregar ata:', error);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        loadAta();
    }, [id]);

    // Extrair dados do formulário da ata carregada
    const initialData: AtaFormData | undefined = ata
        ? {
              data: ata.data,
              horarioInicio: ata.horarioInicio,
              horarioFim: ata.horarioFim,
              finalidade: ata.finalidade,
              finalidadeOutros: ata.finalidadeOutros,
              modalidade: ata.modalidade,
              participantes: ata.participantes,
              conteudo: ata.conteudo,
              clienteId: ata.clienteId,
              clienteNome: ata.clienteNome,
          }
        : undefined;

    // Loading state
    if (loading) {
        return (
            <div className="container mx-auto py-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-8 w-48" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-32 w-full rounded-lg" />
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-64 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    // Not found state
    if (notFound) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Ata não encontrada</h2>
                    <p className="text-muted-foreground mb-6">
                        A ata que você está procurando não existe ou foi removida.
                    </p>
                    <Button asChild>
                        <Link to="/app/atas">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Voltar para lista
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="px-1 lg:px-4 py-4 space-y-4">
                {/* Formulário */}
                <AtaForm
                    ataId={id}
                    initialData={initialData}
                    onSuccess={() => navigate('/app/atas')}
                />
            </div>
        </div>
    );
}

export default NovaAtaPage;
