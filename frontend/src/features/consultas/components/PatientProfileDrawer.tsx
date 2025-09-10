import { X, User, MapPin, CreditCard, GraduationCap } from 'lucide-react';
import { Button } from '@/ui/button';
import ReadOnlyField from './ReadOnlyField';
import type { Patient } from '../types/consultas.types';
import { useCliente } from '../hooks/useCliente';

interface PatientProfileDrawerProps {
    patient: Patient | null;
    open: boolean;
    onClose: () => void;
}

export default function PatientProfileDrawer({
    patient,
    open,
    onClose,
}: PatientProfileDrawerProps) {
    // Usar hook para obter dados completos do cliente
    // Reutiliza tipos/schemas dos cadastros
    const clienteData = useCliente(patient?.id, open);

    if (!patient || !open || !clienteData) return null;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Não informado';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusBadge = (status: string) => {
        const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';
        const statusClasses =
            status === 'ATIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';

        return <span className={`${baseClasses} ${statusClasses}`}>{status}</span>;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
                {/* Header - flex-shrink-0 mantém fixo */}
                <div className="flex items-center gap-4 p-6 border-b bg-gray-50 flex-shrink-0">
                    <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center text-lg font-medium text-purple-600">
                        {getInitials(patient.nome)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold">{patient.nome}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(patient.status)}
                            {patient.responsavel && (
                                <span className="text-sm text-gray-600">
                                    Responsável: {patient.responsavel}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content - flex: 1 1 auto; min-height: 0; overflow-y: auto; para scroll */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-6 space-y-8">
                        {/* Dados Pessoais */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Dados Pessoais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Nome *" value={clienteData.nome} />
                                <ReadOnlyField
                                    label="Data de nascimento *"
                                    value={formatDate(clienteData.dataNascimento)}
                                />
                                <ReadOnlyField label="Nome da mãe *" value={clienteData.nomeMae} />
                                <ReadOnlyField label="CPF da mãe *" value={clienteData.cpfMae} />
                                <ReadOnlyField label="Nome do pai" value={clienteData.nomePai} />
                                <ReadOnlyField label="CPF do pai" value={clienteData.cpfPai} />
                                <ReadOnlyField
                                    label="Telefone Pai"
                                    value={clienteData.telefonePai}
                                />
                                <ReadOnlyField
                                    label="E-mail de contato *"
                                    value={clienteData.emailContato}
                                />
                                <ReadOnlyField
                                    label="Data Entrada *"
                                    value={formatDate(clienteData.dataEntrada)}
                                />
                                <ReadOnlyField
                                    label="Data Saída"
                                    value={formatDate(clienteData.dataSaida)}
                                />
                            </div>

                            {/* Seção Mais de um Pai */}
                            <div className="mt-6">
                                <ReadOnlyField
                                    label="Mais de um Pai? *"
                                    value={clienteData.maisDeUmPai === 'sim' ? 'Sim' : 'Não'}
                                />

                                {clienteData.maisDeUmPai === 'sim' && (
                                    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                        <h4 className="text-sm font-medium mb-3 text-muted-foreground">
                                            Dados do Pai 2
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <ReadOnlyField
                                                label="Nome Pai 2 *"
                                                value={clienteData.nomePai2}
                                            />
                                            <ReadOnlyField
                                                label="CPF Pai 2 *"
                                                value={clienteData.cpfPai2}
                                            />
                                            <ReadOnlyField
                                                label="Telefone Pai 2"
                                                value={clienteData.telefonePai2}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Endereços */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereços
                            </h3>

                            {clienteData.enderecos && clienteData.enderecos.length > 0 ? (
                                clienteData.enderecos.map((endereco, index) => (
                                    <div key={index} className="mb-6">
                                        {clienteData.enderecos!.length > 1 && (
                                            <h4 className="text-md font-medium mb-4">
                                                Endereço {index + 1}
                                            </h4>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <ReadOnlyField label="CEP *" value={endereco.cep} />
                                            <ReadOnlyField label="UF *" value={endereco.uf} />
                                            <ReadOnlyField
                                                label="Logradouro *"
                                                value={endereco.logradouro}
                                                className="md:col-span-3"
                                            />
                                            <ReadOnlyField
                                                label="Número *"
                                                value={endereco.numero}
                                            />
                                            <ReadOnlyField
                                                label="Complemento"
                                                value={endereco.complemento}
                                            />
                                            <ReadOnlyField
                                                label="Bairro *"
                                                value={endereco.bairro}
                                            />
                                            <ReadOnlyField
                                                label="Cidade *"
                                                value={endereco.cidade}
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">Nenhum endereço informado</p>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Dados Pagamento */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Dados Pagamento
                            </h3>

                            {/* Dados básicos do titular */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <ReadOnlyField
                                    label="Nome do titular *"
                                    value={clienteData.dadosPagamento?.nomeTitular}
                                />
                                <ReadOnlyField
                                    label="Número da carteirinha"
                                    value={clienteData.dadosPagamento?.numeroCarteirinha}
                                />
                            </div>

                            {/* Telefones e E-mails */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                {/* Telefones */}
                                <div>
                                    <h4 className="text-md font-medium mb-4">Telefones</h4>
                                    <div className="space-y-4">
                                        <ReadOnlyField
                                            label="Telefone *"
                                            value={clienteData.dadosPagamento?.telefone1}
                                        />
                                        {clienteData.dadosPagamento?.mostrarTelefone2 && (
                                            <ReadOnlyField
                                                label="Telefone 2"
                                                value={clienteData.dadosPagamento?.telefone2}
                                            />
                                        )}
                                        {clienteData.dadosPagamento?.mostrarTelefone3 && (
                                            <ReadOnlyField
                                                label="Telefone 3"
                                                value={clienteData.dadosPagamento?.telefone3}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* E-mails */}
                                <div>
                                    <h4 className="text-md font-medium mb-4">E-mails</h4>
                                    <div className="space-y-4">
                                        <ReadOnlyField
                                            label="E-mail *"
                                            value={clienteData.dadosPagamento?.email1}
                                        />
                                        {clienteData.dadosPagamento?.mostrarEmail2 && (
                                            <ReadOnlyField
                                                label="E-mail 2"
                                                value={clienteData.dadosPagamento?.email2}
                                            />
                                        )}
                                        {clienteData.dadosPagamento?.mostrarEmail3 && (
                                            <ReadOnlyField
                                                label="E-mail 3"
                                                value={clienteData.dadosPagamento?.email3}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Sistema de Pagamento */}
                            <div className="mb-6">
                                <ReadOnlyField
                                    label="Sistema de Pagamento *"
                                    value={
                                        clienteData.dadosPagamento?.sistemaPagamento === 'reembolso'
                                            ? 'Reembolso'
                                            : clienteData.dadosPagamento?.sistemaPagamento ===
                                                'liminar'
                                              ? 'Liminar'
                                              : clienteData.dadosPagamento?.sistemaPagamento ===
                                                  'particular'
                                                ? 'Particular'
                                                : 'Não informado'
                                    }
                                />

                                {/* Campos específicos para Reembolso */}
                                {clienteData.dadosPagamento?.sistemaPagamento === 'reembolso' && (
                                    <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                                        <h5 className="text-sm font-medium mb-3 text-slate-700">
                                            Dados do Reembolso
                                        </h5>
                                        <ReadOnlyField
                                            label="Prazo reembolso (dias)"
                                            value={clienteData.dadosPagamento?.prazoReembolso}
                                        />
                                    </div>
                                )}

                                {/* Campos específicos para Liminar */}
                                {clienteData.dadosPagamento?.sistemaPagamento === 'liminar' && (
                                    <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                                        <h5 className="text-sm font-medium mb-3 text-slate-700">
                                            Dados da Liminar
                                        </h5>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <ReadOnlyField
                                                    label="Número do processo"
                                                    value={
                                                        clienteData.dadosPagamento?.numeroProcesso
                                                    }
                                                />
                                                <ReadOnlyField
                                                    label="Nome advogado"
                                                    value={clienteData.dadosPagamento?.nomeAdvogado}
                                                />
                                            </div>

                                            {/* Telefones do Advogado */}
                                            <div>
                                                <h6 className="text-sm font-medium mb-2">
                                                    Telefones do Advogado
                                                </h6>
                                                <div className="space-y-2">
                                                    <ReadOnlyField
                                                        label="Telefone advogado *"
                                                        value={
                                                            clienteData.dadosPagamento
                                                                ?.telefoneAdvogado1
                                                        }
                                                    />
                                                    {clienteData.dadosPagamento
                                                        ?.mostrarTelefoneAdvogado2 && (
                                                        <ReadOnlyField
                                                            label="Telefone advogado 2"
                                                            value={
                                                                clienteData.dadosPagamento
                                                                    ?.telefoneAdvogado2
                                                            }
                                                        />
                                                    )}
                                                    {clienteData.dadosPagamento
                                                        ?.mostrarTelefoneAdvogado3 && (
                                                        <ReadOnlyField
                                                            label="Telefone advogado 3"
                                                            value={
                                                                clienteData.dadosPagamento
                                                                    ?.telefoneAdvogado3
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* E-mails do Advogado */}
                                            <div>
                                                <h6 className="text-sm font-medium mb-2">
                                                    E-mails do Advogado
                                                </h6>
                                                <div className="space-y-2">
                                                    <ReadOnlyField
                                                        label="E-mail advogado *"
                                                        value={
                                                            clienteData.dadosPagamento
                                                                ?.emailAdvogado1
                                                        }
                                                    />
                                                    {clienteData.dadosPagamento
                                                        ?.mostrarEmailAdvogado2 && (
                                                        <ReadOnlyField
                                                            label="E-mail advogado 2"
                                                            value={
                                                                clienteData.dadosPagamento
                                                                    ?.emailAdvogado2
                                                            }
                                                        />
                                                    )}
                                                    {clienteData.dadosPagamento
                                                        ?.mostrarEmailAdvogado3 && (
                                                        <ReadOnlyField
                                                            label="E-mail advogado 3"
                                                            value={
                                                                clienteData.dadosPagamento
                                                                    ?.emailAdvogado3
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Campos específicos para Particular */}
                                {clienteData.dadosPagamento?.sistemaPagamento === 'particular' && (
                                    <div className="mt-4 p-4 border rounded-lg bg-slate-50">
                                        <h5 className="text-sm font-medium mb-3 text-slate-700">
                                            Dados do Particular
                                        </h5>
                                        <div className="space-y-4">
                                            <ReadOnlyField
                                                label="Houve negociação?"
                                                value={
                                                    clienteData.dadosPagamento?.houveNegociacao ===
                                                    'sim'
                                                        ? 'Sim'
                                                        : clienteData.dadosPagamento
                                                                ?.houveNegociacao === 'nao'
                                                          ? 'Não'
                                                          : 'Não informado'
                                                }
                                            />
                                            {clienteData.dadosPagamento?.houveNegociacao ===
                                                'sim' && (
                                                <ReadOnlyField
                                                    label="Valor da sessão *"
                                                    value={clienteData.dadosPagamento?.valorSessao}
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Dados Escola */}
                        <div>
                            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Dados Escola
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <ReadOnlyField
                                    label="Tipo de escola *"
                                    value={
                                        clienteData.dadosEscola?.tipoEscola === 'particular'
                                            ? 'Particular'
                                            : clienteData.dadosEscola?.tipoEscola === 'publica'
                                              ? 'Pública'
                                              : 'Não informado'
                                    }
                                />
                                <ReadOnlyField
                                    label="Nome *"
                                    value={clienteData.dadosEscola?.nome}
                                />
                                <ReadOnlyField
                                    label="Telefone *"
                                    value={clienteData.dadosEscola?.telefone}
                                />
                                <ReadOnlyField
                                    label="E-mail"
                                    value={clienteData.dadosEscola?.email}
                                />
                            </div>

                            {/* Endereço da Escola */}
                            {clienteData.dadosEscola?.endereco && (
                                <div className="mt-6">
                                    <h4 className="text-md font-medium mb-4">Endereço da Escola</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <ReadOnlyField
                                            label="CEP"
                                            value={clienteData.dadosEscola.endereco.cep}
                                        />
                                        <ReadOnlyField
                                            label="UF"
                                            value={clienteData.dadosEscola.endereco.uf}
                                        />
                                        <ReadOnlyField
                                            label="Logradouro"
                                            value={clienteData.dadosEscola.endereco.logradouro}
                                            className="md:col-span-3"
                                        />
                                        <ReadOnlyField
                                            label="Número"
                                            value={clienteData.dadosEscola.endereco.numero}
                                        />
                                        <ReadOnlyField
                                            label="Complemento"
                                            value={clienteData.dadosEscola.endereco.complemento}
                                        />
                                        <ReadOnlyField
                                            label="Bairro"
                                            value={clienteData.dadosEscola.endereco.bairro}
                                        />
                                        <ReadOnlyField
                                            label="Cidade"
                                            value={clienteData.dadosEscola.endereco.cidade}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Espaço extra para garantir scroll completo */}
                        <div className="h-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
