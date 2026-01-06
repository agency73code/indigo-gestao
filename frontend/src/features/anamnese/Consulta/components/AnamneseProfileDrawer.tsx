import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Download, User, Stethoscope, Users, Baby, Utensils, GraduationCap, Brain, FileText, Loader2, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/layout/CloseButton';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/ui/label';
import SimpleStepSidebar from '@/features/consultas/components/SimpleStepSidebar';
import ReadOnlyField from './ReadOnlyField';
import AnamnesePrintView from '../print/AnamnesePrintView';
import { useAnamnesePrint } from '../print/useAnamnesePrint';
import { exportToWord } from '../print/word-export.service';
import '../print/anamnese-print-styles.css';
import type { AnamneseDetalhe } from '../types/anamnese-consulta.types';
import type { AnamneseListItem } from '../../Tabela/types/anamnese-table.types';
import { getAnamneseById } from '../services/anamnese-consulta.service';
import type { LucideIcon } from 'lucide-react';

// Seções de visualização
import { 
    IdentificacaoSection, 
    QueixaDiagnosticoSection,
    ContextoFamiliarSection,
    DesenvolvimentoSection,
    VidaDiariaSection,
    SocialAcademicoSection,
    ComportamentoSection,
    FinalizacaoSection,
    formatDate,
} from './sections';

// Importar componentes de step do cadastro para uso na edição
import QueixaDiagnosticoStep from '../../Cadastro/components/steps/QueixaDiagnosticoStep';
import ContextoFamiliarRotinaStep from '../../Cadastro/components/steps/ContextoFamiliarRotinaStep';
import DesenvolvimentoInicialStep from '../../Cadastro/components/steps/DesenvolvimentoInicialStep';
import AtividadesVidaDiariaStep from '../../Cadastro/components/steps/AtividadesVidaDiariaStep';
import SocialAcademicoStep from '../../Cadastro/components/steps/SocialAcademicoStep';
import ComportamentoStep from '../../Cadastro/components/steps/ComportamentoStep';
import FinalizacaoStep from '../../Cadastro/components/steps/FinalizacaoStep';

// Importar tipos do cadastro para conversão
import type { 
    AnamneseQueixaDiagnostico,
    AnamneseContextoFamiliarRotina,
    AnamneseDesenvolvimentoInicial,
    AnamneseAtividadesVidaDiaria,
    AnamneseSocialAcademico,
    AnamneseComportamento,
    AnamneseFinalizacao
} from '../../Cadastro/types/anamnese.types';

// Steps da anamnese com ícones
const STEPS = [
    'Identificação',
    'Queixa e Diagnóstico',
    'Contexto Familiar',
    'Desenvolvimento',
    'Vida Diária',
    'Social e Acadêmico',
    'Comportamento',
    'Finalização',
];

const STEP_ICONS: LucideIcon[] = [
    User,
    Stethoscope,
    Users,
    Baby,
    Utensils,
    GraduationCap,
    Brain,
    FileText,
];

interface AvatarWithSkeletonProps {
    src?: string | null;
    alt: string;
    initials: string;
}

