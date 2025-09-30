import { useState, useEffect } from 'react';
import { ChevronLeft, ArrowLeftRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
    LinkList,
    LinkFilters,
    LinkFormModal,
    ArchiveDialog,
    TransferResponsibleDialog,
    EndLinkDialog,
} from '../index';
import type {
    PatientTherapistLink,
    LinkFilters as LinkFiltersType,
    CreateLinkInput,
    UpdateLinkInput,
    Paciente,
    Terapeuta,
    TransferResponsibleInput,
} from '../types';
import {
    getAllLinks,
    getAllPatients,
    getAllTherapists,
    createLink,
    updateLink,
    transferResponsible,
    archiveLink,
    endLink,
} from '../services/links.service';

export default function VinculosPage() {
    const navigate = useNavigate();
    const [links, setLinks] = useState<PatientTherapistLink[]>([]);
    const [patients, setPatients] = useState<Paciente[]>([]);
    const [therapists, setTherapists] = useState<Terapeuta[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState<PatientTherapistLink | null>(null);
    const [showArchiveDialog, setShowArchiveDialog] = useState(false);
    const [archivingLink, setArchivingLink] = useState<PatientTherapistLink | null>(null);
    const [archiveLoading, setArchiveLoading] = useState(false);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [transferringLink, setTransferringLink] = useState<PatientTherapistLink | null>(null);
    const [transferLoading, setTransferLoading] = useState(false);
    const [showEndDialog, setShowEndDialog] = useState(false);
    const [endingLink, setEndingLink] = useState<PatientTherapistLink | null>(null);
    const [endLoading, setEndLoading] = useState(false);
    const [filters, setFilters] = useState<LinkFiltersType>({
        viewBy: 'patient',
        status: 'all',
        orderBy: 'recent',
    });

    // Carregar dados iniciais
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [linksData, patientsData, therapistsData] = await Promise.all([
                getAllLinks(),
                getAllPatients(),
                getAllTherapists(),
            ]);
            setLinks(linksData);
            setPatients(patientsData);
            setTherapists(therapistsData);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLink = () => {
        setEditingLink(null);
        setShowModal(true);
    };

    const handleEditLink = (link: PatientTherapistLink) => {
        setEditingLink(link);
        setShowModal(true);
    };

    const handleAddTherapist = (patientId: string) => {
        // Criar um objeto especial para indicar criação de novo terapeuta para o paciente
        const newTherapistTemplate = {
            id: '',
            patientId,
            therapistId: '',
            role: 'responsible' as const, // Padrão como responsável, mas usuário pode alterar
            startDate: new Date().toISOString(),
            status: 'active' as const,
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _isNewTherapistCreation: true, // Flag especial para identificar criação
        } as PatientTherapistLink & { _isNewTherapistCreation: boolean };

        setEditingLink(newTherapistTemplate);
        setShowModal(true);
    };

    const handleSubmitLink = async (data: CreateLinkInput | UpdateLinkInput) => {
        try {
            if ('id' in data) {
                await updateLink(data as UpdateLinkInput);
            } else {
                await createLink(data as CreateLinkInput);
            }
            await loadData(); // Recarregar dados
            setShowModal(false);
        } catch (error) {
            console.error('Erro ao salvar vínculo:', error);
        }
    };

    const handleEndLink = async (link: PatientTherapistLink) => {
        setEndingLink(link);
        setShowEndDialog(true);
    };

    const handleConfirmEnd = async (endDate: string) => {
        if (!endingLink) return;

        try {
            setEndLoading(true);

            // Chamar serviço real de encerramento
            await endLink(endingLink.id, endDate);

            // Recarregar dados para refletir a mudança
            await loadData();

            // Fechar diálogo
            setShowEndDialog(false);
            setEndingLink(null);
        } catch (error) {
            console.error('Erro ao encerrar vínculo:', error);
        } finally {
            setEndLoading(false);
        }
    };

    const handleArchiveLink = async (link: PatientTherapistLink) => {
        setArchivingLink(link);
        setShowArchiveDialog(true);
    };

    const handleConfirmArchive = async () => {
        if (!archivingLink) return;

        try {
            setArchiveLoading(true);

            // Chamar serviço real de arquivamento
            await archiveLink(archivingLink.id);

            // Recarregar dados para refletir a mudança
            await loadData();

            // Fechar diálogo
            setShowArchiveDialog(false);
            setArchivingLink(null);
        } catch (error) {
            console.error('Erro ao arquivar vínculo:', error);
        } finally {
            setArchiveLoading(false);
        }
    };

    const handleTransferResponsible = async (link: PatientTherapistLink) => {
        setTransferringLink(link);
        setShowTransferDialog(true);
    };

    const handleConfirmTransfer = async (data: TransferResponsibleInput) => {
        try {
            setTransferLoading(true);

            await transferResponsible(data);

            // Recarregar dados para refletir a mudança
            await loadData();

            // Fechar diálogo
            setShowTransferDialog(false);
            setTransferringLink(null);
        } catch (error) {
            console.error('Erro ao transferir responsabilidade:', error);
            // Aqui poderia mostrar uma notificação de erro
        } finally {
            setTransferLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header com botão voltar */}
            <div className="px-0 sm:px-4 py-3 sm:py-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-1.5 sm:p-2 flex-shrink-0"
                            onClick={() => navigate(-1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="min-w-0 flex-1">
                            <h1
                                style={{ fontFamily: 'Sora, sans-serif' }}
                                className="text-lg sm:text-2xl font-semibold text-primary leading-tight"
                            >
                                {/* Mobile: Título em duas linhas */}
                                <span className="sm:hidden">
                                    Vínculos
                                    <br />
                                    <span className="flex items-center gap-1">
                                        Paciente <ArrowLeftRight className="h-4 w-4" /> Terapeuta
                                    </span>
                                </span>
                                {/* Desktop: Título em uma linha */}
                                <span className="hidden sm:flex items-center gap-2">
                                    Vínculos Paciente <ArrowLeftRight className="h-5 w-5" />{' '}
                                    Terapeuta
                                </span>
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1 leading-tight">
                                Gerencie os vínculos entre pacientes e terapeutas
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleCreateLink}
                        className="h-9 sm:h-10 rounded-[5px] flex-shrink-0 px-3 sm:px-4"
                    >
                        <Plus className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Novo Vínculo</span>
                    </Button>
                </div>
            </div>

            {/* Separador que pega a tela toda */}
            <hr className="border-gray-200 w-full" />

            {/* Conteúdo principal */}
            <div className="px-1 lg:px-4 py-4 space-y-4">
                {/* Filtros */}
                <LinkFilters filters={filters} onFiltersChange={setFilters} />

                {/* Lista de vínculos */}
                <LinkList
                    links={links}
                    patients={patients}
                    therapists={therapists}
                    filters={filters}
                    loading={loading}
                    onEditLink={handleEditLink}
                    onAddTherapist={handleAddTherapist}
                    onEndLink={handleEndLink}
                    onArchiveLink={handleArchiveLink}
                    onTransferResponsible={handleTransferResponsible}
                />

                {/* Modal de formulário */}
                <LinkFormModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmitLink}
                    initialData={editingLink}
                    patients={patients}
                    therapists={therapists}
                />

                {/* Dialog de arquivamento */}
                <ArchiveDialog
                    open={showArchiveDialog}
                    onClose={() => {
                        setShowArchiveDialog(false);
                        setArchivingLink(null);
                    }}
                    onConfirm={handleConfirmArchive}
                    link={archivingLink}
                    loading={archiveLoading}
                />

                {/* Dialog de transferência de responsável */}
                <TransferResponsibleDialog
                    open={showTransferDialog}
                    onClose={() => {
                        setShowTransferDialog(false);
                        setTransferringLink(null);
                    }}
                    onConfirm={handleConfirmTransfer}
                    link={transferringLink}
                    patient={
                        transferringLink
                            ? patients.find((p) => p.id === transferringLink.patientId)
                            : undefined
                    }
                    therapist={
                        transferringLink
                            ? therapists.find((t) => t.id === transferringLink.therapistId)
                            : undefined
                    }
                    therapists={therapists}
                    loading={transferLoading}
                />

                {/* Dialog de encerramento de vínculo */}
                <EndLinkDialog
                    open={showEndDialog}
                    onClose={() => {
                        setShowEndDialog(false);
                        setEndingLink(null);
                    }}
                    onConfirm={handleConfirmEnd}
                    link={endingLink}
                    loading={endLoading}
                />
            </div>
        </div>
    );
}
