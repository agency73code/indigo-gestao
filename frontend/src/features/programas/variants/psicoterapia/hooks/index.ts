/**
 * Hook para gerenciamento do Prontuário Psicológico
 */

import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@/features/programas/consultar-programas/types';
import type { 
    ProntuarioFormData, 
    MembroNucleoFamiliar,
    EvolucaoFormData,
    ArquivoEvolucao,
} from '../types';
import {
    buscarCliente,
    calcularIdade,
    formatarEndereco,
    mapearNucleoFamiliar,
    criarProntuario,
    atualizarProntuario,
    criarEvolucao,
    verificarProntuarioExistente,
    buscarAnamneseDoCliente,
    buscarProntuario,
} from '../services';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { buscarTerapeutaPorId } from '@/lib/api';
import { toast } from 'sonner';

// ============================================
// ESTADO INICIAL DO FORMULÁRIO
// ============================================

const initialFormData: ProntuarioFormData = {
    // Identificação
    clienteId: '',
    clienteNome: '',
    dataNascimento: '',
    idade: '',
    genero: '',
    enderecoCompleto: '',
    telefoneResidencial: '',
    celular: '',
    email: '',
    
    // Informações Educacionais
    nivelEscolaridade: '',
    instituicaoFormacao: '',
    profissaoOcupacao: '',
    observacoesEducacao: '',
    
    // Núcleo Familiar
    nucleoFamiliar: [],
    observacoesNucleoFamiliar: '',
    
    // Avaliação da Demanda
    encaminhadoPor: '',
    motivoBuscaAtendimento: '',
    atendimentosAnteriores: '',
    observacoesAvaliacao: '',
    terapiasPrevias: [],
    
    // Objetivos de Trabalho
    objetivosTrabalho: '',
    
    // Avaliação do Atendimento
    avaliacaoAtendimento: '',
    
    // Terapeuta
    terapeutaId: '',
    terapeutaNome: '',
    terapeutaCrp: '',
};

// ============================================
// HOOK: useProntuarioForm
// ============================================

