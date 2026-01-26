import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useFormDraft } from '@/hooks/useFormDraft';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';

import {
    type AtaFormData,
    type CabecalhoAta,
    type Participante,
    type TerapeutaOption,
    type AnexoUpload,
    type LinkRecomendacao,
    FINALIDADE_REUNIAO,
    MODALIDADE_REUNIAO,
    TIPO_PARTICIPANTE,
    ataFormSchema,
} from '../types';
import type { DadosFaturamentoAta } from '../types/billing';
import { DADOS_FATURAMENTO_ATA_INITIAL, getFaturamentoTypeByFinalidade } from '../types/billing';

import {
    getTerapeutaLogado,
    listTerapeutas,
    createAta,
    updateAta,
} from '../services/atas.service';

// ============================================
// TIPOS
// ============================================

export interface UseAtaFormOptions {
    /** ID da ata para edição (undefined para criação) */
    ataId?: string;
    /** Dados iniciais (para edição) */
    initialData?: AtaFormData;
    /** Callback após salvar com sucesso */
    onSuccess?: () => void;
}

export interface UseAtaFormReturn {
    // Estado do formulário
    formData: AtaFormData;
    cabecalho: CabecalhoAta | null;
    errors: Record<string, string>;

    // Dados auxiliares
    terapeutas: TerapeutaOption[];
    loadingTerapeutas: boolean;

    // Seleção de área de atuação (quando múltiplas)
    selectedAreaIndex: number;
    hasMultipleAreas: boolean;
    selectArea: (index: number) => void;

    // Estado de submit
    submitting: boolean;
    isEditing: boolean;

    // Unsaved changes
    isDirty: boolean;
    isBlocked: boolean;
    proceedNavigation: (() => void) | undefined;
    resetNavigation: (() => void) | undefined;

    // Handlers do formulário
    updateField: <K extends keyof AtaFormData>(field: K, value: AtaFormData[K]) => void;
    handleClienteChange: (clienteId: string, clienteNome?: string) => void;

    // Handlers de participantes
    addParticipante: (tipo: keyof typeof TIPO_PARTICIPANTE) => void;
    updateParticipante: (id: string, updates: Partial<Participante>) => void;
    removeParticipante: (id: string) => void;
    selectTerapeutaParticipante: (participanteId: string, terapeutaId: string) => void;

    // Handler de faturamento
    handleFaturamentoChange: (faturamento: DadosFaturamentoAta) => void;

    // Ações
    handleSubmit: (anexos?: AnexoUpload[], links?: LinkRecomendacao[], finalizar?: boolean) => Promise<void>;
    clearDraft: () => void;
}

// ============================================
// HELPERS
// ============================================

/** Mapeamento de área de atuação para sigla do conselho profissional */
const AREA_PARA_SIGLA_CONSELHO: Record<string, string> = {
    'Fisioterapia': 'CREFITO',
    'Terapia Ocupacional': 'CREFITO',
    'Fonoaudiologia': 'CRFa',
    'Psicologia': 'CRP',
    'Neuropsicologia': 'CRP',
    'Psicopedagogia': 'CRP',
    'Terapia ABA': 'CRP',
    'Musicoterapia': 'CBMT',
    'Nutrição': 'CRN',
    'Enfermagem': 'COREN',
    'Medicina': 'CRM',
};

function getSiglaConselho(areaAtuacao: string | undefined): string {
    if (!areaAtuacao) return 'CRP';
    return AREA_PARA_SIGLA_CONSELHO[areaAtuacao] || 'CRP';
}

const getInitialFormData = (): AtaFormData => ({
    data: format(new Date(), 'yyyy-MM-dd'),
    horarioInicio: format(new Date(), 'HH:mm'),
    horarioFim: format(new Date(Date.now() + 60 * 60 * 1000), 'HH:mm'),
    finalidade: FINALIDADE_REUNIAO.ORIENTACAO_PARENTAL,
    modalidade: MODALIDADE_REUNIAO.PRESENCIAL,
    participantes: [],
    conteudo: '',
    clienteId: '',
    clienteNome: '',
    faturamento: DADOS_FATURAMENTO_ATA_INITIAL,
});

// ============================================
// HOOK
// ============================================

