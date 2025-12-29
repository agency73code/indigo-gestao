import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Download, User, Stethoscope, Users, Baby, Utensils, GraduationCap, Brain, FileText, Loader2, Image, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CloseButton } from '@/components/layout/CloseButton';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
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
    onEdit 
}: AnamneseProfileDrawerProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [anamneseDetalhe, setAnamneseDetalhe] = useState<AnamneseDetalhe | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);
    const [exportingWord, setExportingWord] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

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
        if (anamneseDetalhe && onEdit) {
            onEdit(anamneseDetalhe);
        }
    }, [anamneseDetalhe, onEdit]);

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
        if (!anamneseDetalhe) return null;

        switch (currentStep) {
            case 1: // Identificação
                return (
                    <div className="space-y-6">
                        {/* Dados da Entrevista */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="Data da Entrevista" value={formatDate(anamneseDetalhe.cabecalho.dataEntrevista)} />
                            <ReadOnlyField label="Profissional Responsável" value={anamneseDetalhe.cabecalho.profissionalNome} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="Data de Nascimento" value={formatDate(anamneseDetalhe.cabecalho.dataNascimento)} />
                            <ReadOnlyField label="Idade" value={anamneseDetalhe.cabecalho.idade} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="Informante" value={anamneseDetalhe.cabecalho.informante} />
                            <ReadOnlyField 
                                label="Parentesco" 
                                value={
                                    anamneseDetalhe.cabecalho.parentesco === 'outro' && anamneseDetalhe.cabecalho.parentescoDescricao
                                        ? anamneseDetalhe.cabecalho.parentescoDescricao
                                        : PARENTESCO_LABELS[anamneseDetalhe.cabecalho.parentesco] || anamneseDetalhe.cabecalho.parentesco
                                } 
                            />
                        </div>
                        <ReadOnlyField label="Quem indicou" value={anamneseDetalhe.cabecalho.quemIndicou} />

                        {/* Cuidadores do Cliente */}
                        {anamneseDetalhe.cabecalho.cuidadores && anamneseDetalhe.cabecalho.cuidadores.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Cuidadores</h4>
                                <div className="space-y-3">
                                    {anamneseDetalhe.cabecalho.cuidadores.map((cuidador) => {
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
                        <ReadOnlyField label="1. Queixa Principal Atual" value={anamneseDetalhe.queixaDiagnostico.queixaPrincipal} />
                        <ReadOnlyField label="2. Diagnóstico Prévio" value={anamneseDetalhe.queixaDiagnostico.diagnosticoPrevio} />
                        <ReadOnlyField label="3. Há Suspeita de Outra Condição Associada?" value={anamneseDetalhe.queixaDiagnostico.suspeitaCondicaoAssociada} />
                        
                        {anamneseDetalhe.queixaDiagnostico.especialidadesConsultadas.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">4. Médicos Consultados até o Momento</h4>
                                <div className="space-y-2">
                                    {anamneseDetalhe.queixaDiagnostico.especialidadesConsultadas.map(esp => (
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

                        {anamneseDetalhe.queixaDiagnostico.medicamentosEmUso.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">5. Uso de Medicamentos</h4>
                                <div className="space-y-2">
                                    {anamneseDetalhe.queixaDiagnostico.medicamentosEmUso.map(med => (
                                        <div key={med.id} className="p-3 border rounded-lg bg-muted/30">
                                            <p className="font-medium text-sm">{med.nome} - {med.dosagem}</p>
                                            <p className="text-xs text-muted-foreground">Início: {formatDate(med.dataInicio)} | Motivo: {med.motivo}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {anamneseDetalhe.queixaDiagnostico.examesPrevios.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">6. Exames Prévios Realizados</h4>
                                <div className="space-y-3">
                                    {anamneseDetalhe.queixaDiagnostico.examesPrevios.map(exame => (
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

                        {anamneseDetalhe.queixaDiagnostico.terapiasPrevias.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">7. Terapias Prévias e/ou em Andamento</h4>
                                <div className="space-y-2">
                                    {anamneseDetalhe.queixaDiagnostico.terapiasPrevias.map(ter => (
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
                            {anamneseDetalhe.contextoFamiliarRotina.historicoFamiliar.length > 0 ? (
                                <div className="space-y-3">
                                    {anamneseDetalhe.contextoFamiliarRotina.historicoFamiliar.map((hist, index) => (
                                        <div key={hist.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Registro {index + 1}
                                                </span>
                                            </div>
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
                            {anamneseDetalhe.contextoFamiliarRotina.rotinaDiaria.length > 0 ? (
                                <div className="space-y-3">
                                    {anamneseDetalhe.contextoFamiliarRotina.rotinaDiaria.map((rot, index) => (
                                        <div key={rot.id} className="p-4 border rounded-xl bg-white shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    Atividade {index + 1}
                                                </span>
                                            </div>
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
                const dev = anamneseDetalhe.desenvolvimentoInicial;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">10. Gestação e Parto</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <ReadOnlyField label="Tipo de Parto" value={dev.gestacaoParto.tipoParto} />
                                <ReadOnlyField label="Semanas" value={dev.gestacaoParto.semanas} />
                                <ReadOnlyField label="APGAR 1min" value={dev.gestacaoParto.apgar1min} />
                                <ReadOnlyField label="APGAR 5min" value={dev.gestacaoParto.apgar5min} />
                            </div>
                            <div className="mt-4">
                                <ReadOnlyField label="Intercorrências" value={dev.gestacaoParto.intercorrencias} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">11. Desenvolvimento Neuropsicomotor</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Sustentou cabeça" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sustentouCabeca)} />
                                <ReadOnlyField label="Rolou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.rolou)} />
                                <ReadOnlyField label="Sentou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.sentou)} />
                                <ReadOnlyField label="Engatinhou" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.engatinhou)} />
                                <ReadOnlyField label="Andou com apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouComApoio)} />
                                <ReadOnlyField label="Andou sem apoio" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouSemApoio)} />
                                <ReadOnlyField label="Correu" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.correu)} />
                                <ReadOnlyField label="Andou de motoca" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeMotoca)} />
                                <ReadOnlyField label="Andou de bicicleta" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.andouDeBicicleta)} />
                                <ReadOnlyField label="Subiu escadas sozinho" value={formatMarcoDesenvolvimento(dev.neuropsicomotor.subiuEscadasSozinho)} />
                            </div>
                            <div className="mt-4">
                                <ReadOnlyField label="Motricidade Fina" value={dev.neuropsicomotor.motricidadeFina} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">12. Desenvolvimento da Fala e da Linguagem</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Balbuciou" value={formatMarcoDesenvolvimento(dev.falaLinguagem.balbuciou)} />
                                <ReadOnlyField label="Primeiras palavras" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasPalavras)} />
                                <ReadOnlyField label="Primeiras frases" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasFrases)} />
                                <ReadOnlyField label="Apontou para pedir" value={formatMarcoDesenvolvimento(dev.falaLinguagem.apontouParaFazerPedidos)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Faz uso de gestos" value={formatSimNao(dev.falaLinguagem.fazUsoDeGestos)} />
                            </div>
                            {dev.falaLinguagem.fazUsoDeGestos === 'sim' && dev.falaLinguagem.fazUsoDeGestosQuais && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Quais gestos" value={dev.falaLinguagem.fazUsoDeGestosQuais} />
                                </div>
                            )}

                            {/* Comunicação Atual - movido para depois de Faz uso de gestos */}
                            <div className="mt-4">
                                <ReadOnlyField label="Comunicação Atual" value={dev.falaLinguagem.comunicacaoAtual} />
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Audição (percepção do responsável)" value={dev.falaLinguagem.audicao === 'boa' ? 'Boa' : dev.falaLinguagem.audicao === 'ruim' ? 'Ruim' : dev.falaLinguagem.audicao} />
                                <ReadOnlyField label="Teve otite de repetição" value={formatSimNao(dev.falaLinguagem.teveOtiteDeRepeticao)} />
                            </div>
                            {dev.falaLinguagem.teveOtiteDeRepeticao === 'sim' && dev.falaLinguagem.otiteDetalhes && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Detalhes da otite (quantas vezes, período, frequência)" value={dev.falaLinguagem.otiteDetalhes} />
                                </div>
                            )}
                            <div className="mt-3">
                                <ReadOnlyField label="Faz ou fez uso de tubo de ventilação" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoTuboVentilacao)} />
                            </div>
                            {dev.falaLinguagem.fazOuFezUsoTuboVentilacao === 'sim' && dev.falaLinguagem.tuboVentilacaoObservacao && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Observação do tubo de ventilação" value={dev.falaLinguagem.tuboVentilacaoObservacao} />
                                </div>
                            )}

                            {/* Hábitos orais */}
                            <h5 className="text-sm font-medium text-muted-foreground mt-4 mb-3">Hábitos Orais</h5>
                            <div className="space-y-3">
                                <ReadOnlyField label="Faz ou fez uso de objeto oral (chupeta, paninho, dedo)" value={formatSimNao(dev.falaLinguagem.fazOuFezUsoObjetoOral)} />
                                {dev.falaLinguagem.fazOuFezUsoObjetoOral === 'sim' && dev.falaLinguagem.objetoOralEspecificar && (
                                    <ReadOnlyField label="Especificação (manhã, tarde e/ou noite)" value={dev.falaLinguagem.objetoOralEspecificar} />
                                )}
                                <ReadOnlyField label="Usa mamadeira" value={formatSimNao(dev.falaLinguagem.usaMamadeira)} />
                                {dev.falaLinguagem.usaMamadeira === 'sim' && dev.falaLinguagem.mamadeiraDetalhes && (
                                    <ReadOnlyField label="Detalhes (há quantos anos/meses, quantas vezes ao dia)" value={dev.falaLinguagem.mamadeiraDetalhes} />
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 5: // Vida Diária
                const avd = anamneseDetalhe.atividadesVidaDiaria;
                
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
                                <ReadOnlyField label="Desfralde para urina (diurno) realizado com" value={formatDesfralde(avd.desfralde.desfraldeDiurnoUrina)} />
                                <ReadOnlyField label="Desfralde para urina (noturno) realizado com" value={formatDesfralde(avd.desfralde.desfraldeNoturnoUrina)} />
                                <ReadOnlyField label="Desfralde para fezes realizado com" value={formatDesfralde(avd.desfralde.desfraldeFezes)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Se limpa sozinho para urinar" value={formatSimNao(avd.desfralde.seLimpaSozinhoUrinar)} />
                                <ReadOnlyField label="Se limpa sozinho para defecar" value={formatSimNao(avd.desfralde.seLimpaSozinhoDefecar)} />
                                <ReadOnlyField label="Lava as mãos após uso do banheiro" value={formatSimNao(avd.desfralde.lavaAsMaosAposUsoBanheiro)} />
                                <ReadOnlyField label="Alteração no hábito intestinal" value={formatSimNao(avd.desfralde.apresentaAlteracaoHabitoIntestinal)} />
                            </div>
                            {avd.desfralde.observacoes && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Observações" value={avd.desfralde.observacoes} />
                                </div>
                            )}
                        </div>

                        {/* 14. Sono */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">14. Sono</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Horas de sono por noite" value={avd.sono.dormemMediaHorasNoite ? `${avd.sono.dormemMediaHorasNoite} horas` : 'Não informado'} />
                                <ReadOnlyField label="Horas de sono durante o dia" value={avd.sono.dormemMediaHorasDia ? `${avd.sono.dormemMediaHorasDia} horas` : 'Não dorme durante o dia'} />
                                <ReadOnlyField label="Período do sono durante o dia" value={avd.sono.periodoSonoDia === 'manha' ? 'Manhã' : avd.sono.periodoSonoDia === 'tarde' ? 'Tarde' : 'Não informado'} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Dificuldade para iniciar o sono" value={formatSimNao(avd.sono.temDificuldadeIniciarSono)} />
                                <ReadOnlyField label="Acorda de madrugada" value={formatSimNao(avd.sono.acordaDeMadrugada)} />
                                <ReadOnlyField label="Dorme na própria cama" value={formatSimNao(avd.sono.dormeNaPropriaCama)} />
                                <ReadOnlyField label="Dorme no próprio quarto" value={formatSimNao(avd.sono.dormeNoProprioQuarto)} />
                                <ReadOnlyField label="Apresenta sono agitado" value={formatSimNao(avd.sono.apresentaSonoAgitado)} />
                                <ReadOnlyField label="É sonâmbulo" value={formatSimNao(avd.sono.eSonambulo)} />
                            </div>
                            {avd.sono.observacoes && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Observações" value={avd.sono.observacoes} />
                                </div>
                            )}
                        </div>

                        {/* 15. Hábitos Diários de Higiene */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">15. Hábitos Diários de Higiene</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Toma banho e lava o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.tomaBanhoLavaCorpoTodo)} />
                                <ReadOnlyField label="Seca o corpo todo" value={formatSimNaoComAjuda(avd.habitosHigiene.secaCorpoTodo)} />
                                <ReadOnlyField label="Retira todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.retiraTodasPecasRoupa)} />
                                <ReadOnlyField label="Coloca todas as peças de roupa" value={formatSimNaoComAjuda(avd.habitosHigiene.colocaTodasPecasRoupa)} />
                                <ReadOnlyField label="Põe calçados sem cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosSemCadarco)} />
                                <ReadOnlyField label="Põe calçados com cadarço" value={formatSimNaoComAjuda(avd.habitosHigiene.poeCalcadosComCadarco)} />
                                <ReadOnlyField label="Escova os dentes" value={formatSimNaoComAjuda(avd.habitosHigiene.escovaOsDentes)} />
                                <ReadOnlyField label="Penteia o cabelo" value={formatSimNaoComAjuda(avd.habitosHigiene.penteiaOCabelo)} />
                            </div>
                            {avd.habitosHigiene.observacoes && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Observações" value={avd.habitosHigiene.observacoes} />
                                </div>
                            )}
                        </div>

                        {/* 16. Alimentação */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">16. Alimentação</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Apresenta queixa quanto a alimentação" value={formatSimNao(avd.alimentacao.apresentaQueixaAlimentacao)} />
                                <ReadOnlyField label="Se alimenta sozinho" value={formatSimNao(avd.alimentacao.seAlimentaSozinho)} />
                                <ReadOnlyField label="É seletivo quanto aos alimentos" value={formatSimNao(avd.alimentacao.eSeletivoQuantoAlimentos)} />
                                <ReadOnlyField label="Passa longos períodos sem comer" value={formatSimNao(avd.alimentacao.passaDiaInteiroSemComer)} />
                                <ReadOnlyField label="Apresenta rituais para se alimentar" value={formatSimNao(avd.alimentacao.apresentaRituaisParaAlimentar)} />
                                <ReadOnlyField label="Está abaixo ou acima do peso" value={formatSimNao(avd.alimentacao.estaAbaixoOuAcimaPeso)} />
                            </div>
                            {avd.alimentacao.estaAbaixoOuAcimaPeso === 'sim' && avd.alimentacao.estaAbaixoOuAcimaPesoDescricao && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Peso/Altura e acompanhamento" value={avd.alimentacao.estaAbaixoOuAcimaPesoDescricao} />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Tem histórico de anemia" value={formatSimNao(avd.alimentacao.temHistoricoAnemia)} />
                            </div>
                            {avd.alimentacao.temHistoricoAnemia === 'sim' && avd.alimentacao.temHistoricoAnemiaDescricao && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Histórico de anemia - desde quando" value={avd.alimentacao.temHistoricoAnemiaDescricao} />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Rotina alimentar é problema para a família" value={formatSimNao(avd.alimentacao.rotinaAlimentarEProblemaFamilia)} />
                            </div>
                            {avd.alimentacao.rotinaAlimentarEProblemaFamilia === 'sim' && avd.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Maiores dificuldades" value={avd.alimentacao.rotinaAlimentarEProblemaFamiliaDescricao} />
                                </div>
                            )}
                            {avd.alimentacao.observacoes && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Observações" value={avd.alimentacao.observacoes} />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 6: // Social e Acadêmico
                const social = anamneseDetalhe.socialAcademico;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">17. Desenvolvimento Social (Relações Interpessoais e Brincar)</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Brinca com outras crianças" value={formatSimNao(social.interacaoSocial.brincaComOutrasCriancas)} />
                                <ReadOnlyField label="Mantém contato visual" value={formatSimNao(social.interacaoSocial.mantemContatoVisual)} />
                                <ReadOnlyField label="Responde ao chamar" value={formatSimNao(social.interacaoSocial.respondeAoChamar)} />
                                <ReadOnlyField label="Compartilha interesses" value={formatSimNao(social.interacaoSocial.compartilhaInteresses)} />
                            </div>
                            <div className="mt-3">
                                <ReadOnlyField label="Tipo de brincadeira" value={social.interacaoSocial.tipoBrincadeira} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">18. Desenvolvimento Acadêmico</h4>
                            
                            {/* Dados da escola */}
                            <div className="space-y-3">
                                <ReadOnlyField label="Escola" value={social.vidaEscolar.escola} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField label="Ano/Série" value={social.vidaEscolar.ano} />
                                    <ReadOnlyField label="Período" value={social.vidaEscolar.periodo} />
                                </div>
                                <ReadOnlyField label="Direção" value={social.vidaEscolar.direcao} />
                                <ReadOnlyField label="Coordenação" value={social.vidaEscolar.coordenacao} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField label="Professora Principal" value={social.vidaEscolar.professoraPrincipal} />
                                    <ReadOnlyField label="Professora Assistente" value={social.vidaEscolar.professoraAssistente} />
                                </div>
                            </div>

                            {/* Campos Sim/Não */}
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
                                <ReadOnlyField label="Frequenta escola regular" value={formatSimNao(social.vidaEscolar.frequentaEscolaRegular)} />
                                <ReadOnlyField label="Frequenta escola especial" value={formatSimNao(social.vidaEscolar.frequentaEscolaEspecial)} />
                                <ReadOnlyField label="Acompanha a turma (demandas pedagógicas)" value={formatSimNao(social.vidaEscolar.acompanhaTurmaDemandasPedagogicas)} />
                                <ReadOnlyField label="Segue regras e rotinas de sala" value={formatSimNao(social.vidaEscolar.segueRegrasRotinaSalaAula)} />
                                <ReadOnlyField label="Necessita apoio de AT" value={formatSimNao(social.vidaEscolar.necessitaApoioAT)} />
                                <ReadOnlyField label="Necessita adaptação de materiais" value={formatSimNao(social.vidaEscolar.necessitaAdaptacaoMateriais)} />
                                <ReadOnlyField label="Necessita adaptação curricular" value={formatSimNao(social.vidaEscolar.necessitaAdaptacaoCurricular)} />
                                <ReadOnlyField label="Houve reprovação/retenção" value={formatSimNao(social.vidaEscolar.houveReprovacaoRetencao)} />
                                <ReadOnlyField label="Escola possui equipe de inclusão" value={formatSimNao(social.vidaEscolar.escolaPossuiEquipeInclusao)} />
                                <ReadOnlyField label="Indicativo de deficiência intelectual" value={formatSimNao(social.vidaEscolar.haIndicativoDeficienciaIntelectual)} />
                                <ReadOnlyField label="Escola apresenta queixa comportamental" value={formatSimNao(social.vidaEscolar.escolaApresentaQueixaComportamental)} />
                            </div>

                            {/* Campos descritivos */}
                            <div className="space-y-3 mt-4 pt-4 border-t">
                                {social.vidaEscolar.adaptacaoEscolar && (
                                    <ReadOnlyField label="Adaptação Escolar" value={social.vidaEscolar.adaptacaoEscolar} />
                                )}
                                {social.vidaEscolar.dificuldadesEscolares && (
                                    <ReadOnlyField label="Dificuldades Escolares" value={social.vidaEscolar.dificuldadesEscolares} />
                                )}
                                {social.vidaEscolar.relacionamentoComColegas && (
                                    <ReadOnlyField label="Relacionamento com Colegas" value={social.vidaEscolar.relacionamentoComColegas} />
                                )}
                                {social.vidaEscolar.observacoes && (
                                    <ReadOnlyField label="Observações" value={social.vidaEscolar.observacoes} />
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 7: // Comportamento
                const comp = anamneseDetalhe.comportamento;
                return (
                    <div className="space-y-6">
                        {/* 19. Estereotipias, Tiques, Rituais e Rotinas */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">19. Estereotipias, Tiques, Rituais e Rotinas</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Balança as mãos ao lado do corpo ou na frente ao rosto" value={formatSimNao(comp.estereotipiasRituais.balancaMaosLadoCorpoOuFrente)} />
                                <ReadOnlyField label="Balança o corpo para frente e para trás" value={formatSimNao(comp.estereotipiasRituais.balancaCorpoFrenteParaTras)} />
                                <ReadOnlyField label="Pula ou gira em torno de si" value={formatSimNao(comp.estereotipiasRituais.pulaOuGiraEmTornoDeSi)} />
                                <ReadOnlyField label="Repete sons sem função comunicativa" value={formatSimNao(comp.estereotipiasRituais.repeteSonsSemFuncaoComunicativa)} />
                                <ReadOnlyField label="Repete movimentos de modo contínuo" value={formatSimNao(comp.estereotipiasRituais.repeteMovimentosContinuos)} />
                                <ReadOnlyField label="Explora o ambiente lambendo, tocando excessivamente" value={formatSimNao(comp.estereotipiasRituais.exploraAmbienteLambendoTocando)} />
                                <ReadOnlyField label="Procura observar objetos com o canto do olho" value={formatSimNao(comp.estereotipiasRituais.procuraObservarObjetosCantoOlho)} />
                                <ReadOnlyField label="Organiza objetos lado a lado ou empilha itens" value={formatSimNao(comp.estereotipiasRituais.organizaObjetosLadoALado)} />
                                <ReadOnlyField label="Realiza tarefas sempre na mesma ordem" value={formatSimNao(comp.estereotipiasRituais.realizaTarefasSempreMesmaOrdem)} />
                                <ReadOnlyField label="Apresenta rituais diários para cumprir tarefas" value={formatSimNao(comp.estereotipiasRituais.apresentaRituaisDiarios)} />
                            </div>
                            {comp.estereotipiasRituais.observacoesTopografias && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Observações e descrição das topografias mais relevantes" value={comp.estereotipiasRituais.observacoesTopografias} />
                                </div>
                            )}
                        </div>

                        {/* 20. Problemas de Comportamento */}
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">20. Problemas de Comportamento</h4>
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField label="Apresenta comportamentos auto lesivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosAutoLesivos)} />
                                    {comp.problemasComportamento.autoLesivosQuais && (
                                        <ReadOnlyField label="Quais" value={comp.problemasComportamento.autoLesivosQuais} />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField label="Apresenta comportamentos heteroagressivos" value={formatSimNao(comp.problemasComportamento.apresentaComportamentosHeteroagressivos)} />
                                    {comp.problemasComportamento.heteroagressivosQuais && (
                                        <ReadOnlyField label="Quais" value={comp.problemasComportamento.heteroagressivosQuais} />
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField label="Apresenta destruição de propriedade" value={formatSimNao(comp.problemasComportamento.apresentaDestruicaoPropriedade)} />
                                    {comp.problemasComportamento.destruicaoDescrever && (
                                        <ReadOnlyField label="Descrever" value={comp.problemasComportamento.destruicaoDescrever} />
                                    )}
                                </div>
                                <ReadOnlyField label="Necessita ou já necessitou de contenção física" value={formatSimNao(comp.problemasComportamento.necessitouContencaoMecanica)} />
                            </div>
                            {comp.problemasComportamento.observacoesTopografias && (
                                <div className="mt-3">
                                    <ReadOnlyField label="Observações e descrição das topografias mais relevantes" value={comp.problemasComportamento.observacoesTopografias} />
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 8: // Finalização
                const fin = anamneseDetalhe.finalizacao;
                return (
                    <div className="space-y-4">
                        <ReadOnlyField label="21. Outras informações que o informante julgue serem relevantes" value={fin.informacoesAdicionais} />
                        <ReadOnlyField label="22. Observações e/ou impressões do terapeuta" value={fin.observacoesFinais} />
                        <ReadOnlyField label="23. Expectativas da família com o tratamento" value={fin.expectativasFamilia} />
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
