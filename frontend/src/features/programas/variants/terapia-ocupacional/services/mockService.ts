import { mockToProgram } from '../mocks/programMock';

/**
 * Serviço mock para buscar programa de TO
 * Use este serviço temporariamente até o backend de TO estar pronto
 */
export async function fetchToProgramById(id: string): Promise<typeof mockToProgram> {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('🎭 Usando MOCK de programa TO para id:', id);
    
    // Retornar o programa mockado
    return mockToProgram;
}

/**
 * Para usar o mock:
 * 
 * 1. Na página de detalhes/edição de TO, importe este serviço
 * 2. Use fetchToProgramById em vez do serviço real
 * 3. Você poderá visualizar e editar o programa mockado
 * 4. Quando o backend estiver pronto, remova o mock e use o serviço real
 */
