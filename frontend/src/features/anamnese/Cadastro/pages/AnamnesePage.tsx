import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/ui/button';
import { ArrowLeft, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import VerticalStepSidebar from '@/features/cadastros/components/VerticalStepSidebar';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { UnsavedChangesDialog } from '@/components/dialogs/UnsavedChangesDialog';
import { CabecalhoAnamnese } from '../components';
import { 
    QueixaDiagnosticoStep, 
    ContextoFamiliarRotinaStep,
    DesenvolvimentoInicialStep,
    AtividadesVidaDiariaStep,
    SocialAcademicoStep,
    ComportamentoStep,
    FinalizacaoStep
} from '../components/steps';
import type { 
    AnamnseeCabecalho, 
    AnamneseQueixaDiagnostico, 
    AnamneseContextoFamiliarRotina,
    AnamneseDesenvolvimentoInicial,
    AnamneseAtividadesVidaDiaria,
    AnamneseSocialAcademico,
    AnamneseComportamento,
    AnamneseFinalizacao,
    Anamnese
} from '../types/anamnese.types';
import { 
    criarAnamnese,
    validarAnamneseMinima,
    getValidationErrorMessages
} from '../services/anamnese-cadastro.service';
import { 
    User, 
    Baby, 
    GraduationCap, 
    Brain,
    FileText,
    Users,
    Utensils,
    MessageSquare
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const STEPS = [
    'Identificação',
    'Queixa e Diagnóstico',
    'Contexto Familiar',
    'Desenvolvimento Inicial', 
    'Atividades de Vida Diária',
    'Social e Acadêmico',
    'Comportamento',
    'Finalização'
];

// Ícones personalizados para cada step da anamnese
const STEP_ICONS: LucideIcon[] = [
    User,          // 1. Identificação
    FileText,      // 2. Queixa e Diagnóstico
    Users,         // 3. Contexto Familiar
    Baby,          // 4. Desenvolvimento Inicial
    Utensils,      // 5. Atividades de Vida Diária
    GraduationCap, // 6. Social e Acadêmico
    Brain,         // 7. Comportamento
    MessageSquare  // 8. Finalização
];

// Estado inicial do cabeçalho
const initialCabecalho: AnamnseeCabecalho = {
    dataEntrevista: '',
    clienteId: '',
    clienteNome: '',
    dataNascimento: '',
    idade: '',
    informante: '',
    parentesco: '',
    quemIndicou: '',
    profissionalId: '',
    profissionalNome: '',
};

// Estado inicial de Queixa e Diagnóstico
const initialQueixaDiagnostico: Partial<AnamneseQueixaDiagnostico> = {
    queixaPrincipal: '',
    diagnosticoPrevio: '',
    suspeitaCondicaoAssociada: '',
    especialidadesConsultadas: [],
    medicamentosEmUso: [],
    examesPrevios: [],
    terapiasPrevias: [],
};

// Estado inicial de Contexto Familiar e Rotina
const initialContextoFamiliarRotina: Partial<AnamneseContextoFamiliarRotina> = {
    historicosFamiliares: [],
    atividadesRotina: [],
};

// Estado inicial de Desenvolvimento Inicial
const initialDesenvolvimentoInicial: Partial<AnamneseDesenvolvimentoInicial> = {
    gestacaoParto: {
        tipoParto: null,
        semanas: null,
        apgar1min: null,
        apgar5min: null,
        intercorrencias: '',
    },
    neuropsicomotor: {
        sustentouCabeca: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        rolou: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        sentou: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        engatinhou: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        andouComApoio: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        andouSemApoio: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        correu: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        andouDeMotoca: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        andouDeBicicleta: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        subiuEscadasSozinho: { meses: '', naoRealiza: false, naoSoubeInformar: false },
        motricidadeFina: '',
    },
    falaLinguagem: {
        balbuciou: { meses: '', nao: false, naoSoubeInformar: false },
        primeirasPalavras: { meses: '', nao: false, naoSoubeInformar: false },
        primeirasFrases: { meses: '', nao: false, naoSoubeInformar: false },
        apontouParaFazerPedidos: { meses: '', nao: false, naoSoubeInformar: false },
        fazUsoDeGestos: null,
        fazUsoDeGestosQuais: '',
        audicao: null,
        teveOtiteDeRepeticao: null,
        otiteVezes: null,
        otitePeriodoMeses: null,
        otiteFrequencia: '',
        fazOuFezUsoTuboVentilacao: null,
        tuboVentilacaoObservacao: '',
        fazOuFezUsoObjetoOral: null,
        objetoOralEspecificar: '',
        usaMamadeira: null,
        mamadeiraHa: '',
        mamadeiraVezesAoDia: null,
        comunicacaoAtual: '',
    },
};

// Estado inicial de Atividades de Vida Diária
const initialAtividadesVidaDiaria: Partial<AnamneseAtividadesVidaDiaria> = {
    desfralde: {
        desfraldeDiurnoUrina: { anos: '', meses: '', utilizaFralda: false },
        desfraldeNoturnoUrina: { anos: '', meses: '', utilizaFralda: false },
        desfraldeFezes: { anos: '', meses: '', utilizaFralda: false },
        seLimpaSozinhoUrinar: null,
        seLimpaSozinhoDefecar: null,
        lavaAsMaosAposUsoBanheiro: null,
        apresentaAlteracaoHabitoIntestinal: null,
        observacoes: '',
    },
    sono: {
        dormemMediaHorasNoite: '',
        dormemMediaHorasDia: '',
        periodoSonoDia: null,
        temDificuldadeIniciarSono: null,
        acordaDeMadrugada: null,
        dormeNaPropriaCama: null,
        dormeNoProprioQuarto: null,
        apresentaSonoAgitado: null,
        eSonambulo: null,
        observacoes: '',
    },
    habitosHigiene: {
        tomaBanhoLavaCorpoTodo: null,
        secaCorpoTodo: null,
        retiraTodasPecasRoupa: null,
        colocaTodasPecasRoupa: null,
        poeCalcadosSemCadarco: null,
        poeCalcadosComCadarco: null,
        escovaOsDentes: null,
        penteiaOCabelo: null,
        observacoes: '',
    },
    alimentacao: {
        apresentaQueixaAlimentacao: null,
        seAlimentaSozinho: null,
        eSeletivoQuantoAlimentos: null,
        passaDiaInteiroSemComer: null,
        apresentaRituaisParaAlimentar: null,
        estaAbaixoOuAcimaPeso: null,
        estaAbaixoOuAcimaPesoDescricao: '',
        temHistoricoAnemia: null,
        temHistoricoAnemiaDescricao: '',
        rotinaAlimentarEProblemaFamilia: null,
        rotinaAlimentarEProblemaFamiliaDescricao: '',
        observacoes: '',
    },
};

// Estado inicial de Social e Acadêmico
const initialSocialAcademico: Partial<AnamneseSocialAcademico> = {
    desenvolvimentoSocial: {
        possuiAmigosMesmaIdadeEscola: null,
        possuiAmigosMesmaIdadeForaEscola: null,
        fazUsoFuncionalBrinquedos: null,
        brincaProximoAosColegas: null,
        brincaConjuntaComColegas: null,
        procuraColegasEspontaneamente: null,
        seVerbalIniciaConversa: null,
        seVerbalRespondePerguntasSimples: null,
        fazPedidosQuandoNecessario: null,
        estabeleceContatoVisualAdultos: null,
        estabeleceContatoVisualCriancas: null,
        observacoes: '',
    },
    desenvolvimentoAcademico: {
        escola: '',
        ano: null,
        periodo: '',
        direcao: '',
        coordenacao: '',
        professoraPrincipal: '',
        professoraAssistente: '',
        frequentaEscolaRegular: null,
        frequentaEscolaEspecial: null,
        acompanhaTurmaDemandasPedagogicas: null,
        segueRegrasRotinaSalaAula: null,
        necessitaApoioAT: null,
        necessitaAdaptacaoMateriais: null,
        necessitaAdaptacaoCurricular: null,
        houveReprovacaoRetencao: null,
        escolaPossuiEquipeInclusao: null,
        haIndicativoDeficienciaIntelectual: null,
        escolaApresentaQueixaComportamental: null,
        adaptacaoEscolar: '',
        dificuldadesEscolares: '',
        relacionamentoComColegas: '',
        observacoes: '',
    },
};

// Estado inicial de Comportamento
const initialComportamento: Partial<AnamneseComportamento> = {
    estereotipiasRituais: {
        balancaMaosLadoCorpoOuFrente: null,
        balancaCorpoFrenteParaTras: null,
        pulaOuGiraEmTornoDeSi: null,
        repeteSonsSemFuncaoComunicativa: null,
        repeteMovimentosContinuos: null,
        exploraAmbienteLambendoTocando: null,
        procuraObservarObjetosCantoOlho: null,
        organizaObjetosLadoALado: null,
        realizaTarefasSempreMesmaOrdem: null,
        apresentaRituaisDiarios: null,
        observacoesTopografias: '',
    },
    problemasComportamento: {
        apresentaComportamentosAutoLesivos: null,
        autoLesivosQuais: '',
        apresentaComportamentosHeteroagressivos: null,
        heteroagressivosQuais: '',
        apresentaDestruicaoPropriedade: null,
        destruicaoDescrever: '',
        necessitouContencaoMecanica: null,
        observacoesTopografias: '',
    },
};

// Estado inicial de Finalização
const initialFinalizacao: Partial<AnamneseFinalizacao> = {
    outrasInformacoesRelevantes: '',
    observacoesImpressoesTerapeuta: '',
};

export default function AnamnesePage() {
    // Configurar título da página
    const { setPageTitle, setNoMainContainer, setShowBackButton } = usePageTitle();
    const navigate = useNavigate();
    
    useEffect(() => {
        setPageTitle('Anamnese');
        setNoMainContainer(true);
        setShowBackButton(true);
        
        return () => {
            setNoMainContainer(false);
            setShowBackButton(false);
        };
    }, [setPageTitle, setNoMainContainer, setShowBackButton]);
    
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    
    // Estado do cabeçalho
    const [cabecalho, setCabecalho] = useState<AnamnseeCabecalho>(initialCabecalho);
    
    // Estado de Queixa e Diagnóstico
    const [queixaDiagnostico, setQueixaDiagnostico] = useState<Partial<AnamneseQueixaDiagnostico>>(initialQueixaDiagnostico);

    // Estado de Contexto Familiar e Rotina
    const [contextoFamiliarRotina, setContextoFamiliarRotina] = useState<Partial<AnamneseContextoFamiliarRotina>>(initialContextoFamiliarRotina);

    // Estado de Desenvolvimento Inicial
    const [desenvolvimentoInicial, setDesenvolvimentoInicial] = useState<Partial<AnamneseDesenvolvimentoInicial>>(initialDesenvolvimentoInicial);

    // Estado de Atividades de Vida Diária
    const [atividadesVidaDiaria, setAtividadesVidaDiaria] = useState<Partial<AnamneseAtividadesVidaDiaria>>(initialAtividadesVidaDiaria);

    // Estado de Social e Acadêmico
    const [socialAcademico, setSocialAcademico] = useState<Partial<AnamneseSocialAcademico>>(initialSocialAcademico);

    // Estado de Comportamento
    const [comportamento, setComportamento] = useState<Partial<AnamneseComportamento>>(initialComportamento);

    // Estado de Finalização
    const [finalizacao, setFinalizacao] = useState<Partial<AnamneseFinalizacao>>(initialFinalizacao);

    // Detectar se o formulário tem alterações não salvas
    const isDirty = useMemo(() => {
        // Verificar se o cabeçalho tem dados preenchidos (clienteId é o principal)
        const hasClienteSelected = !!cabecalho.clienteId;
        
        // Verificar se há queixa preenchida
        const hasQueixa = !!queixaDiagnostico.queixaPrincipal;
        
        // Considera "dirty" se tiver cliente selecionado ou queixa preenchida
        return hasClienteSelected || hasQueixa;
    }, [cabecalho.clienteId, queixaDiagnostico.queixaPrincipal]);

    // Hook de alterações não salvas
    const { isBlocked, proceed, reset } = useUnsavedChanges({
        isDirty,
        message: 'Você tem uma anamnese em andamento. Deseja realmente sair?',
    });

    // Montar objeto completo da anamnese
    const getAnamneseData = useCallback((): Anamnese => {
        return {
            cabecalho: {
                ...cabecalho,
                clienteNome: cabecalho.clienteNome || '',
                dataNascimento: cabecalho.dataNascimento || '',
                idade: cabecalho.idade || '',
            },
            queixaDiagnostico: {
                queixaPrincipal: queixaDiagnostico.queixaPrincipal || '',
                diagnosticoPrevio: queixaDiagnostico.diagnosticoPrevio || '',
                suspeitaCondicaoAssociada: queixaDiagnostico.suspeitaCondicaoAssociada || '',
                especialidadesConsultadas: queixaDiagnostico.especialidadesConsultadas || [],
                medicamentosEmUso: queixaDiagnostico.medicamentosEmUso || [],
                examesPrevios: queixaDiagnostico.examesPrevios || [],
                terapiasPrevias: queixaDiagnostico.terapiasPrevias || [],
            },
            contextoFamiliarRotina: {
                historicosFamiliares: contextoFamiliarRotina.historicosFamiliares || [],
                atividadesRotina: contextoFamiliarRotina.atividadesRotina || [],
            },
            desenvolvimentoInicial: desenvolvimentoInicial as AnamneseDesenvolvimentoInicial,
            atividadesVidaDiaria: atividadesVidaDiaria as AnamneseAtividadesVidaDiaria,
            socialAcademico: socialAcademico as AnamneseSocialAcademico,
            comportamento: comportamento as AnamneseComportamento,
            finalizacao: {
                outrasInformacoesRelevantes: finalizacao.outrasInformacoesRelevantes || '',
                observacoesImpressoesTerapeuta: finalizacao.observacoesImpressoesTerapeuta || '',
                expectativasFamilia: finalizacao.expectativasFamilia || '',
            },
        };
    }, [
        cabecalho, 
        queixaDiagnostico, 
        contextoFamiliarRotina, 
        desenvolvimentoInicial, 
        atividadesVidaDiaria, 
        socialAcademico, 
        comportamento, 
        finalizacao
    ]);

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setValidationErrors([]);
        }
    };

    const nextStep = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
            setValidationErrors([]);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setValidationErrors([]);
        
        try {
            const anamneseData = getAnamneseData();
            
            // Validar dados mínimos antes de enviar
            const validation = validarAnamneseMinima(anamneseData);
            if (!validation.success) {
                const errorMessages = getValidationErrorMessages(validation.errors);
                setValidationErrors(errorMessages);
                toast.error('Preencha os campos obrigatórios antes de finalizar.');
                return;
            }
            
            // Enviar para o service
            const response = await criarAnamnese(anamneseData, true); // Skip full validation
            
            if (response.success) {
                toast.success('Anamnese cadastrada com sucesso!');
                navigate('/anamnese');
            } else {
                if (response.errors && response.errors.length > 0) {
                    const errorMessages = getValidationErrorMessages(response.errors);
                    setValidationErrors(errorMessages);
                }
                toast.error(response.message || 'Erro ao salvar anamnese.');
            }
        } catch (error) {
            console.error('Erro ao salvar anamnese:', error);
            toast.error('Erro inesperado ao salvar anamnese.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CabecalhoAnamnese 
                        data={cabecalho} 
                        onChange={setCabecalho} 
                    />
                );
            case 2:
                return (
                    <QueixaDiagnosticoStep
                        data={queixaDiagnostico}
                        onChange={setQueixaDiagnostico}
                    />
                );
            case 3:
                return (
                    <ContextoFamiliarRotinaStep
                        data={contextoFamiliarRotina}
                        onChange={setContextoFamiliarRotina}
                    />
                );
            case 4:
                return (
                    <DesenvolvimentoInicialStep
                        data={desenvolvimentoInicial}
                        onChange={setDesenvolvimentoInicial}
                    />
                );
            case 5:
                return (
                    <AtividadesVidaDiariaStep
                        data={atividadesVidaDiaria}
                        onChange={setAtividadesVidaDiaria}
                    />
                );
            case 6:
                return (
                    <SocialAcademicoStep
                        data={socialAcademico}
                        onChange={setSocialAcademico}
                        escolaCliente={cabecalho.escolaCliente}
                    />
                );
            case 7:
                return (
                    <ComportamentoStep
                        data={comportamento}
                        onChange={setComportamento}
                    />
                );
            case 8:
                return (
                    <FinalizacaoStep
                        data={finalizacao}
                        onChange={setFinalizacao}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full gap-1">
            {/* Sidebar Vertical com Steps */}
            <div className="w-64 shrink-0" style={{ 
                backgroundColor: 'var(--header-bg)',
                borderRadius: '16px'
            }}>
                <VerticalStepSidebar
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    steps={STEPS}
                    stepIcons={STEP_ICONS}
                    onStepClick={(step) => setCurrentStep(step)}
                />
            </div>

            {/* Card Principal com Formulário */}
            <div 
                className="flex-1 flex flex-col min-w-0 p-4"
                style={{ 
                    backgroundColor: 'var(--header-bg)',
                    borderRadius: '16px'
                }}
            >
                {/* Erros de validação */}
                {validationErrors.length > 0 && (
                    <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-destructive">
                                    Corrija os seguintes erros:
                                </p>
                                <ul className="text-sm text-destructive/80 list-disc list-inside space-y-0.5">
                                    {validationErrors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Form Content */}
                <div className="flex-1 overflow-auto px-1 pb-4">
                    {renderCurrentStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t border-border">
                    <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 1 || isLoading}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Anterior
                    </Button>

                    {currentStep < STEPS.length ? (
                        <Button onClick={nextStep} disabled={isLoading}>
                            Próximo
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Finalizar Anamnese
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Dialog de confirmação para sair com alterações não salvas */}
            <UnsavedChangesDialog
                open={isBlocked}
                onConfirm={() => proceed?.()}
                onCancel={() => reset?.()}
                title="Anamnese em andamento"
                description="Você tem uma anamnese em andamento que não foi salva. Se sair agora, todos os dados preenchidos serão perdidos. Deseja continuar?"
            />
        </div>
    );
}
