import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Settings } from 'lucide-react';
import DocumentsTable from './DocumentsTable';

// Este componente é apenas para desenvolvimento/teste
export default function MockControl() {
    const [selectedOwnerType, setSelectedOwnerType] = useState<'cliente' | 'terapeuta'>('cliente');
    const [selectedOwnerId, setSelectedOwnerId] = useState('1');

    const ownerOptions = {
        cliente: [
            { id: '1', name: 'João Silva Santos' },
            { id: '2', name: 'Maria Oliveira' },
        ],
        terapeuta: [
            { id: '1', name: 'Dr. Ana Paula Silva' },
            { id: '2', name: 'Dr. Carlos Santos' },
        ],
    };

    return (
        <div className="space-y-6 p-6">
            {/* Cabeçalho com status do mock */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Controle de Mock - Documentos
                        <Badge variant="secondary">MOCK ATIVO</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                        Este painel permite testar a funcionalidade de documentos com dados
                        mockados. Para desabilitar o mock, altere <code>MOCK_ENABLED = false</code>{' '}
                        em <code>documents.mock.ts</code>
                    </div>

                    {/* Controles de seleção */}
                    <div className="flex gap-4 mb-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tipo:</label>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant={
                                        selectedOwnerType === 'cliente' ? 'default' : 'outline'
                                    }
                                    onClick={() => setSelectedOwnerType('cliente')}
                                >
                                    Cliente
                                </Button>
                                <Button
                                    size="sm"
                                    variant={
                                        selectedOwnerType === 'terapeuta' ? 'default' : 'outline'
                                    }
                                    onClick={() => setSelectedOwnerType('terapeuta')}
                                >
                                    Terapeuta
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Pessoa:</label>
                            <div className="flex gap-2">
                                {ownerOptions[selectedOwnerType].map((option) => (
                                    <Button
                                        key={option.id}
                                        size="sm"
                                        variant={
                                            selectedOwnerId === option.id ? 'default' : 'outline'
                                        }
                                        onClick={() => setSelectedOwnerId(option.id)}
                                    >
                                        {option.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Informações do teste */}
                    <div className="bg-muted p-3 rounded-md text-sm">
                        <strong>Testando:</strong> {selectedOwnerType} ID "{selectedOwnerId}" (
                        {
                            ownerOptions[selectedOwnerType].find((o) => o.id === selectedOwnerId)
                                ?.name
                        }
                        )
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de documentos */}
            <Card>
                <CardHeader>
                    <CardTitle>Documentos Mockados</CardTitle>
                </CardHeader>
                <CardContent>
                    <DocumentsTable ownerType={selectedOwnerType} ownerId={selectedOwnerId} />
                </CardContent>
            </Card>

            {/* Instruções */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Como Testar
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">
                                1
                            </Badge>
                            <div>
                                <strong>Visualizar:</strong> Clique no botão "Visualizar" para abrir
                                o documento em uma nova aba. No mock, abrirá uma imagem placeholder.
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">
                                2
                            </Badge>
                            <div>
                                <strong>Baixar:</strong> Clique no botão "Baixar" para simular o
                                download. No mock, redirecionará para a mesma imagem placeholder.
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">
                                3
                            </Badge>
                            <div>
                                <strong>Console:</strong> Abra o DevTools (F12) para ver os logs do
                                mock com detalhes das operações.
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-0.5">
                                4
                            </Badge>
                            <div>
                                <strong>API Real:</strong> Para testar com a API real, altere
                                <code className="bg-muted px-1 rounded">
                                    MOCK_ENABLED = false
                                </code>{' '}
                                no arquivo
                                <code className="bg-muted px-1 rounded">documents.mock.ts</code>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
