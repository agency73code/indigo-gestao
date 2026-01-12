/**
 * Hook para gerenciar o estado e lógica do formulário de Ata de Reunião
 *
 * Responsabilidades:
 * - Gerenciar estado do formulário com auto-save
 * - Carregar dados auxiliares (terapeutas, clientes, cabeçalho)
 * - Validação com Zod
 * - CRUD de participantes
 * - Submit (criar/atualizar)
 */

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
    type ClienteOption,
    FINALIDADE_REUNIAO,
    MODALIDADE_REUNIAO,
    TIPO_PARTICIPANTE,
    ataFormSchema,
} from '../types';

import {
    getTerapeutaLogado,
    listTerapeutas,
    listClientes,
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
    clientes: ClienteOption[];
    loadingTerapeutas: boolean;
    loadingClientes: boolean;

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
    handleClienteChange: (clienteId: string) => void;

    // Handlers de participantes
    addParticipante: (tipo: keyof typeof TIPO_PARTICIPANTE) => void;
    updateParticipante: (id: string, updates: Partial<Participante>) => void;
    removeParticipante: (id: string) => void;
    selectTerapeutaParticipante: (participanteId: string, terapeutaId: string) => void;

    // Ações
    handleSubmit: () => Promise<void>;
    clearDraft: () => void;
}

// ============================================
// HELPERS
// ============================================

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
    const [clientes, setClientes] = useState<ClienteOption[]>([]);
    const [loadingTerapeutas, setLoadingTerapeutas] = useState(true);
    const [loadingClientes, setLoadingClientes] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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

    useEffect(() => {
        async function loadClientes() {
            try {
                const data = await listClientes();
                setClientes(data);
            } catch (error) {
                console.error('Erro ao carregar clientes:', error);
                toast.error('Erro ao carregar lista de clientes');
            } finally {
                setLoadingClientes(false);
            }
        }
        loadClientes();
    }, []);

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
        (clienteId: string) => {
            const cliente = clientes.find((c) => c.id === clienteId);
            setFormData((prev) => ({
                ...prev,
                clienteId,
                clienteNome: cliente?.nome ?? '',
            }));
        },
        [clientes, setFormData]
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

        setErrors({});
        return true;
    }, [formData]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) return;
        if (!cabecalho) {
            toast.error('Dados do terapeuta não carregados');
            return;
        }

        setSubmitting(true);

        try {
            if (ataId) {
                await updateAta(ataId, { formData });
                toast.success('Ata atualizada com sucesso!');
            } else {
                await createAta({ formData, cabecalho });
                toast.success('Ata criada com sucesso!');
            }

            clearDraft();
            onSuccess?.();
            navigate('/app/atas');
        } catch (error) {
            console.error('Erro ao salvar ata:', error);
            toast.error('Erro ao salvar ata. Tente novamente.');
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
        clientes,
        loadingTerapeutas,
        loadingClientes,

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

        // Ações
        handleSubmit,
        clearDraft,
    };
}