export function useProntuarioForm(prontuarioId?: string) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<ProntuarioFormData>(initialFormData);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [prontuarioExistente, setProntuarioExistente] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Carregar prontuário existente em modo de edição
    useEffect(() => {
        async function loadProntuario() {
            if (!prontuarioId) return;
            
            setIsLoading(true);
            setIsEditMode(true);
            
            try {
                const prontuario = await buscarProntuario(prontuarioId);

                if (prontuario) {
                    // Mapear dados do prontuário para o formData
                    setFormData({
                        clienteId: prontuario.clienteId,
                        clienteNome: prontuario.cliente?.nome || '',
                        dataNascimento: prontuario.cliente?.dataNascimento || '',
                        idade: prontuario.cliente?.idade || '',
                        genero: prontuario.cliente?.genero || '',
                        enderecoCompleto: prontuario.cliente?.enderecoCompleto || '',
                        telefoneResidencial: prontuario.cliente?.telefoneResidencial || '',
                        celular: prontuario.cliente?.celular || '',
                        email: prontuario.cliente?.email || '',
                        
                        nivelEscolaridade: prontuario.informacoesEducacionais?.nivelEscolaridade || '',
                        instituicaoFormacao: prontuario.informacoesEducacionais?.instituicaoFormacao || '',
                        profissaoOcupacao: prontuario.informacoesEducacionais?.profissaoOcupacao || '',
                        observacoesEducacao: prontuario.informacoesEducacionais?.observacoes || '',
                        
                        nucleoFamiliar: prontuario.nucleoFamiliar || [],
                        observacoesNucleoFamiliar: prontuario.observacoesNucleoFamiliar || '',
                        
                        encaminhadoPor: prontuario.avaliacaoDemanda?.encaminhadoPor || '',
                        motivoBuscaAtendimento: prontuario.avaliacaoDemanda?.motivoBuscaAtendimento || '',
                        atendimentosAnteriores: prontuario.avaliacaoDemanda?.atendimentosAnteriores || '',
                        observacoesAvaliacao: prontuario.avaliacaoDemanda?.observacoes || '',
                        terapiasPrevias: prontuario.avaliacaoDemanda?.terapiasPrevias || [],
                        
                        objetivosTrabalho: prontuario.objetivosTrabalho || '',
                        avaliacaoAtendimento: prontuario.avaliacaoAtendimento || '',
                        
                        terapeutaId: prontuario.terapeutaId || '',
                        terapeutaNome: prontuario.terapeuta?.nome || '',
                        terapeutaCrp: prontuario.terapeuta?.crp || '',
                    });
                }
            } catch (error) {
                console.error('Erro ao carregar prontuário:', error);
                toast.error('Erro ao carregar dados do prontuário');
            } finally {
                setIsLoading(false);
            }
        }
        
        loadProntuario();
    }, [prontuarioId]);

    // Carregar terapeuta logado automaticamente (apenas em modo de cadastro)
    useEffect(() => {
        async function loadTerapeuta() {
            // Não carregar se já tiver terapeuta ou se estiver em modo de edição
            if (!user || formData.terapeutaId || isEditMode) return;

            try {
                const terapeuta = await buscarTerapeutaPorId(user.id);
                // Buscar número do conselho (CRP) do terapeuta que seja de psicologia
                const dadoPsico = terapeuta.dadosProfissionais?.find(
                    (d) => d.areaAtuacao?.toLowerCase().includes('psico')
                );
                
                setFormData(prev => ({
                    ...prev,
                    terapeutaId: terapeuta.id!,
                    terapeutaNome: terapeuta.nome,
                    terapeutaCrp: dadoPsico?.numeroConselho || '',
                }));
            } catch (error) {
                console.error('Erro ao carregar terapeuta:', error);
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        terapeutaId: user.id,
                        terapeutaNome: user.name ?? 'Terapeuta',
                        terapeutaCrp: '',
                    }));
                }
            }
        }
        loadTerapeuta();
    }, [user, formData.terapeutaId]);

    // Handler para seleção de cliente
    const handleClienteSelect = useCallback(async (patient: Patient) => {
        setIsLoading(true);
        
        try {
            // Verificar se já existe prontuário
            const existe = await verificarProntuarioExistente(patient.id);
            if (existe) {
                setProntuarioExistente(true);
                toast.error('Este cliente já possui um prontuário psicológico cadastrado.');
                setIsLoading(false);
                return;
            }
            
            setProntuarioExistente(false);
            
            // Buscar dados completos do cliente
            const clienteCompleto = await buscarCliente(patient.id);
            
            // Mapear núcleo familiar dos cuidadores
            const nucleoFamiliar = mapearNucleoFamiliar(clienteCompleto);

            // Buscar terapias prévias da anamnese se existir
            const terapiasPrevias = await buscarAnamneseDoCliente(
                patient.id, 
                clienteCompleto.nome || patient.name
            );
            
            setFormData(prev => ({
                ...prev,
                clienteId: clienteCompleto.id || patient.id,
                clienteNome: clienteCompleto.nome || patient.name,
                dataNascimento: clienteCompleto.dataNascimento || patient.birthDate || '',
                idade: calcularIdade(clienteCompleto.dataNascimento || patient.birthDate || ''),
                enderecoCompleto: formatarEndereco(clienteCompleto),
                telefoneResidencial: '',
                celular: clienteCompleto.cuidadores?.[0]?.telefone || '',
                email: clienteCompleto.emailContato || clienteCompleto.cuidadores?.[0]?.email || '',
                nucleoFamiliar,
                terapiasPrevias,
                // Pegar escola se existir
                instituicaoFormacao: clienteCompleto.dadosEscola?.nome || '',
            }));
            
            setHasChanges(true);
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            // Usar dados básicos do patient
            setFormData(prev => ({
                ...prev,
                clienteId: patient.id,
                clienteNome: patient.name,
                dataNascimento: patient.birthDate || '',
                idade: patient.age ? `${patient.age} anos` : '',
                nucleoFamiliar: [],
                terapiasPrevias: [],
            }));
            setHasChanges(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handler genérico para campos do formulário
    const handleFieldChange = useCallback((field: keyof ProntuarioFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    }, []);

    // Handler para adicionar membro ao núcleo familiar
    const handleAddMembroFamiliar = useCallback((membro: MembroNucleoFamiliar) => {
        setFormData(prev => ({
            ...prev,
            nucleoFamiliar: [...prev.nucleoFamiliar, membro],
        }));
        setHasChanges(true);
    }, []);

    // Handler para remover membro do núcleo familiar
    const handleRemoveMembroFamiliar = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            nucleoFamiliar: prev.nucleoFamiliar.filter(m => m.id !== id),
        }));
        setHasChanges(true);
    }, []);

    // Salvar prontuário
    const handleSave = useCallback(async (prontuarioId?: string) => {
        setIsSaving(true);
        
        try {
            const response = prontuarioId 
                ? await atualizarProntuario(prontuarioId, formData)
                : await criarProntuario(formData);
            
            if (response.success) {
                toast.success(response.message);
                setHasChanges(false);
                return response.data;
            } else {
                toast.error(response.message);
                return null;
            }
        } catch (error) {
            console.error('Erro ao salvar prontuário:', error);
            toast.error('Erro ao salvar prontuário');
            return null;
        } finally {
            setIsSaving(false);
        }
    }, [formData]);

    // Reset do formulário
    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setHasChanges(false);
        setProntuarioExistente(false);
    }, []);

    return {
        formData,
        setFormData,
        isLoading,
        isSaving,
        hasChanges,
        prontuarioExistente,
        isEditMode,
        handleClienteSelect,
        handleFieldChange,
        handleAddMembroFamiliar,
        handleRemoveMembroFamiliar,
        handleSave,
        resetForm,
    };
}