const AvatarWithSkeleton = ({ src, alt, initials }: AvatarWithSkeletonProps) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    if (!src || imageError) {
        return <>{initials}</>;
    }

    return (
        <>
            {!imageLoaded && (
                <div className="absolute inset-0 bg-muted rounded-full animate-pulse" />
            )}
            <img
                src={src}
                alt={alt}
                className={`absolute inset-0 h-full w-full object-cover rounded-full transition-opacity duration-200 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                referrerPolicy="no-referrer"
                loading="eager"
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
            />
        </>
    );
};

interface AnamneseProfileDrawerProps {
    anamnese: AnamneseListItem | null;
    open: boolean;
    onClose: () => void;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export default function AnamneseProfileDrawer({ 
    anamnese, 
    open, 
    onClose
}: AnamneseProfileDrawerProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [anamneseDetalhe, setAnamneseDetalhe] = useState<AnamneseDetalhe | null>(null);
    const [editData, setEditData] = useState<AnamneseDetalhe | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportingWord, setExportingWord] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [_saveError, setSaveError] = useState<string | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Estados para dados de edição no formato de cadastro
    const [editQueixaDiagnostico, setEditQueixaDiagnostico] = useState<Partial<AnamneseQueixaDiagnostico>>({});
    const [editContextoFamiliar, setEditContextoFamiliar] = useState<Partial<AnamneseContextoFamiliarRotina>>({});
    const [editDesenvolvimento, setEditDesenvolvimento] = useState<Partial<AnamneseDesenvolvimentoInicial>>({});
    const [editVidaDiaria, setEditVidaDiaria] = useState<Partial<AnamneseAtividadesVidaDiaria>>({});
    const [editSocialAcademico, setEditSocialAcademico] = useState<Partial<AnamneseSocialAcademico>>({});
    const [editComportamento, setEditComportamento] = useState<Partial<AnamneseComportamento>>({});
    const [editFinalizacao, setEditFinalizacao] = useState<Partial<AnamneseFinalizacao>>({});

    // Dados a exibir - usa editData em modo edição, anamneseDetalhe em modo visualização
    const displayData = isEditMode && editData ? editData : anamneseDetalhe;

    // Converter dados de consulta para formato de cadastro quando entrar em modo edição
    const convertToCadastroFormat = useCallback((data: AnamneseDetalhe) => {
        // Queixa e Diagnóstico
        setEditQueixaDiagnostico({
            queixaPrincipal: data.queixaDiagnostico.queixaPrincipal,
            diagnosticoPrevio: data.queixaDiagnostico.diagnosticoPrevio,
            suspeitaCondicaoAssociada: data.queixaDiagnostico.suspeitaCondicaoAssociada,
            especialidadesConsultadas: data.queixaDiagnostico.especialidadesConsultadas.map(esp => ({
                id: esp.id,
                especialidade: esp.especialidade as any,
                nome: esp.nome,
                data: esp.data,
                observacao: esp.observacao,
                ativo: esp.ativo,
            })),
            medicamentosEmUso: data.queixaDiagnostico.medicamentosEmUso.map(med => ({
                id: med.id,
                nome: med.nome,
                dosagem: med.dosagem,
                dataInicio: med.dataInicio,
                motivo: med.motivo,
            })),
            examesPrevios: data.queixaDiagnostico.examesPrevios.map(exame => ({
                id: exame.id,
                nome: exame.nome,
                data: exame.data,
                resultado: exame.resultado,
                arquivos: exame.arquivos?.map(arq => ({
                    id: arq.id,
                    nome: arq.nome,
                    tipo: arq.tipo,
                    tamanho: arq.tamanho || 0,
                    url: arq.url,
                })) || [],
            })),
            terapiasPrevias: data.queixaDiagnostico.terapiasPrevias.map(ter => ({
                id: ter.id,
                profissional: ter.profissional,
                especialidadeAbordagem: ter.especialidadeAbordagem,
                tempoIntervencao: ter.tempoIntervencao,
                observacao: ter.observacao,
                ativo: ter.ativo,
            })),
        });

        // Contexto Familiar
        setEditContextoFamiliar({
            historicosFamiliares: (data.contextoFamiliarRotina.historicoFamiliar || []).map(hist => ({
                id: hist.id,
                condicaoDiagnostico: hist.condicao,
                parentesco: hist.parentesco,
                observacao: hist.observacao || '',
            })),
            atividadesRotina: (data.contextoFamiliarRotina.rotinaDiaria || []).map(rot => ({
                id: rot.id,
                atividade: rot.atividade || '',
                horario: rot.horario || '',
                responsavel: rot.responsavel || '',
                frequencia: rot.frequencia || '',
                observacao: rot.observacao || '',
            })),
        });

        // Desenvolvimento Inicial
        setEditDesenvolvimento({
            gestacaoParto: {
                tipoParto: (data.desenvolvimentoInicial.gestacaoParto.tipoParto === 'natural' || data.desenvolvimentoInicial.gestacaoParto.tipoParto === 'cesarea') 
                    ? data.desenvolvimentoInicial.gestacaoParto.tipoParto 
                    : null,
                semanas: typeof data.desenvolvimentoInicial.gestacaoParto.semanas === 'string' 
                    ? (data.desenvolvimentoInicial.gestacaoParto.semanas ? Number(data.desenvolvimentoInicial.gestacaoParto.semanas) : null)
                    : data.desenvolvimentoInicial.gestacaoParto.semanas,
                apgar1min: typeof data.desenvolvimentoInicial.gestacaoParto.apgar1min === 'string'
                    ? (data.desenvolvimentoInicial.gestacaoParto.apgar1min ? Number(data.desenvolvimentoInicial.gestacaoParto.apgar1min) : null)
                    : data.desenvolvimentoInicial.gestacaoParto.apgar1min,
                apgar5min: typeof data.desenvolvimentoInicial.gestacaoParto.apgar5min === 'string'
                    ? (data.desenvolvimentoInicial.gestacaoParto.apgar5min ? Number(data.desenvolvimentoInicial.gestacaoParto.apgar5min) : null)
                    : data.desenvolvimentoInicial.gestacaoParto.apgar5min,
                intercorrencias: data.desenvolvimentoInicial.gestacaoParto.intercorrencias,
            },
            neuropsicomotor: data.desenvolvimentoInicial.neuropsicomotor as any,
            falaLinguagem: data.desenvolvimentoInicial.falaLinguagem as any,
        });

        // Vida Diária
        setEditVidaDiaria({
            desfralde: data.atividadesVidaDiaria.desfralde as any,
            sono: data.atividadesVidaDiaria.sono as any,
            habitosHigiene: data.atividadesVidaDiaria.habitosHigiene as any,
            alimentacao: data.atividadesVidaDiaria.alimentacao as any,
        });

        // Social e Acadêmico
        setEditSocialAcademico({
            desenvolvimentoSocial: data.socialAcademico.interacaoSocial as any,
            desenvolvimentoAcademico: data.socialAcademico.vidaEscolar as any,
        });

        // Comportamento
        setEditComportamento({
            estereotipiasRituais: data.comportamento.estereotipiasRituais as any,
            problemasComportamento: data.comportamento.problemasComportamento as any,
        });

        // Finalização
        setEditFinalizacao({
            outrasInformacoesRelevantes: data.finalizacao.informacoesAdicionais,
            observacoesImpressoesTerapeuta: data.finalizacao.observacoesFinais,
            expectativasFamilia: data.finalizacao.expectativasFamilia,
        });
    }, []);

    // Função para atualizar campo aninhado do editData
    const updateEditData = useCallback((path: string, value: any) => {
        setEditData(prev => {
            if (!prev) return prev;
            const keys = path.split('.');
            const newData = JSON.parse(JSON.stringify(prev)); // deep clone
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    }, []);

    // Hook de impressão
    const handlePrint = useAnamnesePrint({
        content: () => printRef.current,
        documentTitle: `anamnese-${anamnese?.clienteNome?.replace(/\s+/g, '-').toLowerCase() || 'cliente'}`,
        onBeforeGetContent: () => {
            setExporting(true);
        },
        onAfterPrint: () => {
            setExporting(false);
        },
        onPrintError: (phase, error) => {
            setExporting(false);
            console.error(`Erro na impressão (fase: ${phase}):`, error);
            toast.error('Erro ao gerar PDF. Tente novamente.');
        },
    });

    // Carregar dados detalhados da anamnese
    useEffect(() => {
        if (open && anamnese?.id) {
            setLoading(true);
            setError(null);
            setIsEditMode(false);
            setSaveError(null);
            getAnamneseById(anamnese.id)
                .then(data => {
                    setAnamneseDetalhe(data);
                })
                .catch(err => {
                    setError(err.message);
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setAnamneseDetalhe(null);
            setCurrentStep(1);
            setIsEditMode(false);
            setSaveError(null);
        }
    }, [open, anamnese?.id]);

    const handleExport = useCallback(() => {
        if (!anamneseDetalhe) return;
        handlePrint();
    }, [anamneseDetalhe, handlePrint]);

    const handleExportWord = useCallback(async () => {
        if (!anamneseDetalhe || !printRef.current) return;
        
        setExportingWord(true);
        try {
            const filename = `anamnese-${anamneseDetalhe.cabecalho.clienteNome?.replace(/\s+/g, '-').toLowerCase() || 'cliente'}`;
            await exportToWord(printRef.current, { filename });
        } finally {
            setExportingWord(false);
        }
    }, [anamneseDetalhe]);

    const handleEdit = useCallback(() => {
        // Criar cópia dos dados para edição
        if (anamneseDetalhe) {
            setEditData(JSON.parse(JSON.stringify(anamneseDetalhe)));
            // Converter para formato de cadastro para usar os componentes de step
            convertToCadastroFormat(anamneseDetalhe);
        }
        setIsEditMode(true);
    }, [anamneseDetalhe, convertToCadastroFormat]);

    const handleCancelEdit = useCallback(() => {
        setIsEditMode(false);
        setSaveError(null);
        setEditData(null); // Descartar alterações
    }, []);

    const handleSave = useCallback(async () => {
        if (!editData) return;
        
        setIsSaving(true);
        setSaveError(null);
        try {
            // TODO: Implementar chamada de API para salvar
            console.log('Salvando alterações da anamnese:', editData);
            
            // Simular delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setIsEditMode(false);
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Erro ao salvar');
        } finally {
            setIsSaving(false);
        }
    }, [anamneseDetalhe]);

    const getStatusBadge = (status?: string) => {
        const isActive = status?.toUpperCase() === 'ATIVO';
        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
                {isActive ? 'Ativo' : 'Inativo'}
            </span>
        );
    };

    // Renderizar conteúdo por step
    const renderStepContent = () => {
        if (!displayData) return null;

        // Em modo de edição, usar os componentes de step do cadastro (seções 2-8)
        if (isEditMode) {
            switch (currentStep) {
                case 1: // Identificação - alguns campos editáveis
                    return (
                        <div className="space-y-6">
                            {/* Campos não editáveis - dados do cliente */}
                            <div className="p-4 bg-muted/50 border border-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    Os dados abaixo são do cadastro do cliente e não podem ser alterados aqui.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Data da Entrevista" value={formatDate(displayData.cabecalho.dataEntrevista)} />
                                <ReadOnlyField label="Profissional Responsável" value={displayData.cabecalho.profissionalNome} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Data de Nascimento" value={formatDate(displayData.cabecalho.dataNascimento)} />
                                <ReadOnlyField label="Idade" value={displayData.cabecalho.idade} />
                            </div>

                            {/* Campos editáveis */}
                            <div className="pt-4 border-t">
                                <p className="text-sm font-medium text-foreground mb-4">Dados da Entrevista (editáveis)</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Informante</Label>
                                        <Input
                                            value={editData?.cabecalho.informante || ''}
                                            onChange={(e) => updateEditData('cabecalho.informante', e.target.value)}
                                            placeholder="Nome do informante"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Parentesco</Label>
                                        <Input
                                            value={editData?.cabecalho.parentesco || ''}
                                            onChange={(e) => updateEditData('cabecalho.parentesco', e.target.value)}
                                            placeholder="Parentesco com o cliente"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4 space-y-2">
                                    <Label>Quem indicou</Label>
                                    <Input
                                        value={editData?.cabecalho.quemIndicou || ''}
                                        onChange={(e) => updateEditData('cabecalho.quemIndicou', e.target.value)}
                                        placeholder="Quem indicou o cliente"
                                    />
                                </div>
                            </div>
                        </div>
                    );

                case 2: // Queixa e Diagnóstico
                    return (
                        <QueixaDiagnosticoStep
                            data={editQueixaDiagnostico}
                            onChange={setEditQueixaDiagnostico}
                        />
                    );

                case 3: // Contexto Familiar
                    return (
                        <ContextoFamiliarRotinaStep
                            data={editContextoFamiliar}
                            onChange={setEditContextoFamiliar}
                        />
                    );

                case 4: // Desenvolvimento
                    return (
                        <DesenvolvimentoInicialStep
                            data={editDesenvolvimento}
                            onChange={setEditDesenvolvimento}
                        />
                    );

                case 5: // Vida Diária
                    return (
                        <AtividadesVidaDiariaStep
                            data={editVidaDiaria}
                            onChange={setEditVidaDiaria}
                        />
                    );

                case 6: // Social e Acadêmico
                    return (
                        <SocialAcademicoStep
                            data={editSocialAcademico}
                            onChange={setEditSocialAcademico}
                        />
                    );

                case 7: // Comportamento
                    return (
                        <ComportamentoStep
                            data={editComportamento}
                            onChange={setEditComportamento}
                        />
                    );

                case 8: // Finalização
                    return (
                        <FinalizacaoStep
                            data={editFinalizacao}
                            onChange={setEditFinalizacao}
                        />
                    );

                default:
                    return null;
            }
        }

        // Modo visualização - renderização original
        switch (currentStep) {
            case 1: // Identificação
                return <IdentificacaoSection data={displayData} />;

            case 2: // Queixa e Diagnóstico
                return <QueixaDiagnosticoSection data={displayData} />;

            case 3: // Contexto Familiar
                return <ContextoFamiliarSection data={displayData} />;

            case 4: // Desenvolvimento
                return <DesenvolvimentoSection data={displayData} />;

            case 5: // Vida Diária
                return <VidaDiariaSection data={displayData} />;

            case 6: // Social e Acadêmico
                return <SocialAcademicoSection data={displayData} />;

            case 7: // Comportamento
                return <ComportamentoSection data={displayData} />;

            case 8: // Finalização
                return <FinalizacaoSection data={displayData} />;

            default:
                return null;
        }
    };

    return (
        <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <SheetContent 
                side="right" 
                className="w-[75vw] max-w-[1400px] p-0 flex flex-col gap-0 rounded-2xl"
            >
                {/* Header */}
                <div className="flex items-center gap-4 px-6 py-4 bg-background shrink-0 rounded-2xl">
                    {/* Botão X - Esquerda */}
                    <CloseButton onClick={onClose} />

                    {/* Nome - Alinhado à esquerda */}
                    <SheetTitle 
                        className="text-primary" 
                        style={{ 
                            fontSize: 'var(--page-title-font-size)',
                            fontWeight: 'var(--page-title-font-weight)',
                            fontFamily: 'var(--page-title-font-family)'
                        }}
                    >
                        Anamnese de {anamnese?.clienteNome ?? 'Cliente'}
                    </SheetTitle>

                    {/* Botões - Direita com margin-left auto */}
                    <div className="ml-auto flex items-center gap-2">
                        {isEditMode ? (
                            <>
                                {/* Badge de Edição - mesmo estilo dos botões */}
                                <div 
                                    className="h-10 flex items-center gap-2 rounded-3xl border border-input bg-background text-muted-foreground font-sora text-sm font-medium animate-pulse"
                                    style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Editando...
                                </div>
                                {/* Botão Cancelar */}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                    className="h-10 gap-2 font-normal font-sora hover:scale-105 transition-transform"
                                    style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                >
                                    <X className="h-4 w-4" />
                                    Cancelar
                                </Button>
                                {/* Botão Salvar */}
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="h-10 gap-2 font-normal font-sora hover:scale-105 transition-transform"
                                    style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                >
                                    {isSaving ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {isSaving ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExport}
                                    disabled={exporting || loading}
                                    className="h-10 gap-2 font-normal font-sora hover:scale-105 transition-transform"
                                    style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                >
                                    {exporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    Exportar PDF
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleExportWord}
                                    disabled={exportingWord || loading}
                                    className="h-10 gap-2 font-normal font-sora hover:scale-105 transition-transform"
                                    style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                >
                                    {exportingWord ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <FileText className="h-4 w-4" />
                                    )}
                                    Exportar Word
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={handleEdit}
                                    disabled={loading || !anamneseDetalhe}
                                    className="h-10 gap-2 font-normal font-sora hover:scale-105 transition-transform"
                                    style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Editar
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Layout: Sidebar + Content */}
                <div className="flex flex-1 min-h-0 p-2 gap-2 bg-background pt-0 rounded-2xl">
                    {/* Sidebar de Navegação */}
                    <div className="w-64 bg-header-bg rounded-2xl shrink-0 shadow-sm flex flex-col">
                        {/* Avatar e Status no topo */}
                        <div className="flex flex-col items-center gap-3 p-4">
                            <div className="relative h-24 w-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl font-medium text-purple-600 dark:text-purple-300">
                                <AvatarWithSkeleton
                                    src={anamneseDetalhe?.cabecalho.clienteAvatarUrl}
                                    alt={anamnese?.clienteNome ?? ''}
                                    initials={getInitials(anamnese?.clienteNome ?? '')}
                                />
                            </div>
                            {anamneseDetalhe && getStatusBadge(anamneseDetalhe.status)}
                        </div>
                        
                        {/* Steps */}
                        <SimpleStepSidebar
                            currentStep={currentStep}
                            totalSteps={STEPS.length}
                            steps={STEPS}
                            stepIcons={STEP_ICONS}
                            onStepClick={setCurrentStep}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-h-0 bg-header-bg rounded-2xl overflow-hidden flex flex-col shadow-sm">
                        {/* Content - rolável */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-red-600">{error}</p>
                                </div>
                            ) : anamneseDetalhe ? (
                                renderStepContent()
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-muted-foreground">Nenhum dado encontrado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SheetContent>

            {/* Componente de impressão - renderizado via portal fora do Sheet */}
            {anamneseDetalhe && createPortal(
                <div 
                    id="anamnese-print-container"
                    className="fixed left-[-9999px] top-0 w-[210mm] bg-white"
                    style={{ zIndex: -1 }}
                    data-anamnese-print-root
                >
                    <AnamnesePrintView ref={printRef} anamnese={anamneseDetalhe} />
                </div>,
                document.body
            )}
        </Sheet>
    );
}
