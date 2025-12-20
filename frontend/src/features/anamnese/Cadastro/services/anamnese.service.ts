import { listarClientes as listarClientesApi, listarTerapeutas as listarTerapeutasApi, buscarClientePorId } from '@/lib/api';
import type { Patient } from '@/features/consultas/types/consultas.types';
import type { Therapist } from '@/features/consultas/types/consultas.types';
import type { Cliente } from '@/features/cadastros/types/cadastros.types';

export type ClienteResumido = Patient;
export type TerapeutaResumido = Therapist;
export type ClienteCompleto = Cliente;

// Buscar lista de clientes para o select
export async function listarClientes(): Promise<ClienteResumido[]> {
    return listarClientesApi();
}

// Buscar cliente completo por ID (com cuidadores)
export async function buscarCliente(id: string): Promise<ClienteCompleto> {
    return buscarClientePorId(id);
}

// Buscar lista de terapeutas para o select
export async function listarTerapeutas(): Promise<TerapeutaResumido[]> {
    return listarTerapeutasApi();
}

// Calcular idade a partir da data de nascimento
export function calcularIdade(dataNascimento: string): string {
    if (!dataNascimento) return '';
    
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    
    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();
    
    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
        anos--;
        meses += 12;
    }
    
    if (hoje.getDate() < nascimento.getDate()) {
        meses--;
        if (meses < 0) meses = 11;
    }
    
    if (anos === 0) {
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
    
    if (meses === 0) {
        return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
    
    return `${anos} ${anos === 1 ? 'ano' : 'anos'} e ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
}

// Formatar data para exibição (DD/MM/YYYY)
export function formatarData(dataISO: string): string {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

// ============================================
// Funções de CRUD para Anamnese
// Preparadas para integração futura com backend
// ============================================

import type { Anamnese } from '../types/anamnese.types';

// Base URL para API - será configurada quando backend estiver pronto
// const API_BASE_URL = '/api';

/**
 * Cria uma nova anamnese
 * @param data Dados da anamnese
 * @returns Promise com a anamnese criada
 */
export async function criarAnamnese(data: Anamnese): Promise<Anamnese> {
    // TODO: Implementar chamada para API
    // const response = await fetch(`${API_BASE_URL}/anamneses`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    // });
    // return response.json();
    
    console.log('Anamnese a ser criada:', data);
    return Promise.resolve(data);
}

/**
 * Atualiza uma anamnese existente
 * @param id ID da anamnese
 * @param data Dados atualizados
 * @returns Promise com a anamnese atualizada
 */
export async function atualizarAnamnese(id: string, data: Partial<Anamnese>): Promise<Anamnese> {
    // TODO: Implementar chamada para API
    // const response = await fetch(`${API_BASE_URL}/anamneses/${id}`, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    // });
    // return response.json();
    
    console.log('Anamnese a ser atualizada:', id, data);
    return Promise.resolve({ ...data } as Anamnese);
}

/**
 * Busca uma anamnese por ID
 * @param id ID da anamnese
 * @returns Promise com a anamnese encontrada
 */
export async function buscarAnamnese(id: string): Promise<Anamnese | null> {
    // TODO: Implementar chamada para API
    // const response = await fetch(`${API_BASE_URL}/anamneses/${id}`);
    // if (!response.ok) return null;
    // return response.json();
    
    console.log('Buscando anamnese:', id);
    return Promise.resolve(null);
}

/**
 * Busca anamneses por cliente
 * @param clienteId ID do cliente
 * @returns Promise com lista de anamneses do cliente
 */
export async function buscarAnamnesesPorCliente(clienteId: string): Promise<Anamnese[]> {
    // TODO: Implementar chamada para API
    // const response = await fetch(`${API_BASE_URL}/anamneses?clienteId=${clienteId}`);
    // return response.json();
    
    console.log('Buscando anamneses do cliente:', clienteId);
    return Promise.resolve([]);
}

/**
 * Lista todas as anamneses com paginação
 * @param page Número da página
 * @param limit Limite por página
 * @returns Promise com lista paginada de anamneses
 */
export async function listarAnamneses(page = 1, limit = 10): Promise<{ data: Anamnese[]; total: number }> {
    // TODO: Implementar chamada para API
    // const response = await fetch(`${API_BASE_URL}/anamneses?page=${page}&limit=${limit}`);
    // return response.json();
    
    console.log('Listando anamneses:', { page, limit });
    return Promise.resolve({ data: [], total: 0 });
}

/**
 * Exclui uma anamnese
 * @param id ID da anamnese
 * @returns Promise<void>
 */
export async function excluirAnamnese(id: string): Promise<void> {
    // TODO: Implementar chamada para API
    // await fetch(`${API_BASE_URL}/anamneses/${id}`, {
    //     method: 'DELETE',
    // });
    
    console.log('Excluindo anamnese:', id);
    return Promise.resolve();
}

/**
 * Prepara os dados da anamnese para envio ao backend
 * Transforma o formato do frontend para o formato esperado pelo backend
 * @param data Dados do formulário
 * @returns Dados formatados para o backend
 */
export function prepararAnamneseParaBackend(data: Anamnese): Record<string, unknown> {
    // Aqui podemos fazer transformações necessárias
    // Por exemplo, converter datas, IDs, etc.
    return {
        ...data,
        // Campos adicionais que podem ser necessários
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Transforma dados do backend para o formato do frontend
 * @param backendData Dados vindos da API
 * @returns Dados no formato do frontend
 */
export function parseAnamneseDoBackend(backendData: Record<string, unknown>): Anamnese {
    // Aqui podemos fazer transformações inversas
    return backendData as unknown as Anamnese;
}

