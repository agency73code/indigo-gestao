import { X, User, MapPin, Briefcase, Building, GraduationCap, FileText, Car } from 'lucide-react';
import { Button } from '@/ui/button';
import ReadOnlyField from './ReadOnlyField';
import type { Therapist } from '../types/consultas.types';
import { useTerapeutaData } from '../hooks/useTerapeutaData';

interface TherapistProfileDrawerProps {
    therapist: Therapist | null;
    open: boolean;
    onClose: () => void;
}

export default function TherapistProfileDrawer({
    therapist,
    open,
    onClose,
}: TherapistProfileDrawerProps) {
    // Usar hook para obter dados completos do terapeuta
    // Reutiliza tipos/schemas dos cadastros
    const terapeutaData = useTerapeutaData(therapist);

    if (!therapist || !open || !terapeutaData) return null;

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

    const maskCNPJ = (cnpj?: string) => {
        if (!cnpj) return 'Não informado';
        return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '**.***.***/****-**');
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
                {/* Header - fixo */}
                <div className="flex items-center gap-4 p-6 border-b bg-gray-50 flex-shrink-0">
                    <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-lg font-medium text-blue-600">
                        {getInitials(therapist.nome)}
                    </div>
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold">{therapist.nome}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            {getStatusBadge(therapist.status)}
                            {therapist.especialidade && (
                                <span className="text-sm text-gray-600">
                                    {therapist.especialidade}
                                </span>
                            )}
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content - rolável com todos os campos dos cadastros */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <div className="p-6 space-y-8 pb-16">
                        {/* Seção 1: Dados Pessoais (DadosPessoaisStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Dados Pessoais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Nome *" value={terapeutaData.nome} />
                                <ReadOnlyField
                                    label="Data de nascimento *"
                                    value={formatDate(terapeutaData.dataNascimento)}
                                />
                                <ReadOnlyField label="E-mail *" value={terapeutaData.email} />
                                <ReadOnlyField
                                    label="E-mail Índigo *"
                                    value={terapeutaData.emailIndigo}
                                />
                                <ReadOnlyField label="Telefone" value={terapeutaData.telefone} />
                                <ReadOnlyField label="Celular *" value={terapeutaData.celular} />
                                <ReadOnlyField label="CPF *" value={terapeutaData.cpf} />
                            </div>

                            {/* Seção Veículo - Condicional */}
                            <div className="mt-6">
                                <ReadOnlyField
                                    label="Possui Veículo? *"
                                    value={terapeutaData.possuiVeiculo === 'sim' ? 'Sim' : 'Não'}
                                />

                                {terapeutaData.possuiVeiculo === 'sim' && (
                                    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                            <Car className="w-4 h-4" />
                                            Dados do Veículo
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadOnlyField
                                                label="Placa do Veículo *"
                                                value={terapeutaData.placaVeiculo}
                                            />
                                            <ReadOnlyField
                                                label="Modelo do Veículo *"
                                                value={terapeutaData.modeloVeiculo}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Dados para pagamento */}
                            <div className="mt-6">
                                <h4 className="text-md font-semibold mb-3">Dados para pagamento</h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <ReadOnlyField label="Banco *" value={terapeutaData.banco} />
                                    <ReadOnlyField
                                        label="Agência *"
                                        value={terapeutaData.agencia}
                                    />
                                    <ReadOnlyField label="Conta *" value={terapeutaData.conta} />
                                    <ReadOnlyField
                                        label="Chave PIX *"
                                        value={terapeutaData.chavePix}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Seção 2: Endereço (EnderecoStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereço
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="CEP *" value={terapeutaData.endereco?.cep} />
                                <ReadOnlyField
                                    label="Estado *"
                                    value={terapeutaData.endereco?.estado}
                                />
                                <ReadOnlyField
                                    label="Rua *"
                                    value={terapeutaData.endereco?.rua}
                                    className="md:col-span-2"
                                />
                                <ReadOnlyField
                                    label="Número *"
                                    value={terapeutaData.endereco?.numero}
                                />
                                <ReadOnlyField
                                    label="Complemento"
                                    value={terapeutaData.endereco?.complemento}
                                />
                                <ReadOnlyField
                                    label="Bairro *"
                                    value={terapeutaData.endereco?.bairro}
                                />
                                <ReadOnlyField
                                    label="Cidade *"
                                    value={terapeutaData.endereco?.cidade}
                                />
                            </div>
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Seção 3: Dados Profissionais (DadosProfissionaisStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Dados Profissionais
                            </h3>

                            {/* Dados profissionais (múltiplas áreas) */}
                            {terapeutaData.dadosProfissionais &&
                                terapeutaData.dadosProfissionais.length > 0 && (
                                    <div className="space-y-4">
                                        {terapeutaData.dadosProfissionais.map((dados, index) => (
                                            <div
                                                key={index}
                                                className="p-4 border rounded-lg bg-muted/30"
                                            >
                                                <h4 className="font-medium mb-3">
                                                    Área de Atuação {index + 1}
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <ReadOnlyField
                                                        label="Área de atuação *"
                                                        value={dados.areaAtuacao}
                                                    />
                                                    <ReadOnlyField
                                                        label="Cargo *"
                                                        value={dados.cargo}
                                                    />
                                                    <ReadOnlyField
                                                        label="Número do conselho"
                                                        value={dados.numeroConselho}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            {/* Outras informações profissionais */}
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField
                                    label="Número do convênio"
                                    value={terapeutaData.numeroConvenio}
                                />
                                <ReadOnlyField label="CRP *" value={terapeutaData.crp} />
                                <ReadOnlyField
                                    label="Data de entrada *"
                                    value={formatDate(terapeutaData.dataEntrada)}
                                />
                                <ReadOnlyField
                                    label="Data de saída"
                                    value={formatDate(terapeutaData.dataSaida)}
                                />
                                <ReadOnlyField
                                    label="Data início *"
                                    value={formatDate(terapeutaData.dataInicio)}
                                />
                                <ReadOnlyField
                                    label="Data fim"
                                    value={formatDate(terapeutaData.dataFim)}
                                />
                                <ReadOnlyField
                                    label="Valor da consulta *"
                                    value={
                                        terapeutaData.valorConsulta
                                            ? `R$ ${terapeutaData.valorConsulta}`
                                            : undefined
                                    }
                                />
                            </div>

                            {/* Especialidades */}
                            {terapeutaData.especialidades &&
                                terapeutaData.especialidades.length > 0 && (
                                    <div className="mt-4">
                                        <ReadOnlyField
                                            label="Especialidades *"
                                            value={terapeutaData.especialidades.join(', ')}
                                        />
                                    </div>
                                )}

                            {/* Formas de atendimento */}
                            {terapeutaData.formasAtendimento &&
                                terapeutaData.formasAtendimento.length > 0 && (
                                    <div className="mt-4">
                                        <ReadOnlyField
                                            label="Formas de atendimento *"
                                            value={terapeutaData.formasAtendimento.join(', ')}
                                        />
                                    </div>
                                )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Seção 4: Formação (FormacaoStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5" />
                                Formação
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <ReadOnlyField
                                    label="Graduação *"
                                    value={terapeutaData.formacao?.graduacao}
                                />
                                <ReadOnlyField
                                    label="Instituição graduação *"
                                    value={terapeutaData.formacao?.instituicaoGraduacao}
                                />
                                <ReadOnlyField
                                    label="Ano formatura *"
                                    value={terapeutaData.formacao?.anoFormatura}
                                />
                            </div>

                            {/* Pós-graduação - Condicional */}
                            {terapeutaData.formacao?.posGraduacao && (
                                <div className="mt-4 p-4 border rounded-lg bg-muted/30">
                                    <h4 className="font-medium mb-3">Pós-graduação</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <ReadOnlyField
                                            label="Pós-graduação"
                                            value={terapeutaData.formacao.posGraduacao}
                                        />
                                        <ReadOnlyField
                                            label="Instituição pós-graduação"
                                            value={terapeutaData.formacao.instituicaoPosGraduacao}
                                        />
                                        <ReadOnlyField
                                            label="Ano pós-graduação"
                                            value={terapeutaData.formacao.anoPosGraduacao}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Cursos adicionais */}
                            {terapeutaData.formacao?.cursos && (
                                <div className="mt-4">
                                    <ReadOnlyField
                                        label="Cursos"
                                        value={terapeutaData.formacao.cursos}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Separador */}
                        <div className="border-t border-gray-200"></div>

                        {/* Seção 5: Arquivos (ArquivosStep) */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Arquivos
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField
                                    label="Foto de perfil"
                                    value={
                                        terapeutaData.arquivos?.fotoPerfil
                                            ? 'Enviado'
                                            : 'Não enviado'
                                    }
                                />
                                <ReadOnlyField
                                    label="Diploma graduação *"
                                    value={
                                        terapeutaData.arquivos?.diplomaGraduacao
                                            ? 'Enviado'
                                            : 'Não enviado'
                                    }
                                />
                                <ReadOnlyField
                                    label="Diploma pós-graduação"
                                    value={
                                        terapeutaData.arquivos?.diplomaPosGraduacao
                                            ? 'Enviado'
                                            : 'Não enviado'
                                    }
                                />
                                <ReadOnlyField
                                    label="Registro CRP *"
                                    value={
                                        terapeutaData.arquivos?.registroCRP
                                            ? 'Enviado'
                                            : 'Não enviado'
                                    }
                                />
                                <ReadOnlyField
                                    label="Comprovante endereço *"
                                    value={
                                        terapeutaData.arquivos?.comprovanteEndereco
                                            ? 'Enviado'
                                            : 'Não enviado'
                                    }
                                />
                            </div>
                        </div>

                        {/* Dados CNPJ - Seção Condicional */}
                        {terapeutaData.cnpj && (
                            <>
                                {/* Separador */}
                                <div className="border-t border-gray-200"></div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                        <Building className="w-5 h-5" />
                                        Dados CNPJ
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <ReadOnlyField
                                            label="CNPJ"
                                            value={maskCNPJ(terapeutaData.cnpj.numero)}
                                        />
                                        <ReadOnlyField
                                            label="Razão Social"
                                            value={terapeutaData.cnpj.razaoSocial}
                                        />
                                        <ReadOnlyField
                                            label="Nome Fantasia"
                                            value={terapeutaData.cnpj.nomeFantasia}
                                            className="md:col-span-2"
                                        />
                                    </div>

                                    {/* Endereço da empresa */}
                                    <div className="mt-4">
                                        <h4 className="font-medium mb-3">Endereço da Empresa</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <ReadOnlyField
                                                label="CEP"
                                                value={terapeutaData.cnpj.endereco?.cep}
                                            />
                                            <ReadOnlyField
                                                label="Estado"
                                                value={terapeutaData.cnpj.endereco?.estado}
                                            />
                                            <ReadOnlyField
                                                label="Rua"
                                                value={terapeutaData.cnpj.endereco?.rua}
                                                className="md:col-span-2"
                                            />
                                            <ReadOnlyField
                                                label="Número"
                                                value={terapeutaData.cnpj.endereco?.numero}
                                            />
                                            <ReadOnlyField
                                                label="Complemento"
                                                value={terapeutaData.cnpj.endereco?.complemento}
                                            />
                                            <ReadOnlyField
                                                label="Bairro"
                                                value={terapeutaData.cnpj.endereco?.bairro}
                                            />
                                            <ReadOnlyField
                                                label="Cidade"
                                                value={terapeutaData.cnpj.endereco?.cidade}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-600">
                                            <strong>Nota:</strong> Por questões de segurança, o CNPJ
                                            é exibido de forma mascarada.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Espaço extra para garantir scroll completo */}
                        <div className="h-4"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
