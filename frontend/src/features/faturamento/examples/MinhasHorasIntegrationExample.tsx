/**
 * ============================================================================
 * EXEMPLO DE INTEGRAÇÃO: Correção de Faturamento
 * ============================================================================
 * 
 * Este arquivo demonstra como integrar o drawer de correção de faturamento
 * na página de "Minhas Horas".
 * 
 * INSTRUÇÕES:
 * 1. Importar o hook e componente necessários
 * 2. Adicionar o hook no componente da página
 * 3. Adicionar o drawer no JSX
 * 4. Chamar openCorrection() no botão "Corrigir e reenviar"
 * 
 * ============================================================================
 */

import { useState } from 'react';
import { useBillingCorrection, CorrectBillingDrawer } from '@/features/faturamento';
import type { BillingLancamento } from '@/features/faturamento/types/billingCorrection';

/**
 * Exemplo de componente de página de Minhas Horas
 */
export function MinhasHorasPageExample() {
    // Dados mock (em produção virão da API)
    const [lancamentos, setLancamentos] = useState<BillingLancamento[]>([
        {
            id: '1',
            clienteId: 'cli-001',
            clienteNome: 'Miguel Oliveira',
            terapeutaId: 'ter-001',
            tipo: 'homecare',
            data: '2026-01-28',
            horario: '02:30 - 04:00',
            duracao: '1h 30min',
            valor: 200,
            status: 'rejeitado',
            motivoRejeicao: 'Horário não confere com a agenda do cliente',
            faturamento: {
                dataSessao: '2026-01-28',
                horarioInicio: '02:30',
                horarioFim: '04:00',
                tipoAtendimento: 'homecare',
                ajudaCusto: true,
                observacaoFaturamento: 'Pecisei pagar impressao de R$ 15,00',
                arquivosFaturamento: [
                    {
                        id: 'arq-1',
                        nome: 'Screenshot 2026-01-23 at 12.49.21.png',
                        tipo: 'image/png',
                        tamanho: 459500,
                        url: '#'
                    }
                ]
            }
        }
    ]);

    // Hook de correção
    const {
        isOpen,
        lancamento,
        isSaving,
        openCorrection,
        closeCorrection,
        saveCorrection,
        getBillingData,
    } = useBillingCorrection();

    // Handler para abrir correção
    const handleOpenCorrection = (lancamento: BillingLancamento) => {
        openCorrection(lancamento);
    };

    // Handler para salvar correção
    const handleSaveCorrection = async (
        lancamentoId: string, 
        dadosCorrigidos: any, 
        comentario?: string
    ) => {
        await saveCorrection(lancamentoId, dadosCorrigidos, comentario);
        
        // Atualizar lista após correção (opcional - ou refetch da API)
        setLancamentos(prev => 
            prev.map(l => 
                l.id === lancamentoId 
                    ? { ...l, status: 'pendente' as const, faturamento: dadosCorrigidos }
                    : l
            )
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Minhas Horas</h1>

            {/* Lista de lançamentos */}
            <div className="space-y-4">
                {lancamentos.map((lancamento) => (
                    <div 
                        key={lancamento.id}
                        className="border rounded-lg p-4 flex items-center justify-between"
                    >
                        <div>
                            <p className="font-medium">{lancamento.clienteNome}</p>
                            <p className="text-sm text-muted-foreground">
                                {lancamento.data} • {lancamento.horario}
                            </p>
                            {lancamento.status === 'rejeitado' && (
                                <p className="text-sm text-destructive mt-1">
                                    {lancamento.motivoRejeicao}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`
                                px-3 py-1 rounded-full text-sm
                                ${lancamento.status === 'aprovado' ? 'bg-green-100 text-green-700' : ''}
                                ${lancamento.status === 'rejeitado' ? 'bg-red-100 text-red-700' : ''}
                                ${lancamento.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' : ''}
                            `}>
                                {lancamento.status}
                            </span>

                            {lancamento.status === 'rejeitado' && (
                                <button
                                    onClick={() => handleOpenCorrection(lancamento)}
                                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                                >
                                    Corrigir e reenviar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Drawer de correção */}
            <CorrectBillingDrawer
                isOpen={isOpen}
                onClose={closeCorrection}
                lancamento={lancamento}
                initialBillingData={lancamento ? getBillingData(lancamento) : null}
                onSave={handleSaveCorrection}
                isSaving={isSaving}
            />
        </div>
    );
}

/**
 * ============================================================================
 * RESUMO DA INTEGRAÇÃO
 * ============================================================================
 * 
 * 1. IMPORTS:
 *    ```typescript
 *    import { useBillingCorrection, CorrectBillingDrawer } from '@/features/faturamento';
 *    import type { BillingLancamento } from '@/features/faturamento/types/billingCorrection';
 *    ```
 * 
 * 2. HOOK NO COMPONENTE:
 *    ```typescript
 *    const {
 *        isOpen,
 *        lancamento,
 *        isSaving,
 *        openCorrection,
 *        closeCorrection,
 *        saveCorrection,
 *        getBillingData,
 *    } = useBillingCorrection();
 *    ```
 * 
 * 3. BOTÃO DE AÇÃO:
 *    ```typescript
 *    <button onClick={() => openCorrection(lancamento)}>
 *        Corrigir e reenviar
 *    </button>
 *    ```
 * 
 * 4. DRAWER NO JSX:
 *    ```typescript
 *    <CorrectBillingDrawer
 *        isOpen={isOpen}
 *        onClose={closeCorrection}
 *        lancamento={lancamento}
 *        initialBillingData={lancamento ? getBillingData(lancamento) : null}
 *        onSave={saveCorrection}
 *        isSaving={isSaving}
 *    />
 *    ```
 * 
 * ============================================================================
 */
