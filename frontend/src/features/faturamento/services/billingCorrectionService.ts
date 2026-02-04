/**
 * ============================================================================
 * SERVICE: Correção de Faturamento
 * ============================================================================
 * 
 * Service para gerenciar correções e reenvio de lançamentos de faturamento.
 * 
 * ENDPOINTS (a serem implementados no backend):
 * - GET /api/faturamentos/lancamentos/:id - Buscar lançamento específico
 * - PUT /api/faturamentos/lancamentos/:id/corrigir - Corrigir e reenviar
 * 
 * ============================================================================
 */

import { authFetch } from '@/lib/http';
import type { 
    BillingLancamento, 
    CorrectBillingPayload, 
    CorrectBillingResponse 
} from '../types/billingCorrection';
import type { DadosFaturamentoSessao } from '@/features/programas/core/types/billing';

/**
 * Busca um lançamento de faturamento específico
 * 
 * @param lancamentoId - ID do lançamento [ignorar]
 * @returns Dados do lançamento
 */
export async function fetchBillingLancamento(lancamentoId: string): Promise<BillingLancamento> {
    const response = await authFetch(`/api/faturamentos/lancamentos/${lancamentoId}`, {
        method: 'GET',
    });
    
    if (!response.ok) {
        throw new Error('Erro ao buscar lançamento');
    }
    
    return await response.json();
}

/**
 * Corrige e reenvia um lançamento de faturamento
 * 
 * @param payload - Dados da correção
 * @returns Resposta da correção
 */
export async function correctBillingLancamento(
    payload: CorrectBillingPayload
): Promise<CorrectBillingResponse> {
    // Preparar FormData se houver arquivos
    const formData = new FormData();
    
    // Adicionar dados de faturamento (sem arquivos)
    const { arquivosFaturamento, ...billingData } = payload.faturamento;
    
    const data = {
        faturamento: billingData,
        comentario: payload.comentario || null,
    };
    
    formData.append('data', JSON.stringify(data));
    
    // Adicionar arquivos novos (se houver)
    if (arquivosFaturamento && arquivosFaturamento.length > 0) {
        const newFiles: File[] = [];
        const existingFiles: any[] = [];
        
        arquivosFaturamento.forEach((arquivo) => {
            // Se tem 'file', é um arquivo novo
            if ('file' in arquivo && arquivo.file instanceof File) {
                newFiles.push(arquivo.file);
            } else {
                // Arquivo existente (já no servidor)
                existingFiles.push({
                    id: arquivo.id,
                    nome: arquivo.nome,
                    tipo: arquivo.tipo,
                    tamanho: arquivo.tamanho,
                });
            }
        });
        
        // Adicionar novos arquivos ao FormData
        newFiles.forEach((file) => {
            formData.append('billingFiles', file);
        });
        
        // Adicionar informação sobre arquivos existentes
        if (existingFiles.length > 0) {
            formData.append('existingFiles', JSON.stringify(existingFiles));
        }
    }
    
    const response = await authFetch(
        `/api/faturamentos/lancamentos/${payload.lancamentoId}/corrigir`,
        {
            method: 'PUT',
            body: formData,
        }
    );
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao corrigir faturamento');
    }
    
    return await response.json();
}

/**
 * Converte lançamento para formato de faturamento
 * 
 * @param lancamento - Lançamento a converter
 * @returns Dados de faturamento
 */
export function lancamentoToBillingData(lancamento: BillingLancamento): DadosFaturamentoSessao {
    // Se já tem faturamento completo, retornar diretamente
    if (lancamento.faturamento) {
        return {
            ...lancamento.faturamento,
            // Garantir que observação e arquivos existam (mesmo que vazios)
            observacaoFaturamento: lancamento.faturamento.observacaoFaturamento ?? '',
            arquivosFaturamento: lancamento.faturamento.arquivosFaturamento ?? [],
        };
    }
    
    // Extrair horários do campo horario (formato: "HH:mm - HH:mm")
    const [horarioInicio = '', horarioFim = ''] = lancamento.horario.split(' - ');
    
    // Mapear tipo
    const tipoAtendimento = lancamento.tipo.toLowerCase() === 'homecare' 
        ? 'homecare' as const
        : 'consultorio' as const;
    
    return {
        dataSessao: lancamento.data,
        horarioInicio: horarioInicio.trim(),
        horarioFim: horarioFim.trim(),
        tipoAtendimento,
        ajudaCusto: tipoAtendimento === 'homecare' ? false : null,
        observacaoFaturamento: '',
        arquivosFaturamento: [],
    };
}
