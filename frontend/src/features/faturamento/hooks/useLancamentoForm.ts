/**
 * Hook: useLancamentoForm
 * 
 * Gerencia o formulário de criação/edição de lançamento.
 */

import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type {
    Lancamento,
    CreateLancamentoInput,
    LancamentoFormSchema,
    ClienteOption,
    TerapeutaOption,
    AnexoUpload,
} from '../types';
import { lancamentoFormSchema } from '../types';
import {
    createLancamento,
    updateLancamento,
    listClientes,
    getTerapeutaLogado,
} from '../services/faturamento.service';

interface UseLancamentoFormOptions {
    /** Lançamento para edição (se null, é criação) */
    lancamento?: Lancamento | null;
    /** Callback após salvar com sucesso */
    onSuccess?: (lancamento: Lancamento) => void;
    /** Callback ao cancelar */
    onCancel?: () => void;
}

interface UseLancamentoFormReturn {
    /** Form do react-hook-form */
    form: ReturnType<typeof useForm<LancamentoFormSchema>>;
    /** Se está salvando */
    saving: boolean;
    /** Lista de clientes para seleção */
    clientes: ClienteOption[];
    /** Carregando clientes */
    loadingClientes: boolean;
    /** Terapeuta logado */
    terapeuta: TerapeutaOption | null;
    /** Anexos selecionados */
    anexos: AnexoUpload[];
    /** Adicionar anexo */
    addAnexo: (file: File) => void;
    /** Remover anexo */
    removeAnexo: (id: string) => void;
    /** Renomear anexo */
    renameAnexo: (id: string, nome: string) => void;
    /** Submeter formulário */
    handleSubmit: () => Promise<void>;
    /** Cancelar */
    handleCancel: () => void;
    /** Modo de edição */
    isEditing: boolean;
    /** Buscar clientes */
    searchClientes: (q: string) => Promise<void>;
}

export function useLancamentoForm(options: UseLancamentoFormOptions = {}): UseLancamentoFormReturn {
    const { lancamento, onSuccess, onCancel } = options;
    const isEditing = !!lancamento;

    const [saving, setSaving] = useState(false);
    const [clientes, setClientes] = useState<ClienteOption[]>([]);
    const [loadingClientes, setLoadingClientes] = useState(false);
    const [terapeuta, setTerapeuta] = useState<TerapeutaOption | null>(null);
    const [anexos, setAnexos] = useState<AnexoUpload[]>([]);

    // Data atual no formato ISO (YYYY-MM-DD)
    const hoje = new Date().toISOString().split('T')[0];

    // Configurar formulário com Zod
    const form = useForm<LancamentoFormSchema>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(lancamentoFormSchema as any),
        defaultValues: {
            clienteId: lancamento?.clienteId || '',
            data: lancamento?.data || hoje,
            horarioInicio: lancamento?.horarioInicio || '',
            horarioFim: lancamento?.horarioFim || '',
            tipoAtividade: lancamento?.tipoAtividade || undefined,
            isHomecare: lancamento?.isHomecare || false,
            observacoes: lancamento?.observacoes || '',
        },
    });

    // Carregar clientes e terapeuta ao montar
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [clientesData, terapeutaData] = await Promise.all([
                    listClientes(),
                    getTerapeutaLogado(),
                ]);
                setClientes(clientesData);
                setTerapeuta(terapeutaData);
            } catch (err) {
                console.error('Erro ao carregar dados iniciais:', err);
                toast.error('Erro ao carregar dados do formulário');
            }
        };

        loadInitialData();
    }, []);

    // Buscar clientes
    const searchClientes = useCallback(async (q: string) => {
        setLoadingClientes(true);
        try {
            const result = await listClientes(q);
            setClientes(result);
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
        } finally {
            setLoadingClientes(false);
        }
    }, []);

    // Adicionar anexo
    const addAnexo = useCallback((file: File) => {
        const newAnexo: AnexoUpload = {
            id: `anexo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            file,
            nome: file.name,
        };
        setAnexos(prev => [...prev, newAnexo]);
    }, []);

    // Remover anexo
    const removeAnexo = useCallback((id: string) => {
        setAnexos(prev => prev.filter(a => a.id !== id));
    }, []);

    // Renomear anexo
    const renameAnexo = useCallback((id: string, nome: string) => {
        setAnexos(prev => prev.map(a => a.id === id ? { ...a, nome } : a));
    }, []);

    // Submeter formulário
    const handleSubmit = useCallback(async () => {
        const isValid = await form.trigger();
        if (!isValid) return;

        const values = form.getValues();
        setSaving(true);

        try {
            const input: CreateLancamentoInput = {
                clienteId: values.clienteId,
                data: values.data,
                horarioInicio: values.horarioInicio,
                horarioFim: values.horarioFim,
                tipoAtividade: values.tipoAtividade,
                isHomecare: values.isHomecare,
                observacoes: values.observacoes,
                anexos: anexos.length > 0 ? anexos : undefined,
            };

            let result: Lancamento | null;

            if (isEditing && lancamento) {
                result = await updateLancamento(lancamento.id, input);
                toast.success('Lançamento atualizado com sucesso!');
            } else {
                result = await createLancamento(input, terapeuta?.id || '');
                toast.success('Lançamento registrado com sucesso!');
            }

            if (result && onSuccess) {
                onSuccess(result);
            }

            // Limpar formulário após criação
            if (!isEditing) {
                form.reset();
                setAnexos([]);
            }
        } catch (err) {
            console.error('Erro ao salvar lançamento:', err);
            toast.error(isEditing 
                ? 'Erro ao atualizar lançamento' 
                : 'Erro ao registrar lançamento'
            );
        } finally {
            setSaving(false);
        }
    }, [form, anexos, isEditing, lancamento, terapeuta, onSuccess]);

    // Cancelar
    const handleCancel = useCallback(() => {
        form.reset();
        setAnexos([]);
        onCancel?.();
    }, [form, onCancel]);

    return {
        form,
        saving,
        clientes,
        loadingClientes,
        terapeuta,
        anexos,
        addAnexo,
        removeAnexo,
        renameAnexo,
        handleSubmit,
        handleCancel,
        isEditing,
        searchClientes,
    };
}
