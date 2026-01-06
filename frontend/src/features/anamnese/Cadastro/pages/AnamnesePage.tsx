import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/ui/button';
import { ArrowLeft, ArrowRight, Check, AlertCircle, CheckCircle, X } from 'lucide-react';
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
import { validateStep, type StepValidationResult } from '../services/anamnese-cadastro.validation';
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
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    
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

    // Handlers que limpam erros quando os dados mudam
    const handleCabecalhoChange = useCallback((newData: AnamnseeCabecalho) => {
        setCabecalho(prevData => {
            // Identificar quais campos mudaram e limpar seus erros
            const changedFields: string[] = [];
            if (newData.clienteId !== prevData.clienteId) changedFields.push('clienteId');
            if (newData.dataEntrevista !== prevData.dataEntrevista) changedFields.push('dataEntrevista');
            if (newData.informante !== prevData.informante) changedFields.push('informante');
            if (newData.parentesco !== prevData.parentesco) changedFields.push('parentesco');
            if (newData.profissionalId !== prevData.profissionalId) changedFields.push('profissionalId');
            
            if (changedFields.length > 0) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    changedFields.forEach(field => delete updated[field]);
                    // Se não há mais erros, limpar o banner também
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            return newData;
        });
    }, []);

    const handleQueixaDiagnosticoChange = useCallback((newData: Partial<AnamneseQueixaDiagnostico>) => {
        setQueixaDiagnostico(prevData => {
            const fieldsToCheck = [
                'queixaPrincipal',
                'diagnosticoPrevio', 
                'suspeitaCondicaoAssociada'
            ];
            
            const changedFields: string[] = [];
            
            // Verificar campos de texto
            fieldsToCheck.forEach(field => {
                if (newData[field as keyof AnamneseQueixaDiagnostico] !== prevData[field as keyof AnamneseQueixaDiagnostico]) {
                    changedFields.push(field);
                }
            });
            
            // Verificar arrays e limpar erros relacionados quando itens são atualizados
            const arrays = ['especialidadesConsultadas', 'medicamentosEmUso', 'examesPrevios', 'terapiasPrevias'] as const;
            arrays.forEach(arrayField => {
                const newArr = newData[arrayField] as unknown[];
                const prevArr = prevData[arrayField] as unknown[];
                if (JSON.stringify(newArr) !== JSON.stringify(prevArr)) {
                    // Limpar todos os erros que começam com este prefixo
                    setFieldErrors(prev => {
                        const updated = { ...prev };
                        Object.keys(updated).forEach(key => {
                            if (key.startsWith(arrayField)) {
                                delete updated[key];
                            }
                        });
                        // Limpar banner se não há mais erros
                        if (Object.keys(updated).length === 0) {
                            setValidationErrors([]);
                        }
                        return updated;
                    });
                }
            });
            
            // Limpar erros dos campos de texto que mudaram
            if (changedFields.length > 0) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    changedFields.forEach(field => delete updated[field]);
                    // Limpar banner se não há mais erros
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            return newData;
        });
    }, []);

    const handleContextoFamiliarChange = useCallback((newData: Partial<AnamneseContextoFamiliarRotina>) => {
        setContextoFamiliarRotina(prevData => {
            // Verificar arrays e limpar erros relacionados quando itens são atualizados
            const arrays = ['historicosFamiliares', 'atividadesRotina'] as const;
            arrays.forEach(arrayField => {
                const newArr = newData[arrayField] as unknown[];
                const prevArr = prevData[arrayField] as unknown[];
                if (JSON.stringify(newArr) !== JSON.stringify(prevArr)) {
                    setFieldErrors(prev => {
                        const updated = { ...prev };
                        Object.keys(updated).forEach(key => {
                            if (key.startsWith(arrayField)) {
                                delete updated[key];
                            }
                        });
                        if (Object.keys(updated).length === 0) {
                            setValidationErrors([]);
                        }
                        return updated;
                    });
                }
            });
            
            return newData;
        });
    }, []);

    const handleDesenvolvimentoInicialChange = useCallback((newData: Partial<AnamneseDesenvolvimentoInicial>) => {
        setDesenvolvimentoInicial(prevData => {
            // Verificar se gestacaoParto mudou
            if (JSON.stringify(newData.gestacaoParto) !== JSON.stringify(prevData.gestacaoParto)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('gestacaoParto.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            // Verificar se neuropsicomotor mudou
            if (JSON.stringify(newData.neuropsicomotor) !== JSON.stringify(prevData.neuropsicomotor)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('neuropsicomotor.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            // Verificar se falaLinguagem mudou
            if (JSON.stringify(newData.falaLinguagem) !== JSON.stringify(prevData.falaLinguagem)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('falaLinguagem.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            return newData;
        });
    }, []);

    const handleAtividadesVidaDiariaChange = useCallback((newData: Partial<AnamneseAtividadesVidaDiaria>) => {
        setAtividadesVidaDiaria(prevData => {
            // Verificar mudanças em desfralde
            if (JSON.stringify(newData.desfralde) !== JSON.stringify(prevData.desfralde)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('desfralde.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            // Verificar mudanças em sono
            if (JSON.stringify(newData.sono) !== JSON.stringify(prevData.sono)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('sono.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            // Verificar mudanças em habitosHigiene
            if (JSON.stringify(newData.habitosHigiene) !== JSON.stringify(prevData.habitosHigiene)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('habitosHigiene.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            // Verificar mudanças em alimentacao
            if (JSON.stringify(newData.alimentacao) !== JSON.stringify(prevData.alimentacao)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('alimentacao.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            return newData;
        });
    }, []);

    const handleSocialAcademicoChange = useCallback((newData: Partial<AnamneseSocialAcademico>) => {
        setSocialAcademico(prevData => {
            // Verificar mudanças em desenvolvimentoSocial
            if (JSON.stringify(newData.desenvolvimentoSocial) !== JSON.stringify(prevData.desenvolvimentoSocial)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('desenvolvimentoSocial.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            // Verificar mudanças em desenvolvimentoAcademico
            if (JSON.stringify(newData.desenvolvimentoAcademico) !== JSON.stringify(prevData.desenvolvimentoAcademico)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('desenvolvimentoAcademico.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            return newData;
        });
    }, []);

    const handleComportamentoChange = useCallback((newData: Partial<AnamneseComportamento>) => {
        setComportamento(prevData => {
            // Verificar mudanças em estereotipiasRituais
            if (JSON.stringify(newData.estereotipiasRituais) !== JSON.stringify(prevData.estereotipiasRituais)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('estereotipiasRituais.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            // Verificar mudanças em problemasComportamento
            if (JSON.stringify(newData.problemasComportamento) !== JSON.stringify(prevData.problemasComportamento)) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach(key => {
                        if (key.startsWith('problemasComportamento.')) {
                            delete updated[key];
                        }
                    });
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            return newData;
        });
    }, []);

    const handleFinalizacaoChange = useCallback((newData: Partial<AnamneseFinalizacao>) => {
        setFinalizacao(prevData => {
            const fieldsToCheck = ['outrasInformacoesRelevantes', 'observacoesImpressoesTerapeuta', 'expectativasFamilia'] as const;
            
            const changedFields: string[] = [];
            fieldsToCheck.forEach(field => {
                if (newData[field] !== prevData[field]) {
                    changedFields.push(field);
                }
            });
            
            if (changedFields.length > 0) {
                setFieldErrors(prev => {
                    const updated = { ...prev };
                    changedFields.forEach(field => delete updated[field]);
                    if (Object.keys(updated).length === 0) {
                        setValidationErrors([]);
                    }
                    return updated;
                });
            }
            
            return newData;
        });
    }, []);

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
            setFieldErrors({});
        }
    };

    // Obter dados do step atual para validação
    const getStepData = useCallback((step: number): Record<string, unknown> => {
        switch (step) {
            case 1:
                return cabecalho as unknown as Record<string, unknown>;
            case 2:
                return queixaDiagnostico as unknown as Record<string, unknown>;
            case 3:
                return contextoFamiliarRotina as unknown as Record<string, unknown>;
            case 4:
                return desenvolvimentoInicial as unknown as Record<string, unknown>;
            case 5:
                return atividadesVidaDiaria as unknown as Record<string, unknown>;
            case 6:
                return socialAcademico as unknown as Record<string, unknown>;
            case 7:
                return comportamento as unknown as Record<string, unknown>;
            case 8:
                return finalizacao as unknown as Record<string, unknown>;
            default:
                return {};
        }
    }, [cabecalho, queixaDiagnostico, contextoFamiliarRotina, desenvolvimentoInicial, atividadesVidaDiaria, socialAcademico, comportamento, finalizacao]);

    const nextStep = () => {
        // Validar step atual antes de avançar
        const stepData = getStepData(currentStep);
        const validation: StepValidationResult = validateStep(currentStep, stepData);
        
        if (!validation.isValid) {
            // Converter erros para fieldErrors
            const newFieldErrors: Record<string, string> = {};
            validation.errors.forEach((err) => {
                newFieldErrors[err.field] = err.message;
            });
            
            setFieldErrors(newFieldErrors);
            setValidationErrors(validation.errorMessages);
            toast.error('Preencha os campos obrigatórios antes de avançar.');
            return;
        }
        
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
            setValidationErrors([]);
            setFieldErrors({});
        }
    };

    // Handler para clique direto no step da sidebar
    const handleStepClick = (step: number) => {
        // Se está tentando voltar, permite sem validação
        if (step < currentStep) {
            setCurrentStep(step);
            setValidationErrors([]);
            setFieldErrors({});
            return;
        }
        
        // Se está tentando avançar, valida todos os steps anteriores
        for (let i = currentStep; i < step; i++) {
            const stepData = getStepData(i);
            const validation = validateStep(i, stepData);
            
            if (!validation.isValid) {
                // Ir para o step com erro
                setCurrentStep(i);
                setValidationErrors(validation.errorMessages);
                const newFieldErrors: Record<string, string> = {};
                validation.errors.forEach((err) => {
                    newFieldErrors[err.field] = err.message;
                });
                setFieldErrors(newFieldErrors);
                toast.error(`Complete a etapa "${STEPS[i - 1]}" antes de avançar.`);
                return;
            }
        }
        
        // Todos os steps anteriores são válidos
        setCurrentStep(step);
        setValidationErrors([]);
        setFieldErrors({});
    };

    const handleSubmit = async () => {
        // Primeiro, validar o step atual (8 - Finalização)
        const stepData = getStepData(currentStep);
        const stepValidation: StepValidationResult = validateStep(currentStep, stepData);
        
        if (!stepValidation.isValid) {
            // Converter erros para fieldErrors
            const newFieldErrors: Record<string, string> = {};
            stepValidation.errors.forEach((err) => {
                newFieldErrors[err.field] = err.message;
            });
            
            setFieldErrors(newFieldErrors);
            setValidationErrors(stepValidation.errorMessages);
            toast.error('Preencha os campos obrigatórios antes de finalizar.');
            return;
        }
        
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
                toast.success('Anamnese cadastrada com sucesso!', {
                    description: 'O cadastro foi realizado e a anamnese foi adicionada ao sistema.',
                    duration: 3000,
                    icon: <CheckCircle className="h-4 w-4" />,
                    action: {
                        label: <X className="h-4 w-4" />,
                        onClick: () => {},
                    },
                    cancel: {
                        label: 'Fechar',
                        onClick: () => {},
                    },
                });
                // Usar window.location para evitar o blocker do react-router
                window.location.href = '/app/anamnese/lista';
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
                        onChange={handleCabecalhoChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 2:
                return (
                    <QueixaDiagnosticoStep
                        data={queixaDiagnostico}
                        onChange={handleQueixaDiagnosticoChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 3:
                return (
                    <ContextoFamiliarRotinaStep
                        data={contextoFamiliarRotina}
                        onChange={handleContextoFamiliarChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 4:
                return (
                    <DesenvolvimentoInicialStep
                        data={desenvolvimentoInicial}
                        onChange={handleDesenvolvimentoInicialChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 5:
                return (
                    <AtividadesVidaDiariaStep
                        data={atividadesVidaDiaria}
                        onChange={handleAtividadesVidaDiariaChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 6:
                return (
                    <SocialAcademicoStep
                        data={socialAcademico}
                        onChange={handleSocialAcademicoChange}
                        escolaCliente={cabecalho.escolaCliente}
                        fieldErrors={fieldErrors}
                    />
                );
            case 7:
                return (
                    <ComportamentoStep
                        data={comportamento}
                        onChange={handleComportamentoChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 8:
                return (
                    <FinalizacaoStep
                        data={finalizacao}
                        onChange={handleFinalizacaoChange}
                        fieldErrors={fieldErrors}
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
                    onStepClick={handleStepClick}
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
