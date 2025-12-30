import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Download, User, Stethoscope, Users, Baby, Utensils, GraduationCap, Brain, FileText, Loader2, Image, Paperclip, Save, X } from 'lucide-react';
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

// Componente de campo editável - alterna entre Input e ReadOnlyField baseado no modo
interface EditableFieldProps {
    label: string;
    value: string | undefined | null;
    isEditMode: boolean;
    onChange?: (value: string) => void;
    type?: 'text' | 'date' | 'textarea';
    placeholder?: string;
}

function EditableField({ label, value, isEditMode, onChange, type = 'text', placeholder }: EditableFieldProps) {
    if (!isEditMode) {
        return <ReadOnlyField label={label} value={value || 'Não informado'} />;
    }

    if (type === 'textarea') {
        return (
            <div className="space-y-2">
                <Label>{label}</Label>
                <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={value || ''}
                    onChange={(e) => onChange?.(e.target.value)}
                    placeholder={placeholder}
                />
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value || ''}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

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

// Mapa de relações para exibição
const PARENTESCO_LABELS: Record<string, string> = {
    'mae': 'Mãe',
    'pai': 'Pai',
    'avo': 'Avó/Avô',
    'tio': 'Tia/Tio',
    'responsavel': 'Responsável legal',
    'tutor': 'Tutor(a)',
    'outro': 'Outro',
};

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
    onEdit?: (anamnese: AnamneseDetalhe) => void;
}

function formatDate(value?: string | null): string {
    if (!value) return 'Não informado';
    const [year, month, day] = value.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
}

function formatMesAno(value?: string | null): string {
    if (!value) return 'Não informado';
    const [year, month] = value.split('T')[0].split('-');
    return `${month}/${year}`;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatSimNao(value: string | null | undefined): string {
    if (!value) return 'Não informado';
    return value === 'sim' ? 'Sim' : 'Não';
}

function formatSimNaoComAjuda(value: string | null | undefined): string {
    if (!value) return 'Não informado';
    if (value === 'sim') return 'Sim';
    if (value === 'nao') return 'Não';
    if (value === 'com_ajuda') return 'Com ajuda';
    return value;
}

function formatMarcoDesenvolvimento(marco: { meses: string; status: string }): string {
    if (marco.status === 'naoRealiza') return 'Não realiza';
    if (marco.status === 'naoSoubeInformar') return 'Não soube informar';
    if (marco.meses) return `${marco.meses} meses`;
    return 'Não informado';
}

export default function AnamneseProfileDrawer({ 
    anamnese, 
    open, 
    onClose,
    onEdit: _onEdit 
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
            historicosFamiliares: data.contextoFamiliarRotina.historicoFamiliar.map(hist => ({
                id: hist.id,
                condicaoDiagnostico: hist.condicao,
                parentesco: hist.parentesco,
                observacao: hist.observacao || '',
            })),
            atividadesRotina: data.contextoFamiliarRotina.rotinaDiaria.map(rot => ({
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

    // Função para atualizar item de array no editData
    const updateArrayItem = useCallback((arrayPath: string, index: number, field: string, value: any) => {
        setEditData(prev => {
            if (!prev) return prev;
            const newData = JSON.parse(JSON.stringify(prev));
            const keys = arrayPath.split('.');
            let current: any = newData;
            for (const key of keys) {
                current = current[key];
            }
            if (Array.isArray(current) && current[index]) {
                current[index][field] = value;
            }
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
        onPrintError: () => {
            setExporting(false);
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

    const getStatusBadge = (status: string) => {
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
                return (
                    <div className="space-y-6">
                        {/* Dados da Entrevista */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="Data da Entrevista" value={formatDate(displayData.cabecalho.dataEntrevista)} />
                            <ReadOnlyField label="Profissional Responsável" value={displayData.cabecalho.profissionalNome} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="Data de Nascimento" value={formatDate(displayData.cabecalho.dataNascimento)} />
                            <ReadOnlyField label="Idade" value={displayData.cabecalho.idade} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="Informante" value={displayData.cabecalho.informante} />
                            <ReadOnlyField 
                                label="Parentesco" 
                                value={
                                    displayData.cabecalho.parentesco === 'outro' && displayData.cabecalho.parentescoDescricao
                                        ? displayData.cabecalho.parentescoDescricao
                                        : (PARENTESCO_LABELS[displayData.cabecalho.parentesco] || displayData.cabecalho.parentesco)
                                } 
                            />
                        </div>
                        <ReadOnlyField label="Quem indicou" value={displayData.cabecalho.quemIndicou} />

                        {/* Cuidadores do Cliente */}
                        {displayData.cabecalho.cuidadores && displayData.cabecalho.cuidadores.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Cuidadores</h4>
                                <div className="space-y-3">
                                    {displayData.cabecalho.cuidadores.map((cuidador, _index) => {
                                        // Calcular idade a partir da data de nascimento
                                        const calcularIdade = (dataNasc?: string) => {
                                            if (!dataNasc) return null;
                                            const hoje = new Date();
                                            const nascimento = new Date(dataNasc);
                                            let idade = hoje.getFullYear() - nascimento.getFullYear();
                                            const m = hoje.getMonth() - nascimento.getMonth();
                                            if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
                                                idade--;
                                            }
                                            return idade;
                                        };
                                        const idade = calcularIdade(cuidador.dataNascimento);
                                        
                                        return (
                                        <div key={cuidador.id} className="p-4 border rounded-lg bg-muted/30">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                                    {cuidador.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{cuidador.nome}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {cuidador.relacao === 'Outro' && cuidador.descricaoRelacao 
                                                            ? cuidador.descricaoRelacao 
                                                            : cuidador.relacao}
                                                        {idade !== null && ` • ${idade} anos`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {cuidador.dataNascimento && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                                                        <p className="text-sm">{new Date(cuidador.dataNascimento).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                )}
                                                {idade !== null && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Idade</p>
                                                        <p className="text-sm">{idade} anos</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-muted-foreground">Telefone</p>
                                                    <p className="text-sm">{cuidador.telefone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-muted-foreground">E-mail</p>
                                                    <p className="text-sm">{cuidador.email}</p>
                                                </div>
                                                {cuidador.escolaridade && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Escolaridade</p>
                                                        <p className="text-sm">{cuidador.escolaridade}</p>
                                                    </div>
                                                )}
                                                {cuidador.profissao && (
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Profissão</p>
                                                        <p className="text-sm">{cuidador.profissao}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );})}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 2: // Queixa e Diagnóstico
                return (
                    <div className="space-y-6">
                        <ReadOnlyField label="1. Queixa Principal Atual" value={displayData.queixaDiagnostico.queixaPrincipal} />
                        <ReadOnlyField label="2. Diagnóstico Prévio" value={displayData.queixaDiagnostico.diagnosticoPrevio} />
                        <ReadOnlyField label="3. Há Suspeita de Outra Condição Associada?" value={displayData.queixaDiagnostico.suspeitaCondicaoAssociada} />
                        
                        {displayData.queixaDiagnostico.especialidadesConsultadas.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">4. Médicos Consultados até o Momento</h4>
                                <div className="space-y-2">
                                    {displayData.queixaDiagnostico.especialidadesConsultadas.map(esp => (
                                        <div key={esp.id} className="p-3 border rounded-lg bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm">{esp.nome}</p>
                                                        <span className={`text-xs px-2 py-0.5 rounded ${esp.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {esp.ativo ? 'Ainda consulta' : 'Não consulta mais'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{esp.especialidade}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{formatMesAno(esp.data)}</span>
                                            </div>
                                            {esp.observacao && <p className="text-xs mt-1">{esp.observacao}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayData.queixaDiagnostico.medicamentosEmUso.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">5. Uso de Medicamentos</h4>
                                <div className="space-y-2">
                                    {displayData.queixaDiagnostico.medicamentosEmUso.map(med => (
                                        <div key={med.id} className="p-3 border rounded-lg bg-muted/30">
                                            <p className="font-medium text-sm">{med.nome} - {med.dosagem}</p>
                                            <p className="text-xs text-muted-foreground">Início: {formatDate(med.dataInicio)} | Motivo: {med.motivo}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayData.queixaDiagnostico.examesPrevios.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">6. Exames Prévios Realizados</h4>
                                <div className="space-y-3">
                                    {displayData.queixaDiagnostico.examesPrevios.map(exame => (
                                        <div key={exame.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-semibold text-sm text-foreground">{exame.nome}</p>
                                                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{formatDate(exame.data)}</span>
                                            </div>
                                            {exame.resultado && (
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    <span className="font-medium">Resultado:</span> {exame.resultado}
                                                </p>
                                            )}
                                            {exame.arquivos && exame.arquivos.length > 0 && (
                                                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Paperclip className="h-4 w-4 text-blue-600" />
                                                        <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                            Anexos ({exame.arquivos.length})
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                        {exame.arquivos.map(arquivo => (
                                                            <a
                                                                key={arquivo.id}
                                                                href={arquivo.url || '#'}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-2 p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
                                                            >
                                                                <div className={`p-1.5 rounded-md ${arquivo.tipo.startsWith('image/') ? 'bg-purple-100' : 'bg-orange-100'}`}>
                                                                    {arquivo.tipo.startsWith('image/') ? (
                                                                        <Image className="h-4 w-4 text-purple-600" />
                                                                    ) : (
                                                                        <FileText className="h-4 w-4 text-orange-600" />
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-medium text-foreground truncate group-hover:text-blue-700 transition-colors">
                                                                        {arquivo.nome}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground">
                                                                        {arquivo.tipo.startsWith('image/') ? 'Imagem' : 'Documento'}
                                                                    </p>
                                                                </div>
                                                                <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-blue-600 transition-colors" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {displayData.queixaDiagnostico.terapiasPrevias.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">7. Terapias Prévias e/ou em Andamento</h4>
                                <div className="space-y-2">
                                    {displayData.queixaDiagnostico.terapiasPrevias.map(ter => (
                                        <div key={ter.id} className="p-3 border rounded-lg bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-sm">{ter.profissional}</p>
                                                    <p className="text-xs text-muted-foreground">{ter.especialidadeAbordagem}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-0.5 rounded ${ter.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {ter.ativo ? 'Ativo' : 'Finalizado'}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-1">Tempo: {ter.tempoIntervencao}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 3: // Contexto Familiar
                return (
                    <div className="space-y-6">
                        {/* 8. Histórico Familiar */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">8. Histórico Familiar</h4>
                            {(displayData.contextoFamiliarRotina.historicoFamiliar.length > 0 || isEditMode) ? (
                                <div className="space-y-3">
                                    {displayData.contextoFamiliarRotina.historicoFamiliar.map((hist, index) => (
                                        <div key={hist.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Registro {index + 1}
                                                </span>
                                            </div>
                                            {isEditMode ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                        <div className="md:col-span-3">
                                                            <EditableField label="Condição/Diagnóstico" value={hist.condicao} isEditMode={isEditMode} onChange={(v) => updateArrayItem('contextoFamiliarRotina.historicoFamiliar', index, 'condicao', v)} />
                                                        </div>
                                                        <div>
                                                            <EditableField label="Parentesco" value={hist.parentesco} isEditMode={isEditMode} onChange={(v) => updateArrayItem('contextoFamiliarRotina.historicoFamiliar', index, 'parentesco', v)} />
                                                        </div>
                                                    </div>
                                                    <EditableField label="Observações" value={hist.observacao} isEditMode={isEditMode} type="textarea" onChange={(v) => updateArrayItem('contextoFamiliarRotina.historicoFamiliar', index, 'observacao', v)} />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                                                        <div className="md:col-span-3">
                                                            <p className="text-xs text-muted-foreground">Condição/Diagnóstico</p>
                                                            <p className="text-sm font-medium">{hist.condicao || 'Não informado'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Parentesco</p>
                                                            <p className="text-sm font-medium">{hist.parentesco || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                    {hist.observacao && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <p className="text-xs text-muted-foreground">Observações</p>
                                                            <p className="text-sm">{hist.observacao}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                                    Nenhum registro de histórico familiar
                                </div>
                            )}
                        </div>

                        {/* 9. Rotina Atual */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">9. Rotina Atual</h4>
                            <p className="text-xs text-muted-foreground mb-3">(Esportes, música, entre outros)</p>
                            {(displayData.contextoFamiliarRotina.rotinaDiaria.length > 0 || isEditMode) ? (
                                <div className="space-y-3">
                                    {displayData.contextoFamiliarRotina.rotinaDiaria.map((rot, index) => (
                                        <div key={rot.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Atividade {index + 1}
                                                </span>
                                            </div>
                                            {isEditMode ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                        <div className="md:col-span-2">
                                                            <EditableField label="Atividade" value={rot.atividade} isEditMode={isEditMode} onChange={(v) => updateArrayItem('contextoFamiliarRotina.rotinaDiaria', index, 'atividade', v)} />
                                                        </div>
                                                        <EditableField label="Horário" value={rot.horario} isEditMode={isEditMode} onChange={(v) => updateArrayItem('contextoFamiliarRotina.rotinaDiaria', index, 'horario', v)} />
                                                        <EditableField label="Responsável" value={rot.responsavel} isEditMode={isEditMode} onChange={(v) => updateArrayItem('contextoFamiliarRotina.rotinaDiaria', index, 'responsavel', v)} />
                                                        <EditableField label="Frequência" value={rot.frequencia} isEditMode={isEditMode} onChange={(v) => updateArrayItem('contextoFamiliarRotina.rotinaDiaria', index, 'frequencia', v)} />
                                                    </div>
                                                    <EditableField label="Observações" value={rot.observacao} isEditMode={isEditMode} type="textarea" onChange={(v) => updateArrayItem('contextoFamiliarRotina.rotinaDiaria', index, 'observacao', v)} />
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                                                        <div className="md:col-span-2">
                                                            <p className="text-xs text-muted-foreground">Atividade</p>
                                                            <p className="text-sm font-medium">{rot.atividade || 'Não informado'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Horário</p>
                                                            <p className="text-sm font-medium">{rot.horario || 'Não informado'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Responsável</p>
                                                            <p className="text-sm font-medium">{rot.responsavel || 'Não informado'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Frequência</p>
                                                            <p className="text-sm font-medium">{rot.frequencia || 'Não informado'}</p>
                                                        </div>
                                                    </div>
                                                    {rot.observacao && (
                                                        <div className="mt-3 pt-3 border-t">
                                                            <p className="text-xs text-muted-foreground">Observações</p>
                                                            <p className="text-sm">{rot.observacao}</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                                    Nenhuma atividade na rotina cadastrada
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 4: // Desenvolvimento
                const dev = displayData.desenvolvimentoInicial;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">10. Gestação e Parto</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <EditableField label="Tipo de Parto" value={dev.gestacaoParto.tipoParto} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.gestacaoParto.tipoParto', v)} />
                                <EditableField label="Semanas" value={dev.gestacaoParto.semanas} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.gestacaoParto.semanas', v)} />
                                <EditableField label="APGAR 1min" value={dev.gestacaoParto.apgar1min} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.gestacaoParto.apgar1min', v)} />
                                <EditableField label="APGAR 5min" value={dev.gestacaoParto.apgar5min} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.gestacaoParto.apgar5min', v)} />
                            </div>
                            <div className="mt-4">
                                <EditableField label="Intercorrências" value={dev.gestacaoParto.intercorrencias} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('desenvolvimentoInicial.gestacaoParto.intercorrencias', v)} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">11. Desenvolvimento Neuropsicomotor</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label="Sustentou cabeça" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sustentouCabeca)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.sustentouCabeca.meses', v)} />
                                <EditableField label="Rolou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.rolou)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.rolou.meses', v)} />
                                <EditableField label="Sentou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sentou)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.sentou.meses', v)} />
                                <EditableField label="Engatinhou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.engatinhou)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.engatinhou.meses', v)} />
                                <EditableField label="Andou com apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouComApoio)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.andouComApoio.meses', v)} />
                                <EditableField label="Andou sem apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouSemApoio)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.andouSemApoio.meses', v)} />
                                <EditableField label="Correu" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.correu)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.correu.meses', v)} />
                                <EditableField label="Andou de motoca" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeMotoca)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.andouDeMotoca.meses', v)} />
                                <EditableField label="Andou de bicicleta" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeBicicleta)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.andouDeBicicleta.meses', v)} />
                                <EditableField label="Subiu escadas sozinho" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.subiuEscadasSozinho)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.subiuEscadasSozinho.meses', v)} />
                            </div>
                            <div className="mt-4">
                                <EditableField label="Motricidade Fina" value={dev.neuropsicomotor.motricidadeFina} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('desenvolvimentoInicial.neuropsicomotor.motricidadeFina', v)} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">12. Desenvolvimento da Fala e da Linguagem</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label="Balbuciou" value={formatMarcoDesenvolvimento(dev.falaLinguagem.balbuciou)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.balbuciou.meses', v)} />
                                <EditableField label="Primeiras palavras" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasPalavras)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.primeirasPalavras.meses', v)} />
                                <EditableField label="Primeiras frases" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasFrases)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.primeirasFrases.meses', v)} />
                                <EditableField label="Apontou para pedir" value={formatMarcoDesenvolvimento(dev.falaLinguagem.apontouParaFazerPedidos)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.apontouParaFazerPedidos.meses', v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <EditableField label="Faz uso de gestos" value={formatSimNao(dev.falaLinguagem.fazUsoDeGestos)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.fazUsoDeGestos', v)} />
                            </div>
                            {dev.falaLinguagem.fazUsoDeGestos === 'sim' && dev.falaLinguagem.fazUsoDeGestosQuais && (
                                <div className="mt-3">
                                    <EditableField label="Quais gestos" value={dev.falaLinguagem.fazUsoDeGestosQuais} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.fazUsoDeGestosQuais', v)} />
                                </div>
                            )}

                            {/* Comunicação Atual - movido para depois de Faz uso de gestos */}
                            <div className="mt-4">
                                <EditableField label="Comunicação Atual" value={dev.falaLinguagem.comunicacaoAtual} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.comunicacaoAtual', v)} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <EditableField label="Audição (percepção do responsável)" value={dev.falaLinguagem.audicao === 'boa' ? 'Boa' : dev.falaLinguagem.audicao === 'ruim' ? 'Ruim' : dev.falaLinguagem.audicao} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.audicao', v)} />
                                <EditableField label="Teve otite de repetição" value={formatSimNao(dev.falaLinguagem.teveOtiteDeRepeticao)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.teveOtiteDeRepeticao', v)} />
                            </div>
                            {dev.falaLinguagem.teveOtiteDeRepeticao === 'sim' && dev.falaLinguagem.otiteDetalhes && (
                                <div className="mt-3">
                                    <EditableField label="Detalhes da otite (quantas vezes, período, frequência)" value={dev.falaLinguagem.otiteDetalhes} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.otiteDetalhes', v)} />
                                </div>
                            )}
                            <div className="mt-3">
                                <EditableField label="Faz ou fez uso de tubo de ventilação" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoTuboVentilacao)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.fazOuFezUsoTuboVentilacao', v)} />
                            </div>
                            {dev.falaLinguagem.fazOuFezUsoTuboVentilacao === 'sim' && dev.falaLinguagem.tuboVentilacaoObservacao && (
                                <div className="mt-3">
                                    <EditableField label="Observação do tubo de ventilação" value={dev.falaLinguagem.tuboVentilacaoObservacao} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.tuboVentilacaoObservacao', v)} />
                                </div>
                            )}

                            {/* Hábitos orais */}
                            <h5 className="text-sm font-medium text-muted-foreground mt-4 mb-3">Hábitos Orais</h5>
                            <div className="space-y-3">
                                <EditableField label="Faz ou fez uso de objeto oral (chupeta, paninho, dedo)" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoObjetoOral)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.fazOuFezUsoObjetoOral', v)} />
                                {dev.falaLinguagem.fazOuFezUsoObjetoOral === 'sim' && dev.falaLinguagem.objetoOralEspecificar && (
                                    <EditableField label="Especificação (manhã, tarde e/ou noite)" value={dev.falaLinguagem.objetoOralEspecificar} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.objetoOralEspecificar', v)} />
                                )}
                                <EditableField label="Usa mamadeira" value={formatSimNao(dev.falaLinguagem.usaMamadeira)} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.usaMamadeira', v)} />
                                {dev.falaLinguagem.usaMamadeira === 'sim' && dev.falaLinguagem.mamadeiraDetalhes && (
                                    <EditableField label="Detalhes (há quantos anos/meses, quantas vezes ao dia)" value={dev.falaLinguagem.mamadeiraDetalhes} isEditMode={isEditMode} onChange={(v) => updateEditData('desenvolvimentoInicial.falaLinguagem.mamadeiraDetalhes', v)} />
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 5: // Vida Diária
                const avd = displayData.atividadesVidaDiaria;
                
                // Helper para formatar desfralde
                const formatDesfralde = (item: { anos: string; meses: string; utilizaFralda: boolean }) => {
                    if (item.utilizaFralda) return 'Utiliza fralda';
                    const anos = item.anos ? `${item.anos} ano${item.anos !== '1' ? 's' : ''}` : '';
                    const meses = item.meses ? `${item.meses} ${item.meses === '1' ? 'mês' : 'meses'}` : '';
                    if (!anos && !meses) return 'Não informado';
                    return [anos, meses].filter(Boolean).join(' e ');
                };
                
                return (
                    <div className="space-y-6">
                        {/* 13. Desfralde */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">13. Desfralde</h4>
                            <div className="space-y-3">
                                <EditableField label="Desfralde para urina (diurno) realizado com" value={formatDesfralde(avd.desfralde.desfraldeDiurnoUrina)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.desfraldeDiurnoUrina.meses', v)} />
                                <EditableField label="Desfralde para urina (noturno) realizado com" value={formatDesfralde(avd.desfralde.desfraldeNoturnoUrina)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.desfraldeNoturnoUrina.meses', v)} />
                                <EditableField label="Desfralde para fezes realizado com" value={formatDesfralde(avd.desfralde.desfraldeFezes)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.desfraldeFezes.meses', v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <EditableField label="Se limpa sozinho para urinar" value={formatSimNao(avd.desfralde.seLimpaSozinhoUrinar)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.seLimpaSozinhoUrinar', v)} />
                                <EditableField label="Se limpa sozinho para defecar" value={formatSimNao(avd.desfralde.seLimpaSozinhoDefecar)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.seLimpaSozinhoDefecar', v)} />
                                <EditableField label="Lava as mãos após uso do banheiro" value={formatSimNao(avd.desfralde.lavaAsMaosAposUsoBanheiro)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.lavaAsMaosAposUsoBanheiro', v)} />
                                <EditableField label="Alteração no hábito intestinal" value={formatSimNao(avd.desfralde.apresentaAlteracaoHabitoIntestinal)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.apresentaAlteracaoHabitoIntestinal', v)} />
                            </div>
                            {(avd.desfralde.observacoes || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Observações" value={avd.desfralde.observacoes} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('atividadesVidaDiaria.desfralde.observacoes', v)} />
                                </div>
                            )}
                        </div>

                        {/* 14. Sono */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">14. Sono</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label="Horas de sono por noite" value={avd.sono.dormemMediaHorasNoite ? `${avd.sono.dormemMediaHorasNoite} horas` : 'Não informado'} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.dormemMediaHorasNoite', v)} />
                                <EditableField label="Horas de sono durante o dia" value={avd.sono.dormemMediaHorasDia ? `${avd.sono.dormemMediaHorasDia} horas` : 'Não dorme durante o dia'} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.dormemMediaHorasDia', v)} />
                                <EditableField label="Período do sono durante o dia" value={avd.sono.periodoSonoDia === 'manha' ? 'Manhã' : avd.sono.periodoSonoDia === 'tarde' ? 'Tarde' : 'Não informado'} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.periodoSonoDia', v)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <EditableField label="Dificuldade para iniciar o sono" value={formatSimNao(avd.sono.temDificuldadeIniciarSono)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.temDificuldadeIniciarSono', v)} />
                                <EditableField label="Acorda de madrugada" value={formatSimNao(avd.sono.acordaDeMadrugada)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.acordaDeMadrugada', v)} />
                                <EditableField label="Dorme na própria cama" value={formatSimNao(avd.sono.dormeNaPropriaCama)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.dormeNaPropriaCama', v)} />
                                <EditableField label="Dorme no próprio quarto" value={formatSimNao(avd.sono.dormeNoProprioQuarto)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.dormeNoProprioQuarto', v)} />
                                <EditableField label="Apresenta sono agitado" value={formatSimNao(avd.sono.apresentaSonoAgitado)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.apresentaSonoAgitado', v)} />
                                <EditableField label="É sonâmbulo" value={formatSimNao(avd.sono.eSonambulo)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.sono.eSonambulo', v)} />
                            </div>
                            {(avd.sono.observacoes || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Observações" value={avd.sono.observacoes} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('atividadesVidaDiaria.sono.observacoes', v)} />
                                </div>
                            )}
                        </div>

                        {/* 15. Hábitos Diários de Higiene */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">15. Hábitos Diários de Higiene</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label="Toma banho e lava o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.tomaBanhoLavaCorpoTodo)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.tomaBanhoLavaCorpoTodo', v)} />
                                <EditableField label="Seca o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.secaCorpoTodo)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.secaCorpoTodo', v)} />
                                <EditableField label="Retira todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.retiraTodasPecasRoupa)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.retiraTodasPecasRoupa', v)} />
                                <EditableField label="Coloca todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.colocaTodasPecasRoupa)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.colocaTodasPecasRoupa', v)} />
                                <EditableField label="Põe calçados sem cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosSemCadarco)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.poeCalcadosSemCadarco', v)} />
                                <EditableField label="Põe calçados com cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosComCadarco)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.poeCalcadosComCadarco', v)} />
                                <EditableField label="Escova os dentes" value={formatSimNaoComAjuda(avd.habitosHigiene.escovaOsDentes)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.escovaOsDentes', v)} />
                                <EditableField label="Penteia o cabelo" value={formatSimNaoComAjuda(avd.habitosHigiene.penteiaOCabelo)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.penteiaOCabelo', v)} />
                            </div>
                            {(avd.habitosHigiene.observacoes || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Observações" value={avd.habitosHigiene.observacoes} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('atividadesVidaDiaria.habitosHigiene.observacoes', v)} />
                                </div>
                            )}
                        </div>

                        {/* 16. Alimentação */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">16. Alimentação</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label="Apresenta queixa quanto a alimentação" value={formatSimNao(avd.alimentacao.apresentaQueixaAlimentacao)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.apresentaQueixaAlimentacao', v)} />
                                <EditableField label="Se alimenta sozinho" value={formatSimNao(avd.alimentacao.seAlimentaSozinho)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.seAlimentaSozinho', v)} />
                                <EditableField label="É seletivo quanto aos alimentos" value={formatSimNao(avd.alimentacao.eSeletivoQuantoAlimentos)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.eSeletivoQuantoAlimentos', v)} />
                                <EditableField label="Passa longos períodos sem comer" value={formatSimNao(avd.alimentacao.passaDiaInteiroSemComer)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.passaDiaInteiroSemComer', v)} />
                                <EditableField label="Apresenta rituais para se alimentar" value={formatSimNao(avd.alimentacao.apresentaRituaisParaAlimentar)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.apresentaRituaisParaAlimentar', v)} />
                                <EditableField label="Está abaixo ou acima do peso" value={formatSimNao(avd.alimentacao.estaAbaixoOuAcimaPeso)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.estaAbaixoOuAcimaPeso', v)} />
                            </div>
                            {(avd.alimentacao.estaAbaixoOuAcimaPeso === 'sim' || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Peso/Altura e acompanhamento" value={avd.alimentacao.estaAbaixoOuAcimaPesoDescricao} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.estaAbaixoOuAcimaPesoDescricao', v)} />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <EditableField label="Tem histórico de anemia" value={formatSimNao(avd.alimentacao.temHistoricoAnemia)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.temHistoricoAnemia', v)} />
                            </div>
                            {(avd.alimentacao.temHistoricoAnemia === 'sim' || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Histórico de anemia - desde quando" value={avd.alimentacao.temHistoricoAnemiaDescricao} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.temHistoricoAnemiaDescricao', v)} />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <EditableField label="Rotina alimentar é problema para a família" value={formatSimNao(avd.alimentacao.rotinaAlimentarEProblemaFamilia)} isEditMode={isEditMode} onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.rotinaAlimentarEProblemaFamilia', v)} />
                            </div>
                            {(avd.alimentacao.rotinaAlimentarEProblemaFamilia === 'sim' || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Maiores dificuldades" value={avd.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao', v)} />
                                </div>
                            )}
                            {(avd.alimentacao.observacoes || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Observações" value={avd.alimentacao.observacoes} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('atividadesVidaDiaria.alimentacao.observacoes', v)} />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 6: // Social e Acadêmico
                const social = displayData.socialAcademico;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">17. Desenvolvimento Social (Relações Interpessoais e Brincar)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label="Brinca com outras crianças" value={formatSimNao(social.interacaoSocial.brincaComOutrasCriancas)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.interacaoSocial.brincaComOutrasCriancas', v)} />
                                <EditableField label="Mantém contato visual" value={formatSimNao(social.interacaoSocial.mantemContatoVisual)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.interacaoSocial.mantemContatoVisual', v)} />
                                <EditableField label="Responde ao chamar" value={formatSimNao(social.interacaoSocial.respondeAoChamar)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.interacaoSocial.respondeAoChamar', v)} />
                                <EditableField label="Compartilha interesses" value={formatSimNao(social.interacaoSocial.compartilhaInteresses)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.interacaoSocial.compartilhaInteresses', v)} />
                            </div>
                            <div className="mt-3">
                                <EditableField label="Tipo de brincadeira" value={social.interacaoSocial.tipoBrincadeira} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('socialAcademico.interacaoSocial.tipoBrincadeira', v)} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">18. Desenvolvimento Acadêmico</h4>
                            
                            {/* Dados da escola */}
                            <div className="space-y-3">
                                <EditableField label="Escola" value={social.vidaEscolar.escola} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.escola', v)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <EditableField label="Ano/Série" value={social.vidaEscolar.ano} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.ano', v)} />
                                    <EditableField label="Período" value={social.vidaEscolar.periodo} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.periodo', v)} />
                                </div>
                                <EditableField label="Direção" value={social.vidaEscolar.direcao} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.direcao', v)} />
                                <EditableField label="Coordenação" value={social.vidaEscolar.coordenacao} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.coordenacao', v)} />
                                <div className="grid grid-cols-2 gap-3">
                                    <EditableField label="Professora Principal" value={social.vidaEscolar.professoraPrincipal} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.professoraPrincipal', v)} />
                                    <EditableField label="Professora Assistente" value={social.vidaEscolar.professoraAssistente} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.professoraAssistente', v)} />
                                </div>
                            </div>

                            {/* Campos Sim/Não */}
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                                <EditableField label="Frequenta escola regular" value={formatSimNao(social.vidaEscolar.frequentaEscolaRegular)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.frequentaEscolaRegular', v)} />
                                <EditableField label="Frequenta escola especial" value={formatSimNao(social.vidaEscolar.frequentaEscolaEspecial)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.frequentaEscolaEspecial', v)} />
                                <EditableField label="Acompanha a turma (demandas pedagógicas)" value={formatSimNao(social.vidaEscolar.acompanhaTurmaDemandasPedagogicas)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.acompanhaTurmaDemandasPedagogicas', v)} />
                                <EditableField label="Segue regras e rotinas de sala" value={formatSimNao(social.vidaEscolar.segueRegrasRotinaSalaAula)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.segueRegrasRotinaSalaAula', v)} />
                                <EditableField label="Necessita apoio de AT" value={formatSimNao(social.vidaEscolar.necessitaApoioAT)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.necessitaApoioAT', v)} />
                                <EditableField label="Necessita adaptação de materiais" value={formatSimNao(social.vidaEscolar.necessitaAdaptacaoMateriais)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.necessitaAdaptacaoMateriais', v)} />
                                <EditableField label="Necessita adaptação curricular" value={formatSimNao(social.vidaEscolar.necessitaAdaptacaoCurricular)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.necessitaAdaptacaoCurricular', v)} />
                                <EditableField label="Houve reprovação/retenção" value={formatSimNao(social.vidaEscolar.houveReprovacaoRetencao)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.houveReprovacaoRetencao', v)} />
                                <EditableField label="Escola possui equipe de inclusão" value={formatSimNao(social.vidaEscolar.escolaPossuiEquipeInclusao)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.escolaPossuiEquipeInclusao', v)} />
                                <EditableField label="Indicativo de deficiência intelectual" value={formatSimNao(social.vidaEscolar.haIndicativoDeficienciaIntelectual)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.haIndicativoDeficienciaIntelectual', v)} />
                                <EditableField label="Escola apresenta queixa comportamental" value={formatSimNao(social.vidaEscolar.escolaApresentaQueixaComportamental)} isEditMode={isEditMode} onChange={(v) => updateEditData('socialAcademico.vidaEscolar.escolaApresentaQueixaComportamental', v)} />
                            </div>

                            {/* Campos descritivos */}
                            <div className="space-y-3 mt-4 pt-4 border-t">
                                {(social.vidaEscolar.adaptacaoEscolar || isEditMode) && (
                                    <EditableField label="Adaptação Escolar" value={social.vidaEscolar.adaptacaoEscolar} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('socialAcademico.vidaEscolar.adaptacaoEscolar', v)} />
                                )}
                                {(social.vidaEscolar.dificuldadesEscolares || isEditMode) && (
                                    <EditableField label="Dificuldades Escolares" value={social.vidaEscolar.dificuldadesEscolares} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('socialAcademico.vidaEscolar.dificuldadesEscolares', v)} />
                                )}
                                {(social.vidaEscolar.relacionamentoComColegas || isEditMode) && (
                                    <EditableField label="Relacionamento com Colegas" value={social.vidaEscolar.relacionamentoComColegas} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('socialAcademico.vidaEscolar.relacionamentoComColegas', v)} />
                                )}
                                {(social.vidaEscolar.observacoes || isEditMode) && (
                                    <EditableField label="Observações" value={social.vidaEscolar.observacoes} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('socialAcademico.vidaEscolar.observacoes', v)} />
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 7: // Comportamento
                const comp = displayData.comportamento;
                return (
                    <div className="space-y-6">
                        {/* 19. Estereotipias, Tiques, Rituais e Rotinas */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">19. Estereotipias, Tiques, Rituais e Rotinas</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <EditableField label="Balança as mãos ao lado do corpo ou na frente ao rosto" value={formatSimNao(comp.estereotipiasRituais.balancaMaosLadoCorpoOuFrente)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.balancaMaosLadoCorpoOuFrente', v)} />
                                <EditableField label="Balança o corpo para frente e para trás" value={formatSimNao(comp.estereotipiasRituais.balancaCorpoFrenteParaTras)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.balancaCorpoFrenteParaTras', v)} />
                                <EditableField label="Pula ou gira em torno de si" value={formatSimNao(comp.estereotipiasRituais.pulaOuGiraEmTornoDeSi)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.pulaOuGiraEmTornoDeSi', v)} />
                                <EditableField label="Repete sons sem função comunicativa" value={formatSimNao(comp.estereotipiasRituais.repeteSonsSemFuncaoComunicativa)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.repeteSonsSemFuncaoComunicativa', v)} />
                                <EditableField label="Repete movimentos de modo contínuo" value={formatSimNao(comp.estereotipiasRituais.repeteMovimentosContinuos)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.repeteMovimentosContinuos', v)} />
                                <EditableField label="Explora o ambiente lambendo, tocando excessivamente" value={formatSimNao(comp.estereotipiasRituais.exploraAmbienteLambendoTocando)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.exploraAmbienteLambendoTocando', v)} />
                                <EditableField label="Procura observar objetos com o canto do olho" value={formatSimNao(comp.estereotipiasRituais.procuraObservarObjetosCantoOlho)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.procuraObservarObjetosCantoOlho', v)} />
                                <EditableField label="Organiza objetos lado a lado ou empilha itens" value={formatSimNao(comp.estereotipiasRituais.organizaObjetosLadoALado)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.organizaObjetosLadoALado', v)} />
                                <EditableField label="Realiza tarefas sempre na mesma ordem" value={formatSimNao(comp.estereotipiasRituais.realizaTarefasSempreMesmaOrdem)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.realizaTarefasSempreMesmaOrdem', v)} />
                                <EditableField label="Apresenta rituais diários para cumprir tarefas" value={formatSimNao(comp.estereotipiasRituais.apresentaRituaisDiarios)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.estereotipiasRituais.apresentaRituaisDiarios', v)} />
                            </div>
                            {(comp.estereotipiasRituais.observacoesTopografias || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Observações e descrição das topografias mais relevantes" value={comp.estereotipiasRituais.observacoesTopografias} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('comportamento.estereotipiasRituais.observacoesTopografias', v)} />
                                </div>
                            )}
                        </div>

                        {/* 20. Problemas de Comportamento */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">20. Problemas de Comportamento</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <EditableField label="Apresenta comportamentos auto lesivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosAutoLesivos)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.problemasComportamento.apresentaComportamentosAutoLesivos', v)} />
                                    {(comp.problemasComportamento.autoLesivosQuais || isEditMode) && (
                                        <EditableField label="Quais" value={comp.problemasComportamento.autoLesivosQuais} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.problemasComportamento.autoLesivosQuais', v)} />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <EditableField label="Apresenta comportamentos heteroagressivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosHeteroagressivos)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.problemasComportamento.apresentaComportamentosHeteroagressivos', v)} />
                                    {(comp.problemasComportamento.heteroagressivosQuais || isEditMode) && (
                                        <EditableField label="Quais" value={comp.problemasComportamento.heteroagressivosQuais} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.problemasComportamento.heteroagressivosQuais', v)} />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <EditableField label="Apresenta destruição de propriedade" value={formatSimNao(comp.problemasComportamento.apresentaDestruicaoPropriedade)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.problemasComportamento.apresentaDestruicaoPropriedade', v)} />
                                    {(comp.problemasComportamento.destruicaoDescrever || isEditMode) && (
                                        <EditableField label="Descrever" value={comp.problemasComportamento.destruicaoDescrever} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.problemasComportamento.destruicaoDescrever', v)} />
                                    )}
                                </div>
                                <EditableField label="Necessita ou já necessitou de contenção física" value={formatSimNao(comp.problemasComportamento.necessitouContencaoMecanica)} isEditMode={isEditMode} onChange={(v) => updateEditData('comportamento.problemasComportamento.necessitouContencaoMecanica', v)} />
                            </div>
                            {(comp.problemasComportamento.observacoesTopografias || isEditMode) && (
                                <div className="mt-3">
                                    <EditableField label="Observações e descrição das topografias mais relevantes" value={comp.problemasComportamento.observacoesTopografias} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('comportamento.problemasComportamento.observacoesTopografias', v)} />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 8: // Finalização
                const fin = displayData.finalizacao;
                return (
                    <div className="space-y-4">
                        <EditableField label="21. Outras informações que o informante julgue serem relevantes" value={fin.informacoesAdicionais} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('finalizacao.informacoesAdicionais', v)} />
                        <EditableField label="22. Observações e/ou impressões do terapeuta" value={fin.observacoesFinais} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('finalizacao.observacoesFinais', v)} />
                        <EditableField label="23. Expectativas da família com o tratamento" value={fin.expectativasFamilia} isEditMode={isEditMode} type="textarea" onChange={(v) => updateEditData('finalizacao.expectativasFamilia', v)} />
                    </div>
                );

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
