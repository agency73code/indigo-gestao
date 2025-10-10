import { useEffect, useState } from 'react';
import { listFiles } from '../../service/consultas.service';

// Componente de debug para testar o mock diretamente
export default function DebugMock() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const testMock = async (ownerType: 'cliente' | 'terapeuta', ownerId: string) => {
        setLoading(true);
        setResult(null);

        try {
            console.log(`🔍 Testando mock: ${ownerType} - ${ownerId}`);
            const data = await listFiles({ ownerType, ownerId });
            console.log(`✅ Resultado:`, data);
            setResult({ success: true, data, count: data.length });
        } catch (error) {
            console.error(`❌ Erro:`, error);
            const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
            setResult({ success: false, error: errorMessage });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Teste automático ao carregar
        testMock('terapeuta', 'qualquer-id');
    }, []);

    return (
        <div className="p-4 border rounded-lg bg-yellow-50">
            <h3 className="font-bold mb-4">🧪 Debug Mock</h3>

            <div className="space-y-2 mb-4">
                <button
                    className="px-3 py-1 bg-blue-500 text-white rounded mr-2"
                    onClick={() => testMock('cliente', '1')}
                    disabled={loading}
                >
                    Cliente ID 1
                </button>
                <button
                    className="px-3 py-1 bg-green-500 text-white rounded mr-2"
                    onClick={() => testMock('terapeuta', '1')}
                    disabled={loading}
                >
                    Terapeuta ID 1
                </button>
                <button
                    className="px-3 py-1 bg-purple-500 text-white rounded mr-2"
                    onClick={() => testMock('terapeuta', 'id-inexistente')}
                    disabled={loading}
                >
                    ID Inexistente (deve usar default)
                </button>
            </div>

            {loading && <div>⏳ Carregando...</div>}

            {result && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                    <strong>Resultado:</strong>
                    <pre className="text-sm mt-2 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}

            <div className="mt-4 text-sm text-gray-600">
                <strong>Instruções:</strong> Abra o DevTools (F12) para ver os logs detalhados do
                mock.
            </div>
        </div>
    );
}
