import { useEffect, useState, useCallback } from 'react';
import { X, Edit2, Download, User, Stethoscope, Users, Baby, Utensils, GraduationCap, Brain, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import SimpleStepSidebar from '@/features/consultas/components/SimpleStepSidebar';
import ReadOnlyField from './ReadOnlyField';
import type { AnamneseDetalhe } from '../types/anamnese-consulta.types';
import type { AnamneseListItem } from '../../Tabela/types/anamnese-table.types';
import { getAnamneseById, exportAnamnese } from '../services/anamnese-consulta.service';
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

    const handleExport = useCallback(async () => {
        if (!anamnese?.id) return;
        
        setExporting(true);
        try {
            const blob = await exportAnamnese(anamnese.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `anamnese-${anamnese.clienteNome.replace(/\s+/g, '-').toLowerCase()}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Erro ao exportar:', err);
        } finally {
            setExporting(false);
        }
    }, [anamnese]);

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
                    <div className="space-y-4">
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
                            <ReadOnlyField label="Parentesco" value={anamneseDetalhe.cabecalho.parentesco} />
                        </div>
                        <ReadOnlyField label="Quem indicou" value={anamneseDetalhe.cabecalho.quemIndicou} />
                    </div>
                );

            case 2: // Queixa e Diagnóstico
                return (
                    <div className="space-y-6">
                        <ReadOnlyField label="Queixa Principal" value={anamneseDetalhe.queixaDiagnostico.queixaPrincipal} />
                        <ReadOnlyField label="Diagnóstico Prévio" value={anamneseDetalhe.queixaDiagnostico.diagnosticoPrevio} />
                        
                        {anamneseDetalhe.queixaDiagnostico.especialidadesConsultadas.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Especialidades Consultadas</h4>
                                <div className="space-y-2">
                                    {anamneseDetalhe.queixaDiagnostico.especialidadesConsultadas.map(esp => (
                                        <div key={esp.id} className="p-3 border rounded-lg bg-muted/30">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-sm">{esp.nome}</p>
                                                    <p className="text-xs text-muted-foreground">{esp.especialidade}</p>
                                                </div>
                                                <span className="text-xs text-muted-foreground">{formatDate(esp.data)}</span>
                                            </div>
                                            {esp.observacao && <p className="text-xs mt-1">{esp.observacao}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {anamneseDetalhe.queixaDiagnostico.medicamentosEmUso.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Medicamentos em Uso</h4>
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

                        {anamneseDetalhe.queixaDiagnostico.terapiasPrevias.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Terapias Prévias/Atuais</h4>
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
                        <ReadOnlyField label="Cuidadores Principais" value={anamneseDetalhe.contextoFamiliarRotina.cuidadoresPrincipais} />
                        <ReadOnlyField label="Tempo de Tela" value={anamneseDetalhe.contextoFamiliarRotina.tempoTela} />

                        {anamneseDetalhe.contextoFamiliarRotina.historicoFamiliar.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Histórico Familiar</h4>
                                <div className="space-y-2">
                                    {anamneseDetalhe.contextoFamiliarRotina.historicoFamiliar.map(hist => (
                                        <div key={hist.id} className="p-3 border rounded-lg bg-muted/30">
                                            <p className="font-medium text-sm">{hist.parentesco}</p>
                                            <p className="text-xs">{hist.condicao}</p>
                                            {hist.observacao && <p className="text-xs text-muted-foreground mt-1">{hist.observacao}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {anamneseDetalhe.contextoFamiliarRotina.rotinaDiaria.length > 0 && (
                            <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Rotina Diária</h4>
                                <div className="space-y-2">
                                    {anamneseDetalhe.contextoFamiliarRotina.rotinaDiaria.map(rot => (
                                        <div key={rot.id} className="flex items-center gap-3 p-2 border-b last:border-0">
                                            <span className="text-sm font-medium w-14">{rot.horario}</span>
                                            <span className="flex-1 text-sm">{rot.atividade}</span>
                                            <span className="text-xs text-muted-foreground">{rot.responsavel}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 4: // Desenvolvimento
                const dev = anamneseDetalhe.desenvolvimentoInicial;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Gestação e Parto</h4>
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
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Desenvolvimento Neuropsicomotor</h4>
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
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Fala e Linguagem</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Balbuciou" value={formatMarcoDesenvolvimento(dev.falaLinguagem.balbuciou)} />
                                <ReadOnlyField label="Primeiras palavras" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasPalavras)} />
                                <ReadOnlyField label="Primeiras frases" value={formatMarcoDesenvolvimento(dev.falaLinguagem.primeirasFrases)} />
                                <ReadOnlyField label="Apontou para pedir" value={formatMarcoDesenvolvimento(dev.falaLinguagem.apontouParaFazerPedidos)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Faz uso de gestos" value={formatSimNao(dev.falaLinguagem.fazUsoDeGestos)} />
                                <ReadOnlyField label="Audição" value={dev.falaLinguagem.audicao} />
                            </div>
                            <div className="mt-4">
                                <ReadOnlyField label="Comunicação Atual" value={dev.falaLinguagem.comunicacaoAtual} />
                            </div>
                        </div>
                    </div>
                );

            case 5: // Vida Diária
                const avd = anamneseDetalhe.atividadesVidaDiaria;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Alimentação</h4>
                            <div className="space-y-3">
                                <ReadOnlyField label="Amamentação" value={avd.alimentacao.amamentacao} />
                                <ReadOnlyField label="Introdução Alimentar" value={avd.alimentacao.introducaoAlimentar} />
                                <ReadOnlyField label="Alimentação Atual" value={avd.alimentacao.alimentacaoAtual} />
                                <ReadOnlyField label="Seletividade Alimentar" value={avd.alimentacao.seletividadeAlimentar} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField label="Usa talheres" value={formatSimNaoComAjuda(avd.alimentacao.usaTalheres)} />
                                    <ReadOnlyField label="Come sozinho" value={formatSimNaoComAjuda(avd.alimentacao.comeAlone)} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Higiene</h4>
                            <ReadOnlyField label="Desfralde" value={avd.higiene.desfralde} />
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <ReadOnlyField label="Controle diurno" value={formatSimNao(avd.higiene.controlaEsfincterDiurno)} />
                                <ReadOnlyField label="Controle noturno" value={formatSimNao(avd.higiene.controlaEsfincterNoturno)} />
                                <ReadOnlyField label="Toma banho sozinho" value={formatSimNaoComAjuda(avd.higiene.tomaBANHOSozinho)} />
                                <ReadOnlyField label="Escova os dentes" value={formatSimNaoComAjuda(avd.higiene.escovaD)} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Vestuário</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Veste sozinho" value={formatSimNaoComAjuda(avd.vestuario.vesteSozinho)} />
                                <ReadOnlyField label="Calça sapatos" value={formatSimNaoComAjuda(avd.vestuario.calcaSapatos)} />
                                <ReadOnlyField label="Abotoa sozinho" value={formatSimNaoComAjuda(avd.vestuario.abotoaSozinho)} />
                            </div>
                            <div className="mt-3">
                                <ReadOnlyField label="Preferências de roupas" value={avd.vestuario.preferenciasRoupas} />
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Sono</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Dorme onde" value={avd.sono.dormeOnde} />
                                <ReadOnlyField label="Qualidade do sono" value={avd.sono.qualidadeSono} />
                                <ReadOnlyField label="Horário dormir" value={avd.sono.horarioDormir} />
                                <ReadOnlyField label="Horário acordar" value={avd.sono.horarioAcordar} />
                            </div>
                            <div className="mt-3">
                                <ReadOnlyField label="Dificuldades para dormir" value={avd.sono.dificuldadesParaDormir} />
                            </div>
                        </div>
                    </div>
                );

            case 6: // Social e Acadêmico
                const social = anamneseDetalhe.socialAcademico;
                return (
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Interação Social</h4>
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
                            <h4 className="text-sm font-medium text-muted-foreground mb-3">Vida Escolar</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <ReadOnlyField label="Frequenta escola" value={formatSimNao(social.vidaEscolar.frequentaEscola)} />
                                <ReadOnlyField label="Tem acompanhante" value={formatSimNao(social.vidaEscolar.temAcompanhante)} />
                            </div>
                            <div className="space-y-3 mt-3">
                                <ReadOnlyField label="Escola" value={social.vidaEscolar.nomeEscola} />
                                <div className="grid grid-cols-2 gap-3">
                                    <ReadOnlyField label="Série" value={social.vidaEscolar.serie} />
                                    <ReadOnlyField label="Período" value={social.vidaEscolar.periodo} />
                                </div>
                                <ReadOnlyField label="Adaptação Escolar" value={social.vidaEscolar.adaptacaoEscolar} />
                                <ReadOnlyField label="Dificuldades Escolares" value={social.vidaEscolar.dificuldadesEscolares} />
                                <ReadOnlyField label="Relacionamento com Colegas" value={social.vidaEscolar.relacionamentoComColegas} />
                            </div>
                        </div>
                    </div>
                );

            case 7: // Comportamento
                const comp = anamneseDetalhe.comportamento;
                return (
                    <div className="space-y-4">
                        <ReadOnlyField label="Aspectos Comportamentais" value={comp.aspectosComportamentais} />
                        <ReadOnlyField label="Interesses Restritos" value={comp.interessesRestritos} />
                        <ReadOnlyField label="Estereotipias" value={comp.estereotipias} />
                        <ReadOnlyField label="Sensibilidades Sensoriais" value={comp.sensibilidadesSensoriais} />
                        <ReadOnlyField label="Autorregulação" value={comp.autoRegulacao} />
                    </div>
                );

            case 8: // Finalização
                const fin = anamneseDetalhe.finalizacao;
                return (
                    <div className="space-y-4">
                        <ReadOnlyField label="Expectativas da Família" value={fin.expectativasFamilia} />
                        <ReadOnlyField label="Informações Adicionais" value={fin.informacoesAdicionais} />
                        <ReadOnlyField label="Observações Finais" value={fin.observacoesFinais} />
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
                className="w-full sm:max-w-4xl p-0 flex flex-col overflow-hidden"
                style={{ maxWidth: '1200px' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                        <SheetTitle className="text-lg font-semibold">
                            Anamnese de {anamnese?.clienteNome ?? 'Cliente'}
                        </SheetTitle>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={exporting || loading}
                            className="gap-2"
                        >
                            {exporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Exportar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleEdit}
                            disabled={loading || !anamneseDetalhe}
                            className="gap-2"
                        >
                            <Edit2 className="h-4 w-4" />
                            Editar
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar com steps */}
                    <div className="w-64 border-r bg-muted/30 flex flex-col">
                        {/* Avatar e Status */}
                        <div className="p-4 flex flex-col items-center gap-3">
                            <div className="relative h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-semibold">
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

                    {/* Conteúdo principal */}
                    <div className="flex-1 overflow-auto p-6">
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
            </SheetContent>
        </Sheet>
    );
}