export function useAtaForm({
    ataId,
    initialData,
    onSuccess,
}: UseAtaFormOptions = {}): UseAtaFormReturn {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditing = !!ataId;

    // Estados
    const [cabecalho, setCabecalho] = useState<CabecalhoAta | null>(null);
    const [terapeutas, setTerapeutas] = useState<TerapeutaOption[]>([]);
    const [loadingTerapeutas, setLoadingTerapeutas] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);

    // Auto-save com sessionStorage
    const {
        value: formData,
        setValue: setFormData,
        clearDraft,
        hasDraft,
    } = useFormDraft<AtaFormData>({
        key: ataId ? `ata_reuniao_edit_${ataId}` : 'ata_reuniao_nova',
        initialValue: initialData ?? getInitialFormData(),
        debounceMs: 1500,
        showRestoreToast: true,
    });

    // Detectar alterações não salvas
    const isDirty = hasDraft || formData.conteudo.length > 0 || formData.participantes.length > 0;
    const {
        isBlocked,
        proceed: proceedNavigation,
        reset: resetNavigation,
    } = useUnsavedChanges({
        isDirty,
        blockNavigation: !submitting,
    });

    // ============================================
    // EFEITOS - CARREGAR DADOS
    // ============================================

    // Sincronizar initialData quando chega (edição async)
    useEffect(() => {
        if (initialData && !hasDraft) {
            setFormData(initialData);
        }
    }, [initialData, hasDraft, setFormData]);

    useEffect(() => {
        async function loadCabecalho() {
            if (!user?.id) return;
            try {
                const data = await getTerapeutaLogado(user.id);
                setCabecalho(data);
            } catch (error) {
                console.error('Erro ao carregar dados do terapeuta:', error);
                setCabecalho({
                    terapeutaId: user.id,
                    terapeutaNome: user.name ?? 'Terapeuta',
                    profissao: undefined,
                    cargo: undefined,
                });
            }
        }
        loadCabecalho();
    }, [user]);

    useEffect(() => {
        async function loadTerapeutas() {
            try {
                const data = await listTerapeutas();
                setTerapeutas(data);
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
                toast.error('Erro ao carregar lista de profissionais');
            } finally {
                setLoadingTerapeutas(false);
            }
        }
        loadTerapeutas();
    }, []);

    // Atualizar tipo de faturamento automaticamente quando finalidade mudar
    useEffect(() => {
        if (!formData.finalidade) return;
        
        const novoTipo = getFaturamentoTypeByFinalidade(formData.finalidade);
        
        if (formData.faturamento?.tipoFaturamento !== novoTipo) {
            setFormData((prev) => ({
                ...prev,
                faturamento: {
                    ...(prev.faturamento || DADOS_FATURAMENTO_ATA_INITIAL),
                    tipoFaturamento: novoTipo,
                },
            }));
        }
    }, [formData.finalidade, formData.faturamento?.tipoFaturamento, setFormData]);

    // ============================================
    // SELEÇÃO DE ÁREA DE ATUAÇÃO
    // ============================================

    const hasMultipleAreas = (cabecalho?.dadosProfissionais?.length ?? 0) > 1;

    const selectArea = useCallback(
        (index: number) => {
            if (!cabecalho?.dadosProfissionais?.[index]) return;
            
            const selected = cabecalho.dadosProfissionais[index];
            setSelectedAreaIndex(index);
            
            // Atualiza o cabeçalho com a área selecionada
            setCabecalho((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    profissao: selected.areaAtuacao,
                    cargo: selected.cargo,
                    conselhoNumero: selected.numeroConselho ?? undefined,
                    conselhoTipo: getSiglaConselho(selected.areaAtuacao),
                };
            });
        },
        [cabecalho?.dadosProfissionais]
    );

    // ============================================
    // HANDLERS - FORMULÁRIO
    // ============================================

    const updateField = useCallback(
        <K extends keyof AtaFormData>(field: K, value: AtaFormData[K]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            if (errors[field]) {
                setErrors((prev) => {
                    const next = { ...prev };
                    delete next[field];
                    return next;
                });
            }
        },
        [setFormData, errors]
    );

    const handleClienteChange = useCallback(
        (clienteId: string, clienteNome?: string) => {
            setFormData((prev) => ({
                ...prev,
                clienteId,
                clienteNome: clienteNome ?? prev.clienteNome,
            }));
        },
        [setFormData]
    );

    // ============================================
    // HANDLERS - PARTICIPANTES
    // ============================================

    const addParticipante = useCallback(
        (tipo: keyof typeof TIPO_PARTICIPANTE) => {
            const novoParticipante: Participante = {
                id: crypto.randomUUID(),
                tipo: TIPO_PARTICIPANTE[tipo],
                nome: '',
                descricao: '',
            };
            setFormData((prev) => ({
                ...prev,
                participantes: [...prev.participantes, novoParticipante],
            }));
        },
        [setFormData]
    );

    const updateParticipante = useCallback(
        (id: string, updates: Partial<Participante>) => {
            setFormData((prev) => ({
                ...prev,
                participantes: prev.participantes.map((p) =>
                    p.id === id ? { ...p, ...updates } : p
                ),
            }));
        },
        [setFormData]
    );

    const removeParticipante = useCallback(
        (id: string) => {
            setFormData((prev) => ({
                ...prev,
                participantes: prev.participantes.filter((p) => p.id !== id),
            }));
        },
        [setFormData]
    );

    const selectTerapeutaParticipante = useCallback(
        (participanteId: string, terapeutaId: string) => {
            const terapeuta = terapeutas.find((t) => t.id === terapeutaId);
            if (!terapeuta) return;

            updateParticipante(participanteId, {
                terapeutaId,
                nome: terapeuta.nome,
                especialidade: terapeuta.especialidade,
                cargo: terapeuta.cargo,
            });
        },
        [terapeutas, updateParticipante]
    );

    // ============================================
    // HANDLERS - FATURAMENTO
    // ============================================

    const handleFaturamentoChange = useCallback(
        (faturamento: DadosFaturamentoAta) => {
            setFormData((prev) => ({
                ...prev,
                faturamento,
            }));
        },
        [setFormData]
    );

    // ============================================
    // VALIDAÇÃO E SUBMIT
    // ============================================

    const validateForm = useCallback((): boolean => {
        const result = ataFormSchema.safeParse(formData);

        if (!result.success) {
            const newErrors: Record<string, string> = {};
            result.error.errors.forEach((err) => {
                const path = err.path.join('.');
                newErrors[path] = err.message;
            });
            setErrors(newErrors);

            const firstError = result.error.errors[0];
            toast.error(firstError.message);
            return false;
        }

        // Validar horário fim > início
        if (formData.horarioInicio && formData.horarioFim) {
            const [horaInicio, minInicio] = formData.horarioInicio.split(':').map(Number);
            const [horaFim, minFim] = formData.horarioFim.split(':').map(Number);
            const inicioMin = horaInicio * 60 + minInicio;
            const fimMin = horaFim * 60 + minFim;
            
            if (fimMin <= inicioMin) {
                setErrors({ horarioFim: 'Horário de término deve ser maior que o início' });
                toast.error('Horário de término deve ser maior que o início');
                return false;
            }
        }

        setErrors({});
        return true;
    }, [formData]);

    const handleSubmit = useCallback(async (
        anexos?: AnexoUpload[], 
        links?: LinkRecomendacao[],
        finalizar?: boolean
    ) => {
        if (!validateForm()) return;
        if (!cabecalho) {
            toast.error('Dados do terapeuta não carregados');
            return;
        }

        setSubmitting(true);

        // Inclui links no formData
        const formDataComLinks = { ...formData, links };
        const status = finalizar ? 'finalizada' : 'rascunho';
        try {
            if (ataId) {
                await updateAta(ataId, { formData: formDataComLinks, anexos, status });
                toast.success(finalizar ? 'Ata finalizada com sucesso!' : 'Ata atualizada com sucesso!');
            } else {
                await createAta({ formData: formDataComLinks, cabecalho, anexos, status });
                toast.success(finalizar ? 'Ata criada e finalizada!' : 'Rascunho salvo com sucesso!');
            }

            clearDraft();
            onSuccess?.();
            navigate('/app/atas');
        } catch (error) {
            console.error('Erro ao salvar ata:', error);
            const message = error instanceof Error ? error.message : 'Erro desconhecido';
            if (message.includes('rede') || message.includes('network')) {
                toast.error('Erro de conexão. Verifique sua internet.');
            } else if (message.includes('permissão') || message.includes('403')) {
                toast.error('Você não tem permissão para esta ação.');
            } else if (message.includes('validação') || message.includes('400')) {
                toast.error('Dados inválidos. Revise o formulário.');
            } else {
                toast.error('Erro ao salvar ata. Tente novamente.');
            }
        } finally {
            setSubmitting(false);
        }
    }, [ataId, cabecalho, formData, validateForm, clearDraft, navigate, onSuccess]);

    // ============================================
    // RETORNO
    // ============================================

    return {
        // Estado do formulário
        formData,
        cabecalho,
        errors,

        // Dados auxiliares
        terapeutas,
        loadingTerapeutas,

        // Seleção de área de atuação
        selectedAreaIndex,
        hasMultipleAreas,
        selectArea,

        // Estado de submit
        submitting,
        isEditing,

        // Unsaved changes
        isDirty,
        isBlocked,
        proceedNavigation,
        resetNavigation,

        // Handlers do formulário
        updateField,
        handleClienteChange,

        // Handlers de participantes
        addParticipante,
        updateParticipante,
        removeParticipante,
        selectTerapeutaParticipante,

        // Handler de faturamento
        handleFaturamentoChange,

        // Ações
        handleSubmit,
        clearDraft,
    };
}
