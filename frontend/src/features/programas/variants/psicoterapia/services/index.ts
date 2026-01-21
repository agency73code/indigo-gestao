/**
 * Service Principal para Prontuário Psicológico
 * 
 * Este arquivo re-exporta as funções do service correto baseado na config.
 * - Mock: mocks/psicoterapia.mock.ts (desenvolvimento)
 * - Real: psicoterapia.service.ts (produção)
 * 
 * PARA DESABILITAR MOCK CRUD:
 * Defina VITE_USE_MOCK_PSICOTERAPIA=false no .env
 * 
 * PARA HABILITAR MOCK IA:
 * Defina VITE_USE_MOCK_PSICOTERAPIA_IA=true no .env
 */

import { authFetch } from '@/lib/http';
import { listarClientes as listarClientesApi, listarTerapeutas as listarTerapeutasApi, buscarClientePorId } from '@/lib/api';
import type { Patient, Therapist } from '@/features/consultas/types/consultas.types';
import type { Cliente } from '@/features/cadastros/types/cadastros.types';
import type { 
    MembroNucleoFamiliar,
    TerapiaPrevia,
} from '../types';

// Configuração centralizada
import { psicoterapiaServiceConfig } from './psicoterapia.config';

// ============================================
// IMPORTAÇÃO CONDICIONAL: MOCK vs API REAL
// ============================================

// Importa o service correto baseado na config
import * as realService from './psicoterapia.service';
import * as mockService from './mocks/psicoterapia.mock';

const service = psicoterapiaServiceConfig.useMockCrud ? mockService : realService;

// ============================================
// RE-EXPORT: FUNÇÕES DE PRONTUÁRIO E EVOLUÇÃO
// ============================================

export const listarProntuarios = service.listarProntuarios;
export const buscarProntuario = service.buscarProntuario;
export const buscarProntuarioPorCliente = service.buscarProntuarioPorCliente;
export const criarProntuario = service.criarProntuario;
export const atualizarProntuario = service.atualizarProntuario;
export const criarEvolucao = service.criarEvolucao;
export const listarEvolucoes = service.listarEvolucoes;
export const buscarEvolucao = service.buscarEvolucao;
export const verificarProntuarioExistente = service.verificarProntuarioExistente;
export const atualizarEvolucao = service.atualizarEvolucao;
export const deletarEvolucao = service.deletarEvolucao;

// Re-export validação de arquivos
export { validateFile, MAX_FILE_SIZE, ALLOWED_FILE_TYPES, ALLOWED_EXTENSIONS } from './psicoterapia.api-contract';

// ============================================
// TIPOS AUXILIARES
// ============================================

export type ClienteResumido = Patient;
export type TerapeutaResumido = Therapist;
export type ClienteCompleto = Cliente;

// ============================================
// FUNÇÕES DE CLIENTES E TERAPEUTAS
// ============================================

/**
 * Buscar lista de clientes para o select
 */
export async function listarClientes(): Promise<ClienteResumido[]> {
    const result = await listarClientesApi();
    return result.items;
}

/**
 * Buscar cliente completo por ID (com cuidadores, endereço, etc)
 */
export async function buscarCliente(id: string): Promise<ClienteCompleto> {
    return buscarClientePorId(id);
}

/**
 * Buscar lista de terapeutas para o select
 */
export async function listarTerapeutas(): Promise<TerapeutaResumido[]> {
    const result = await listarTerapeutasApi();
    return result.items;
}

/**
 * Buscar anamnese do cliente para obter terapias prévias
 * Usa a listagem de anamneses filtrando pelo nome do cliente
 */
