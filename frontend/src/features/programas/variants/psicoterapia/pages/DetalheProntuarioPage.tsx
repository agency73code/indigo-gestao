/**
 * Página de Detalhe do Prontuário Psicológico
 * Layout profissional com melhor UX/UI
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Plus, 
    Edit, 
    Phone,
    Mail,
    MapPin,
    GraduationCap,
    Users,
    FileText,
    Target,
    ClipboardCheck,
    ArrowLeft,
    Printer
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { EvolucaoList, EvolucaoForm, ResumoIA } from '../components';
import { useEvolucaoForm } from '../hooks';
import { buscarProntuario } from '../services';
import { ProntuarioPrintView, useProntuarioPrint } from '../print';
import '../print/prontuario-print-styles.css';
import type { ProntuarioPsicologico, CabecalhoEvolucao } from '../types';

// Helper para pegar iniciais do nome
function getInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Componente de linha de informação
function InfoRow({ label, value, className = '' }: { label: string; value: string | undefined; className?: string }) {
    return (
        <div className={className}>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-medium">{value || 'Não informado'}</p>
        </div>
    );
}

export default function DetalheProntuarioPage() {
    const { prontuarioId } = useParams<{ prontuarioId: string }>();
    const navigate = useNavigate();
    const { setPageTitle, setShowBackButton } = usePageTitle();
    
    const [prontuario, setProntuario] = useState<ProntuarioPsicologico | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('evolucoes');
    const [showNovaEvolucao, setShowNovaEvolucao] = useState(false);

    // Ref para o container de impressão
    const printContainerRef = useRef<HTMLDivElement>(null);

    // Hook de evolução
    const evolucaoForm = useEvolucaoForm(prontuarioId || '');

    // Hook de impressão
    const { handlePrint } = useProntuarioPrint({
        content: useCallback(() => printContainerRef.current, []),
        documentTitle: prontuario 
            ? `Prontuario_Psicologico_${prontuario.cliente?.nome?.replace(/\s+/g, '_') || 'Cliente'}` 
            : 'Prontuario_Psicologico',
    });

    useEffect(() => {
        setPageTitle('Prontuário Psicológico');
        setShowBackButton(true);
        
        return () => {
            setShowBackButton(false);
        };
    }, [setPageTitle, setShowBackButton]);

    // Carregar prontuário
    useEffect(() => {
        async function loadProntuario() {
            if (!prontuarioId) return;
            
            setIsLoading(true);
            try {
                const data = await buscarProntuario(prontuarioId);
                setProntuario(data);
            } catch (error) {
                console.error('Erro ao carregar prontuário:', error);
            } finally {
                setIsLoading(false);
            }
        }
        
        loadProntuario();
    }, [prontuarioId]);

    // Loading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Não encontrado
    if (!prontuario) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground mb-4">Prontuário não encontrado.</p>
                <Button variant="outline" onClick={() => navigate('/app/programas/psicoterapia')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
            </div>
        );
    }

    // Cabeçalho para evolução
    const cabecalhoEvolucao: CabecalhoEvolucao = {
        nomeCliente: prontuario.cliente?.nome || '',
        idadeCliente: prontuario.cliente?.idade || '',
        diagnosticoClinico: prontuario.avaliacaoDemanda?.observacoes || '',
        motivoBusca: prontuario.avaliacaoDemanda?.motivoBuscaAtendimento || '',
        nomeTerapeuta: prontuario.terapeuta?.nome || '',
        crpTerapeuta: prontuario.terapeuta?.crp || '',
        dataEvolucao: new Date().toISOString().split('T')[0],
        numeroSessao: (prontuario.evolucoes?.length || 0) + 1,
    };

    // Handler para salvar evolução
    const handleSaveEvolucao = async () => {
        const result = await evolucaoForm.handleSave();
        if (result) {
            // Recarregar prontuário para atualizar lista de evoluções
            const updated = await buscarProntuario(prontuarioId!);
            setProntuario(updated);
            setShowNovaEvolucao(false);
        }
    };

    return (
        <div className="flex flex-col p-4 md:p-6 space-y-6">
            {/* Header Principal - Card com Avatar e Info */}
            <div 
                className="p-6 rounded-xl"
                style={{ backgroundColor: 'var(--hub-card-background)' }}
            >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    {/* Avatar + Info Principal */}
                    <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 shrink-0">
                            <AvatarImage src="" alt={prontuario.cliente?.nome || ''} />
                            <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                                {getInitials(prontuario.cliente?.nome || '')}
                            </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-normal" style={{ fontFamily: 'Sora, sans-serif' }}>
                                    {prontuario.cliente?.nome}
                                </h1>
                                <span 
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        prontuario.status === 'ativo' 
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                    }`}
                                >
                                    {prontuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {prontuario.cliente?.idade} • {prontuario.terapeuta?.nome}
                                {prontuario.terapeuta?.crp && ` • CRP ${prontuario.terapeuta.crp}`}
                            </p>
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-2 shrink-0">
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={handlePrint}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            Exportar PDF
                        </Button>
                        <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/app/programas/psicoterapia/editar/${prontuarioId}`)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Prontuário
                        </Button>
                        <Button size="sm" onClick={() => setShowNovaEvolucao(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Nova Evolução
                        </Button>
                    </div>
                </div>

                {/* Dados de contato */}
                <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border/50 text-sm">
                    {prontuario.cliente?.celular && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{prontuario.cliente.celular}</span>
                        </div>
                    )}
                    {prontuario.cliente?.email && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span>{prontuario.cliente.email}</span>
                        </div>
                    )}
                    {prontuario.cliente?.enderecoCompleto && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span className="line-clamp-1">{prontuario.cliente.enderecoCompleto}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50">
                    <TabsTrigger value="evolucoes" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Evoluções ({prontuario.evolucoes?.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="prontuario" className="gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        Prontuário
                    </TabsTrigger>
                </TabsList>

                {/* Tab Evoluções */}
                <TabsContent value="evolucoes" className="mt-6 space-y-6">
                    {showNovaEvolucao ? (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between mb-2">
                                <CardTitle>Nova Evolução Terapêutica</CardTitle>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setShowNovaEvolucao(false)}
                                >
                                    Cancelar
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <EvolucaoForm
                                    cabecalho={cabecalhoEvolucao}
                                    formData={evolucaoForm.formData}
                                    onChange={evolucaoForm.handleFieldChange}
                                    onAddArquivo={evolucaoForm.handleAddArquivo}
                                    onRemoveArquivo={evolucaoForm.handleRemoveArquivo}
                                    onSave={handleSaveEvolucao}
                                    isSaving={evolucaoForm.isSaving}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Resumo com IA */}
                            <ResumoIA
                                evolutions={prontuario.evolucoes || []}
                                patientName={prontuario.cliente?.nome || ''}
                                therapistName={prontuario.terapeuta?.nome || ''}
                            />

                            {/* Lista de Evoluções */}
                            <EvolucaoList 
                                evolucoes={prontuario.evolucoes || []} 
                            />
                        </>
                    )}
                </TabsContent>

                {/* Tab Prontuário */}
                <TabsContent value="prontuario" className="mt-6 space-y-4">
                    {/* Informações Educacionais */}
                    <div 
                        className="p-5 rounded-xl"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Informações Educacionais</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <InfoRow 
                                label="Nível de Escolaridade" 
                                value={prontuario.informacoesEducacionais?.nivelEscolaridade}
                            />
                            <InfoRow 
                                label="Instituição de Formação" 
                                value={prontuario.informacoesEducacionais?.instituicaoFormacao}
                            />
                            <InfoRow 
                                label="Profissão/Ocupação" 
                                value={prontuario.informacoesEducacionais?.profissaoOcupacao}
                            />
                        </div>
                        
                        {prontuario.informacoesEducacionais?.observacoes && (
                            <>
                                <Separator className="my-4" />
                                <InfoRow 
                                    label="Observações" 
                                    value={prontuario.informacoesEducacionais.observacoes}
                                    className="whitespace-pre-wrap"
                                />
                            </>
                        )}
                    </div>

                    {/* Núcleo Familiar */}
                    <div 
                        className="p-5 rounded-xl"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Núcleo Familiar</h3>
                        </div>
                        
                        {prontuario.nucleoFamiliar && prontuario.nucleoFamiliar.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b text-left">
                                            <th className="pb-3 font-medium text-muted-foreground">Nome</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Parentesco</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Idade</th>
                                            <th className="pb-3 font-medium text-muted-foreground">Ocupação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {prontuario.nucleoFamiliar.map((membro) => (
                                            <tr key={membro.id}>
                                                <td className="py-3 font-medium">{membro.nome}</td>
                                                <td className="py-3">{membro.parentesco}</td>
                                                <td className="py-3">{membro.idade || '-'}</td>
                                                <td className="py-3">{membro.ocupacao || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Nenhum membro registrado.</p>
                        )}
                        
                        {prontuario.observacoesNucleoFamiliar && (
                            <>
                                <Separator className="my-4" />
                                <InfoRow 
                                    label="Observações" 
                                    value={prontuario.observacoesNucleoFamiliar}
                                    className="whitespace-pre-wrap"
                                />
                            </>
                        )}
                    </div>

                    {/* Avaliação da Demanda */}
                    <div 
                        className="p-5 rounded-xl"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Avaliação da Demanda</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow 
                                label="Encaminhado por" 
                                value={prontuario.avaliacaoDemanda?.encaminhadoPor}
                            />
                            <InfoRow 
                                label="Atendimentos Anteriores" 
                                value={prontuario.avaliacaoDemanda?.atendimentosAnteriores}
                            />
                        </div>
                        
                        <Separator className="my-4" />
                        
                        <InfoRow 
                            label="Motivo da Busca pelo Atendimento" 
                            value={prontuario.avaliacaoDemanda?.motivoBuscaAtendimento}
                            className="whitespace-pre-wrap"
                        />
                        
                        {prontuario.avaliacaoDemanda?.observacoes && (
                            <>
                                <Separator className="my-4" />
                                <InfoRow 
                                    label="Observações" 
                                    value={prontuario.avaliacaoDemanda.observacoes}
                                    className="whitespace-pre-wrap"
                                />
                            </>
                        )}
                        
                        {/* Terapias Prévias */}
                        {prontuario.avaliacaoDemanda?.terapiasPrevias && prontuario.avaliacaoDemanda.terapiasPrevias.length > 0 && (
                            <>
                                <Separator className="my-4" />
                                <div>
                                    <p className="text-xs text-muted-foreground mb-3">Terapias Prévias e/ou em Andamento</p>
                                    <div className="space-y-2">
                                        {prontuario.avaliacaoDemanda.terapiasPrevias.map((terapia) => (
                                            <div 
                                                key={terapia.id}
                                                className="p-3 border rounded-lg bg-background"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium text-sm">{terapia.profissional}</p>
                                                        <p className="text-xs text-muted-foreground">{terapia.especialidadeAbordagem}</p>
                                                    </div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                                        terapia.ativo 
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                        {terapia.ativo ? 'Ativo' : 'Finalizado'}
                                                    </span>
                                                </div>
                                                {terapia.tempoIntervencao && (
                                                    <p className="text-xs mt-1">Tempo: {terapia.tempoIntervencao}</p>
                                                )}
                                                {terapia.observacao && (
                                                    <p className="text-xs mt-1 text-muted-foreground">{terapia.observacao}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Objetivos de Trabalho */}
                    <div 
                        className="p-5 rounded-xl"
                        style={{ backgroundColor: 'var(--hub-card-background)' }}
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold">Objetivos de Trabalho</h3>
                        </div>
                        
                        <p className="text-sm whitespace-pre-wrap">
                            {prontuario.objetivosTrabalho || 'Não informado'}
                        </p>
                    </div>

                    {/* Avaliação do Atendimento */}
                    {prontuario.avaliacaoAtendimento && (
                        <div 
                            className="p-5 rounded-xl"
                            style={{ backgroundColor: 'var(--hub-card-background)' }}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold">Avaliação do Atendimento</h3>
                            </div>
                            
                            <p className="text-sm whitespace-pre-wrap">
                                {prontuario.avaliacaoAtendimento}
                            </p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Componente de impressão - renderizado via portal fora da hierarquia */}
            {prontuario && createPortal(
                <div 
                    id="prontuario-print-container"
                    className="fixed left-[-9999px] top-0 w-[210mm] bg-white"
                    style={{ zIndex: -1 }}
                    data-prontuario-print-root
                    ref={printContainerRef}
                >
                    <ProntuarioPrintView prontuario={prontuario} />
                </div>,
                document.body
            )}
        </div>
    );
}