// ============================================
// HOOK: useEvolucaoForm
// ============================================

const initialEvolucaoData: EvolucaoFormData = {
    prontuarioId: '',
    dataEvolucao: new Date().toISOString().split('T')[0],
    descricaoSessao: '',
    arquivos: [],
};

export function useEvolucaoForm(prontuarioId: string) {
    const [formData, setFormData] = useState<EvolucaoFormData>({
        ...initialEvolucaoData,
        prontuarioId,
    });
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Handler para campos do formulário
    const handleFieldChange = useCallback((field: keyof EvolucaoFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    }, []);

    // Handler para adicionar arquivo
    const handleAddArquivo = useCallback((arquivo: ArquivoEvolucao) => {
        setFormData(prev => ({
            ...prev,
            arquivos: [...prev.arquivos, arquivo],
        }));
        setHasChanges(true);
    }, []);

    // Handler para remover arquivo
    const handleRemoveArquivo = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            arquivos: prev.arquivos.map(a => 
                a.id === id ? { ...a, removed: true } : a
            ),
        }));
        setHasChanges(true);
    }, []);

    // Salvar evolução
    const handleSave = useCallback(async () => {
        setIsSaving(true);
        
        try {
            const response = await criarEvolucao(formData);
            
            if (response.success) {
                toast.success(response.message);
                setHasChanges(false);
                // Reset para nova evolução
                setFormData({
                    ...initialEvolucaoData,
                    prontuarioId,
                    dataEvolucao: new Date().toISOString().split('T')[0],
                });
                return response.data;
            } else {
                toast.error(response.message);
                return null;
            }
        } catch (error) {
            console.error('Erro ao salvar evolução:', error);
            toast.error('Erro ao registrar evolução');
            return null;
        } finally {
            setIsSaving(false);
        }
    }, [formData, prontuarioId]);

    // Reset do formulário
    const resetForm = useCallback(() => {
        setFormData({
            ...initialEvolucaoData,
            prontuarioId,
            dataEvolucao: new Date().toISOString().split('T')[0],
        });
        setHasChanges(false);
    }, [prontuarioId]);

    return {
        formData,
        setFormData,
        isSaving,
        hasChanges,
        handleFieldChange,
        handleAddArquivo,
        handleRemoveArquivo,
        handleSave,
        resetForm,
    };
}