export async function buscarAnamneseDoCliente(clienteId: string, clienteNome: string): Promise<TerapiaPrevia[]> {
    try {
        // Buscar anamneses que contém o nome do cliente
        const res = await authFetch(`/api/anamneses?q=${encodeURIComponent(clienteNome)}&pageSize=50`, { 
            method: 'GET' 
        });
        
        if (!res.ok) return [];
        
        const text = await res.text();
        const data = text ? JSON.parse(text) : null;
        
        if (!data?.items || data.items.length === 0) return [];
        
        // Encontrar a anamnese deste cliente
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const anamneseDoCliente = data.items.find((a: any) => a.clienteId === clienteId);
        
        if (!anamneseDoCliente) return [];
        
        // Buscar detalhes completos da anamnese
        const resDetalhe = await authFetch(`/api/anamneses/${anamneseDoCliente.id}`, { 
            method: 'GET' 
        });
        
        if (!resDetalhe.ok) return [];
        
        const textDetalhe = await resDetalhe.text();
        const anamnese = textDetalhe ? JSON.parse(textDetalhe) : null;
        
        // Extrair terapias prévias
        const terapiasPrevias = anamnese?.normalized?.queixaDiagnostico?.terapiasPrevias 
            || anamnese?.queixaDiagnostico?.terapiasPrevias 
            || [];
        
        // Mapear para o formato do prontuário
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return terapiasPrevias.map((t: any) => ({
            id: t.id || String(Date.now()) + '-' + Math.random().toString(36).substr(2, 9),
            profissional: t.profissional || '',
            especialidadeAbordagem: t.especialidadeAbordagem || '',
            tempoIntervencao: t.tempoIntervencao || '',
            observacao: t.observacao || '',
            ativo: t.ativo ?? true,
            origemAnamnese: true,
        }));
    } catch (error) {
        console.error('Erro ao buscar anamnese do cliente:', error);
        return [];
    }
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcular idade a partir da data de nascimento
 */
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

/**
 * Formatar data para exibição (DD/MM/YYYY)
 */
export function formatarData(dataISO: string): string {
    if (!dataISO) return '';
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR');
}

/**
 * Formatar endereço completo do cliente
 * O backend retorna estrutura aninhada: enderecos[0].endereco.rua
 * Mas o tipo espera estrutura flat: enderecos[0].logradouro
 * Esta função lida com ambos os casos
 */
export function formatarEndereco(cliente: ClienteCompleto): string {
    const enderecoItem = cliente.enderecos?.[0];
    if (!enderecoItem) return '';
    
    // Tentar pegar da estrutura aninhada (como vem do backend)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enderecoAninhado = (enderecoItem as any)?.endereco;
    
    // Extrair campos - primeiro tenta da estrutura aninhada, depois da flat
    const logradouro = enderecoAninhado?.rua || enderecoAninhado?.logradouro || enderecoItem.logradouro;
    const numero = enderecoAninhado?.numero || enderecoItem.numero;
    const complemento = enderecoAninhado?.complemento || enderecoItem.complemento;
    const bairro = enderecoAninhado?.bairro || enderecoItem.bairro;
    const cidade = enderecoAninhado?.cidade || enderecoItem.cidade;
    const uf = enderecoAninhado?.uf || enderecoItem.uf;
    
    if (!logradouro && !numero && !bairro && !cidade) {
        return '';
    }
    
    const partes: string[] = [];
    
    // Logradouro + número
    if (logradouro) {
        partes.push(numero ? `${logradouro}, ${numero}` : logradouro);
    }
    
    // Complemento
    if (complemento) {
        partes.push(complemento);
    }
    
    // Bairro
    if (bairro) {
        partes.push(bairro);
    }
    
    // Cidade - UF
    if (cidade && uf) {
        partes.push(`${cidade} - ${uf}`);
    } else if (cidade) {
        partes.push(cidade);
    } else if (uf) {
        partes.push(uf);
    }
    
    return partes.join(', ');
}

/**
 * Mapear cuidadores do cliente para núcleo familiar
 */
export function mapearNucleoFamiliar(cliente: ClienteCompleto): MembroNucleoFamiliar[] {
    if (!cliente.cuidadores) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return cliente.cuidadores.map((c: any) => ({
        id: String(c.id || ''),
        nome: c.nome || '',
        parentesco: c.relacao || c.descricaoRelacao || '',
        idade: c.dataNascimento ? calcularIdade(c.dataNascimento) : undefined,
        ocupacao: c.profissao || '',
    }));
}

// ============================================
// RE-EXPORTS
// ============================================

export { psicoterapiaServiceConfig } from './psicoterapia.config';
export * from './ai.service';
