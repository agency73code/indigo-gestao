import { useState, useEffect } from 'react';
import { ChevronLeft, ArrowLeftRight, Plus, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    LinkList,
    LinkFormModal,
    SupervisionLinkFormModal,
    ArchiveDialog,
    ArchiveSupervisionDialog,
    TransferResponsibleDialog,
    EndLinkDialog,
    EndSupervisionLinkDialog,
} from '../index';
import type {
    PatientTherapistLink,
    TherapistSupervisionLink,
    LinkFilters as LinkFiltersType,
    CreateLinkInput,
    UpdateLinkInput,
    CreateSupervisionLinkInput,
    UpdateSupervisionLinkInput,
    Paciente,
    Terapeuta,
    TransferResponsibleInput,
} from '../types';
import {
    getAllLinks,
    getAllSupervisionLinks,
    getAllPatients,
    getAllTherapists,
    createLink,
    updateLink,
    createSupervisionLink,
    updateSupervisionLink,
    transferResponsible,
    archiveLink,
    archiveSupervisionLink,
    endLink,
    endSupervisionLink,
} from '../services/links.service';

export default function VinculosPage() {
    const navigate = useNavigate();
    const [links, setLinks] = useState<PatientTherapistLink[]>([]);
    const [supervisionLinks, setSupervisionLinks] = useState<TherapistSupervisionLink[]>([]);
    const [patients, setPatients] = useState<Paciente[]>([]);
    const [therapists, setTherapists] = useState<Terapeuta[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estados para vínculos cliente-terapeuta
    const [showModal, setShowModal] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
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
    
    // Estados para vínculos de supervisão
    const [showSupervisionModal, setShowSupervisionModal] = useState(false);
    const [supervisionModalLoading, setSupervisionModalLoading] = useState(false);
    const [editingSupervisionLink, setEditingSupervisionLink] = useState<TherapistSupervisionLink | null>(null);
    const [showArchiveSupervisionDialog, setShowArchiveSupervisionDialog] = useState(false);
    const [archivingSupervisionLink, setArchivingSupervisionLink] = useState<TherapistSupervisionLink | null>(null);
    const [archiveSupervisionLoading, setArchiveSupervisionLoading] = useState(false);
    const [showEndSupervisionDialog, setShowEndSupervisionDialog] = useState(false);
    const [endingSupervisionLink, setEndingSupervisionLink] = useState<TherapistSupervisionLink | null>(null);
    const [endSupervisionLoading, setEndSupervisionLoading] = useState(false);
    
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
            const [linksData, supervisionLinksData, patientsData, therapistsData] = await Promise.all([
                getAllLinks(),
                getAllSupervisionLinks(),
                getAllPatients(),
                getAllTherapists(),
            ]);
            setLinks(linksData);
            setSupervisionLinks(supervisionLinksData);
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
            actuationArea: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            _isNewTherapistCreation: true, // Flag especial para identificar criação
        } as PatientTherapistLink & { _isNewTherapistCreation: boolean };

        setEditingLink(newTherapistTemplate);
        setShowModal(true);
    };

    const handleSubmitLink = async (data: CreateLinkInput | UpdateLinkInput) => {
        try {
            setModalLoading(true);
            
            if ('id' in data) {
                await updateLink(data as UpdateLinkInput);
                toast.success('Vínculo atualizado com sucesso!', {
                    description: 'As alterações foram salvas.',
                    duration: 3000,
                });
            } else {
                await createLink(data as CreateLinkInput);
                toast.success('Vínculo criado com sucesso! 🎉', {
                    description: 'O vínculo entre cliente e terapeuta foi estabelecido.',
                    duration: 4000,
                });
            }
            await loadData(); // Recarregar dados
            setShowModal(false);
        } catch (error: any) {
            console.error('Erro ao salvar vínculo:', error);
            
            // Mensagens de erro específicas
            const errorMessage = error?.message || error?.response?.data?.message;
            
            if (errorMessage?.toLowerCase().includes('já existe') || 
                errorMessage?.toLowerCase().includes('duplicado') ||
                errorMessage?.toLowerCase().includes('already exists')) {
                toast.error('Vínculo já existe', {
                    description: 'Este cliente já possui vínculo ativo com este terapeuta.',
                    duration: 5000,
                });
            } else if (errorMessage?.toLowerCase().includes('responsável') ||
                       errorMessage?.toLowerCase().includes('responsible')) {
                toast.error('Responsável já existe', {
                    description: 'Já existe um responsável principal ativo para este cliente.',
                    duration: 5000,
                });
            } else if (errorMessage?.toLowerCase().includes('não encontrado') ||
                       errorMessage?.toLowerCase().includes('not found')) {
                toast.error('Dados não encontrados', {
                    description: 'Cliente ou terapeuta não foi encontrado no sistema.',
                    duration: 4000,
                });
            } else if (errorMessage) {
                toast.error('Erro ao salvar vínculo', {
                    description: errorMessage,
                    duration: 5000,
                });
            } else {
                toast.error('Erro ao salvar vínculo', {
                    description: 'Ocorreu um erro inesperado. Tente novamente.',
                    duration: 4000,
                });
            }
        } finally {
            setModalLoading(false);
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

    // ==================== HANDLERS DE SUPERVISÃO ====================

    const handleCreateSupervisionLink = () => {
        setEditingSupervisionLink(null);
        setShowSupervisionModal(true);
    };

    const handleEditSupervisionLink = (link: TherapistSupervisionLink) => {
        setEditingSupervisionLink(link);
        setShowSupervisionModal(true);
    };

    const handleSubmitSupervisionLink = async (data: CreateSupervisionLinkInput | UpdateSupervisionLinkInput) => {
        try {
            setSupervisionModalLoading(true);
            
            if ('id' in data) {
                await updateSupervisionLink(data as UpdateSupervisionLinkInput);
                toast.success('Vínculo de supervisão atualizado!', {
                    description: 'As alterações foram salvas.',
                    duration: 3000,
                });
            } else {
                await createSupervisionLink(data as CreateSupervisionLinkInput);
                toast.success('Vínculo de supervisão criado! 🎉', {
                    description: 'O vínculo entre supervisor e terapeuta foi estabelecido.',
                    duration: 4000,
                });
            }
            await loadData();
            setShowSupervisionModal(false);
        } catch (error: any) {
            console.error('Erro ao salvar vínculo de supervisão:', error);
            
            const errorMessage = error?.message || error?.response?.data?.message;
            
            if (errorMessage?.toLowerCase().includes('já existe') || 
                errorMessage?.toLowerCase().includes('duplicado')) {
                toast.error('Vínculo já existe', {
                    description: 'Este supervisor já possui vínculo ativo com este terapeuta.',
                    duration: 5000,
                });
            } else if (errorMessage) {
                toast.error('Erro ao salvar vínculo de supervisão', {
                    description: errorMessage,
                    duration: 5000,
                });
            } else {
                toast.error('Erro ao salvar vínculo de supervisão', {
                    description: 'Ocorreu um erro inesperado. Tente novamente.',
                    duration: 4000,
                });
            }
        } finally {
            setSupervisionModalLoading(false);
        }
    };

    const handleEndSupervisionLink = async (link: TherapistSupervisionLink) => {
        setEndingSupervisionLink(link);
        setShowEndSupervisionDialog(true);
    };

    const handleConfirmEndSupervision = async (endDate: string) => {
        if (!endingSupervisionLink) return;

        try {
            setEndSupervisionLoading(true);
            await endSupervisionLink(endingSupervisionLink.id, endDate);
            await loadData();
            setShowEndSupervisionDialog(false);
            setEndingSupervisionLink(null);
            toast.success('Vínculo de supervisão encerrado', {
                description: 'O vínculo foi encerrado com sucesso.',
                duration: 3000,
            });
        } catch (error) {
            console.error('Erro ao encerrar vínculo de supervisão:', error);
            toast.error('Erro ao encerrar vínculo', {
                description: 'Ocorreu um erro ao encerrar o vínculo de supervisão.',
                duration: 4000,
            });
        } finally {
            setEndSupervisionLoading(false);
        }
    };

    const handleArchiveSupervisionLink = async (link: TherapistSupervisionLink) => {
        setArchivingSupervisionLink(link);
        setShowArchiveSupervisionDialog(true);
    };

    const handleConfirmArchiveSupervision = async () => {
        if (!archivingSupervisionLink) return;

        try {
            setArchiveSupervisionLoading(true);
            await archiveSupervisionLink(archivingSupervisionLink.id);
            await loadData();
            setShowArchiveSupervisionDialog(false);
            setArchivingSupervisionLink(null);
            toast.success('Vínculo de supervisão arquivado', {
                description: 'O vínculo foi arquivado com sucesso.',
                duration: 3000,
            });
        } catch (error: any) {
            if (error?.message) {
                toast.error('Erro ao arquivar vínculo', {
                    description: error?.message,
                    duration: 4000,
                });
            } else {
                toast.error('Erro ao arquivar vínculo', {
                    description: 'Ocorreu um erro ao arquivar o vínculo de supervisão.',
                    duration: 4000,
                });
            }
        } finally {
            setArchiveSupervisionLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header com botão voltar */}
            <div className="px-0 sm:px-4 py-3 sm:pt-4 pb-0">
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
                                        Cliente <ArrowLeftRight className="h-4 w-4" /> Terapeuta
                                    </span>
                                </span>
                                {/* Desktop: Título em uma linha */}
                                <span className="hidden sm:flex items-center gap-2">
                                    Vínculos 
                                </span>
                            </h1>
                            
                        </div>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="px-1 lg:px-4 py-4 space-y-4">
                {/* Linha com Filtros e Botões */}
                <div className="flex items-center gap-4">
                    {/* Busca - Esquerda */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                            placeholder="Buscar por nome, e-mail..."
                            value={filters.q || ''}
                            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                            className="pl-10 h-12 rounded-[5px]"
                        />
                    </div>

                    {/* Filtro de Status */}
                    <Select
                        value={filters.status || 'all'}
                        onValueChange={(value) => setFilters({ ...filters, status: value as any })}
                    >
                        <SelectTrigger
                            className="w-[170px] !h-12 min-h-12 rounded-[5px]"
                            aria-label="Filtrar por status"
                        >
                            <span className="text-sm">
                                {filters.status === 'all' || !filters.status ? 'Filtros' : 
                                 filters.status === 'active' ? 'Ativos' :
                                 filters.status === 'ended' ? 'Encerrados' : 'Arquivados'}
                            </span>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Ativos</SelectItem>
                            <SelectItem value="ended">Encerrados</SelectItem>
                            <SelectItem value="archived">Arquivados</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    {/* Botões - Direita */}
                    <div className="flex gap-2 ml-auto">
                        <Button
                            onClick={handleCreateLink}
                            className="h-12 rounded-[5px] flex-shrink-0 px-4"
                            variant="default"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            <span>Vínculo Cliente</span>
                        </Button>
                        <Button
                            onClick={handleCreateSupervisionLink}
                            className="h-12 rounded-[5px] flex-shrink-0 px-4"
                            variant="outline"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            <span>Vínculo Supervisão</span>
                        </Button>
                    </div>
                </div>

                {/* Tabs de visualização - Largura total */}
                <Tabs value={filters.viewBy} onValueChange={(value) => setFilters({ ...filters, viewBy: value as any })}>
                    <TabsList className="grid w-full grid-cols-3 h-10 rounded-[5px] p-1">
                        <TabsTrigger
                            value="patient"
                            className="rounded-[5px] data-[state=active]:rounded-[5px]"
                        >
                            Cliente
                        </TabsTrigger>
                        <TabsTrigger
                            value="therapist"
                            className="rounded-[5px] data-[state=active]:rounded-[5px]"
                        >
                            Terapeuta
                        </TabsTrigger>
                        <TabsTrigger
                            value="supervision"
                            className="rounded-[5px] data-[state=active]:rounded-[5px]"
                        >
                            Supervisão
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Lista de vínculos */}
                <LinkList
                    links={links}
                    supervisionLinks={supervisionLinks}
                    patients={patients}
                    therapists={therapists}
                    filters={filters}
                    loading={loading}
                    onEditLink={handleEditLink}
                    onAddTherapist={handleAddTherapist}
                    onEndLink={handleEndLink}
                    onArchiveLink={handleArchiveLink}
                    onTransferResponsible={handleTransferResponsible}
                    onEditSupervisionLink={handleEditSupervisionLink}
                    onEndSupervisionLink={handleEndSupervisionLink}
                    onArchiveSupervisionLink={handleArchiveSupervisionLink}
                />

                {/* Modal de formulário */}
                <LinkFormModal
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmitLink}
                    initialData={editingLink}
                    patients={patients}
                    therapists={therapists}
                    loading={modalLoading}
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

                {/* Modal de vínculo de supervisão */}
                <SupervisionLinkFormModal
                    open={showSupervisionModal}
                    onClose={() => setShowSupervisionModal(false)}
                    onSubmit={handleSubmitSupervisionLink}
                    initialData={editingSupervisionLink}
                    therapists={therapists}
                    loading={supervisionModalLoading}
                />

                {/* Dialog de encerramento de vínculo de supervisão */}
                <EndSupervisionLinkDialog
                    open={showEndSupervisionDialog}
                    onClose={() => {
                        setShowEndSupervisionDialog(false);
                        setEndingSupervisionLink(null);
                    }}
                    onConfirm={handleConfirmEndSupervision}
                    link={endingSupervisionLink}
                    loading={endSupervisionLoading}
                />

                {/* Dialog de arquivamento de vínculo de supervisão */}
                <ArchiveSupervisionDialog
                    open={showArchiveSupervisionDialog}
                    onClose={() => {
                        setShowArchiveSupervisionDialog(false);
                        setArchivingSupervisionLink(null);
                    }}
                    onConfirm={handleConfirmArchiveSupervision}
                    link={archivingSupervisionLink}
                    loading={archiveSupervisionLoading}
                />
            </div>
        </div>
    );
}
