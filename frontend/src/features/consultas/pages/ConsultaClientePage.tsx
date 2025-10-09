import { useParams } from 'react-router-dom';
import { useCliente } from '../hooks/useCliente';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import ReadOnlyField from '../components/ReadOnlyField';
import DocumentsTable from '../arquivos/components/DocumentsTable';

export default function ConsultaClientePage() {
    const { clienteId } = useParams<{ clienteId: string }>();
    const clienteData = useCliente(clienteId, Boolean(clienteId));

    if (!clienteId) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">ID do cliente não fornecido</p>
            </div>
        );
    }

    if (!clienteData) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full w-full px-1 py-4 md:p-4 sm:p-4 lg:p-8 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1
                    className="text-2xl font-semibold text-primary"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                >
                    Consulta do Cliente
                </h1>
                <p className="text-sm text-muted-foreground">
                    Detalhes e documentos do cliente {clienteData.nome}
                </p>
            </div>

            {/* Dados Pessoais */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField label="Nome" value={clienteData.nome || ''} />
                        <ReadOnlyField label="Email" value={clienteData.emailContato || ''} />
                        <ReadOnlyField label="CPF" value={clienteData.cpf || ''} />
                        <ReadOnlyField
                            label="Data de Nascimento"
                            value={
                                clienteData.dataNascimento
                                    ? new Date(clienteData.dataNascimento).toLocaleDateString(
                                          'pt-BR',
                                      )
                                    : ''
                            }
                        />
                        <ReadOnlyField
                            label="Data de Entrada"
                            value={
                                clienteData.dataEntrada
                                    ? new Date(clienteData.dataEntrada).toLocaleDateString('pt-BR')
                                    : ''
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
                <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                    {clienteData.enderecos && clienteData.enderecos.length > 0 ? (
                        <div className="space-y-6">
                            {clienteData.enderecos.map((enderecoItem, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {index > 0 && <div className="col-span-full border-t pt-4" />}
                                    <ReadOnlyField label="CEP" value={enderecoItem.cep || ''} />
                                    <ReadOnlyField
                                        label="Logradouro"
                                        value={enderecoItem.logradouro || ''}
                                    />
                                    <ReadOnlyField
                                        label="Número"
                                        value={enderecoItem.numero || ''}
                                    />
                                    <ReadOnlyField
                                        label="Complemento"
                                        value={enderecoItem.complemento || ''}
                                    />
                                    <ReadOnlyField
                                        label="Bairro"
                                        value={enderecoItem.bairro || ''}
                                    />
                                    <ReadOnlyField
                                        label="Cidade"
                                        value={enderecoItem.cidade || ''}
                                    />
                                    <ReadOnlyField label="UF" value={enderecoItem.uf || ''} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Nenhum endereço cadastrado</p>
                    )}
                </CardContent>
            </Card>

            {/* Arquivos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Arquivos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DocumentsTable ownerType="cliente" ownerId={clienteId} />
                </CardContent>
            </Card>
        </div>
    );
}
