import MockControl from '../arquivos/components/MockControl';
import DebugMock from '../arquivos/components/DebugMock';

// Página temporária para teste do sistema de documentos
// Esta página pode ser removida após os testes
export default function TestDocumentsPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Teste - Sistema de Documentos</h1>
                <p className="text-muted-foreground mt-2">
                    Página temporária para testar a funcionalidade de documentos com dados mockados.
                </p>
            </div>

            <div className="mb-6">
                <DebugMock />
            </div>

            <MockControl />
        </div>
    );
}
