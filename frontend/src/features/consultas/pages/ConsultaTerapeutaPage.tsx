import { useParams } from 'react-router-dom';
import { useTerapeuta } from '../hooks/useTerapeuta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import ReadOnlyField from '../components/ReadOnlyField';
import DocumentsTable from '../arquivos/components/DocumentsTable';

export default function ConsultaTerapeutaPage() {
    const { terapeutaId } = useParams<{ terapeutaId: string }>();
    const terapeutaData = useTerapeuta(terapeutaId, Boolean(terapeutaId));

    if (!terapeutaId) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">ID do terapeuta não fornecido</p>
            </div>
        );
    }

    if (!terapeutaData) {
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
                    Consulta do Terapeuta
                </h1>
                <p className="text-sm text-muted-foreground">
                    Detalhes e documentos do terapeuta {terapeutaData.nome}
                </p>
            </div>

            {/* Dados Pessoais */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField label="Nome" value={terapeutaData.nome || ''} />
                        <ReadOnlyField label="Email" value={terapeutaData.email || ''} />
                        <ReadOnlyField
                            label="Email Indigo"
                            value={terapeutaData.emailIndigo || ''}
                        />
                        <ReadOnlyField label="Telefone" value={terapeutaData.telefone || ''} />
                        <ReadOnlyField label="Celular" value={terapeutaData.celular || ''} />
                        <ReadOnlyField label="CPF" value={terapeutaData.cpf || ''} />
                        <ReadOnlyField
                            label="Data de Nascimento"
                            value={
                                terapeutaData.dataNascimento
                                    ? new Date(terapeutaData.dataNascimento).toLocaleDateString(
                                          'pt-BR',
                                      )
                                    : ''
                            }
                        />
                        <ReadOnlyField
                            label="Possui Veículo"
                            value={terapeutaData.possuiVeiculo === 'sim' ? 'Sim' : 'Não'}
                        />
                        {terapeutaData.possuiVeiculo === 'sim' && (
                            <>
                                <ReadOnlyField
                                    label="Placa do Veículo"
                                    value={terapeutaData.placaVeiculo || ''}
                                />
                                <ReadOnlyField
                                    label="Modelo do Veículo"
                                    value={terapeutaData.modeloVeiculo || ''}
                                />
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Endereço */}
            <Card>
                <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField label="CEP" value={terapeutaData.endereco?.cep || ''} />
                        <ReadOnlyField label="Rua" value={terapeutaData.endereco?.rua || ''} />
                        <ReadOnlyField
                            label="Número"
                            value={terapeutaData.endereco?.numero || ''}
                        />
                        <ReadOnlyField
                            label="Complemento"
                            value={terapeutaData.endereco?.complemento || ''}
                        />
                        <ReadOnlyField
                            label="Bairro"
                            value={terapeutaData.endereco?.bairro || ''}
                        />
                        <ReadOnlyField
                            label="Cidade"
                            value={terapeutaData.endereco?.cidade || ''}
                        />
                        <ReadOnlyField
                            label="Estado"
                            value={terapeutaData.endereco?.estado || ''}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Dados Profissionais */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Profissionais</CardTitle>
                </CardHeader>
                <CardContent>
                    {terapeutaData.dadosProfissionais &&
                    terapeutaData.dadosProfissionais.length > 0 ? (
                        <div className="space-y-6">
                            {terapeutaData.dadosProfissionais.map((dados, index) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {index > 0 && <div className="col-span-full border-t pt-4" />}
                                    <ReadOnlyField
                                        label="Área de Atuação"
                                        value={dados.areaAtuacao || ''}
                                    />
                                    <ReadOnlyField label="Cargo" value={dados.cargo || ''} />
                                    <ReadOnlyField
                                        label="Número do Conselho"
                                        value={dados.numeroConselho || ''}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground">Nenhum dado profissional cadastrado</p>
                    )}
                </CardContent>
            </Card>

            {/* Formação */}
            <Card>
                <CardHeader>
                    <CardTitle>Formação</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField
                            label="Graduação"
                            value={terapeutaData.formacao?.graduacao || ''}
                        />
                        <ReadOnlyField
                            label="Instituição de Graduação"
                            value={terapeutaData.formacao?.instituicaoGraduacao || ''}
                        />
                        <ReadOnlyField
                            label="Ano de Formatura"
                            value={terapeutaData.formacao?.anoFormatura || ''}
                        />
                    </div>

                    {terapeutaData.formacao?.posGraduacoes &&
                        terapeutaData.formacao.posGraduacoes.length > 0 && (
                            <div className="mt-6">
                                <h4 className="font-medium mb-4">Pós-graduações</h4>
                                <div className="space-y-4">
                                    {terapeutaData.formacao.posGraduacoes.map((pos, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg"
                                        >
                                            <ReadOnlyField
                                                label="Tipo"
                                                value={
                                                    pos.tipo === 'lato'
                                                        ? 'Lato Sensu'
                                                        : 'Stricto Sensu'
                                                }
                                            />
                                            <ReadOnlyField label="Curso" value={pos.curso || ''} />
                                            <ReadOnlyField
                                                label="Instituição"
                                                value={pos.instituicao || ''}
                                            />
                                            <ReadOnlyField
                                                label="Conclusão"
                                                value={pos.conclusao || ''}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </CardContent>
            </Card>

            {/* Dados Bancários */}
            <Card>
                <CardHeader>
                    <CardTitle>Dados Bancários</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReadOnlyField label="Banco" value={terapeutaData.banco || ''} />
                        <ReadOnlyField label="Agência" value={terapeutaData.agencia || ''} />
                        <ReadOnlyField label="Conta" value={terapeutaData.conta || ''} />
                        <ReadOnlyField label="Chave PIX" value={terapeutaData.chavePix || ''} />
                        <ReadOnlyField
                            label="Valor Hora Acordado"
                            value={
                                terapeutaData.valorHoraAcordado
                                    ? `R$ ${terapeutaData.valorHoraAcordado.toFixed(2)}`
                                    : ''
                            }
                        />
                    </div>
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
                    <DocumentsTable ownerType="terapeuta" ownerId={terapeutaId} />
                </CardContent>
            </Card>

            {/* CNPJ (se houver) */}
            {terapeutaData.cnpj && (
                <Card>
                    <CardHeader>
                        <CardTitle>Dados CNPJ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ReadOnlyField label="CNPJ" value={terapeutaData.cnpj.numero || ''} />
                            <ReadOnlyField
                                label="Razão Social"
                                value={terapeutaData.cnpj.razaoSocial || ''}
                            />
                            <ReadOnlyField
                                label="Nome Fantasia"
                                value={terapeutaData.cnpj.nomeFantasia || ''}
                            />
                        </div>

                        <div className="mt-6">
                            <h4 className="font-medium mb-4">Endereço CNPJ</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField
                                    label="CEP"
                                    value={terapeutaData.cnpj.endereco?.cep || ''}
                                />
                                <ReadOnlyField
                                    label="Rua"
                                    value={terapeutaData.cnpj.endereco?.rua || ''}
                                />
                                <ReadOnlyField
                                    label="Número"
                                    value={terapeutaData.cnpj.endereco?.numero || ''}
                                />
                                <ReadOnlyField
                                    label="Complemento"
                                    value={terapeutaData.cnpj.endereco?.complemento || ''}
                                />
                                <ReadOnlyField
                                    label="Bairro"
                                    value={terapeutaData.cnpj.endereco?.bairro || ''}
                                />
                                <ReadOnlyField
                                    label="Cidade"
                                    value={terapeutaData.cnpj.endereco?.cidade || ''}
                                />
                                <ReadOnlyField
                                    label="Estado"
                                    value={terapeutaData.cnpj.endereco?.estado || ''}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
