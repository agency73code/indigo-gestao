import { X, User, MapPin, Briefcase, Building } from 'lucide-react';
import { Button } from '@/ui/button';
import ReadOnlyField from './ReadOnlyField';
import type { Therapist } from '../types/consultas.types';

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
    if (!therapist || !open) return null;

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

    const formatCurrency = (value?: number) => {
        if (!value) return 'Não informado';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
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
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b">
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

                    {/* Content */}
                    <div className="space-y-8">
                        {/* Dados Pessoais */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Dados Pessoais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Nome Completo" value={therapist.nome} />
                                <ReadOnlyField label="E-mail" value={therapist.email} />
                                <ReadOnlyField label="Telefone" value={therapist.telefone} />
                                <ReadOnlyField label="CPF" value={therapist.pessoa?.cpf} />
                                <ReadOnlyField
                                    label="Data de Nascimento"
                                    value={formatDate(therapist.pessoa?.dataNascimento)}
                                />
                                <ReadOnlyField label="Gênero" value={therapist.pessoa?.genero} />
                            </div>
                            {therapist.pessoa?.observacoes && (
                                <div className="mt-4">
                                    <ReadOnlyField
                                        label="Observações"
                                        value={therapist.pessoa.observacoes}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Endereço */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5" />
                                Endereço
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="CEP" value={therapist.endereco?.cep} />
                                <ReadOnlyField label="UF" value={therapist.endereco?.uf} />
                                <ReadOnlyField
                                    label="Logradouro"
                                    value={therapist.endereco?.logradouro}
                                    className="md:col-span-2"
                                />
                                <ReadOnlyField label="Número" value={therapist.endereco?.numero} />
                                <ReadOnlyField
                                    label="Complemento"
                                    value={therapist.endereco?.complemento}
                                />
                                <ReadOnlyField label="Bairro" value={therapist.endereco?.bairro} />
                                <ReadOnlyField label="Cidade" value={therapist.endereco?.cidade} />
                            </div>
                        </div>

                        {/* Dados Profissionais */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" />
                                Dados Profissionais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Conselho" value={therapist.conselho} />
                                <ReadOnlyField
                                    label="Registro"
                                    value={therapist.registroConselho}
                                />
                                <ReadOnlyField
                                    label="Carga Horária Semanal"
                                    value={
                                        therapist.profissional?.cargaHorariaSemanal
                                            ? `${therapist.profissional.cargaHorariaSemanal}h`
                                            : undefined
                                    }
                                />
                                <ReadOnlyField
                                    label="Atende Convênio"
                                    value={therapist.profissional?.atendeConvenio ? 'Sim' : 'Não'}
                                />
                                <ReadOnlyField
                                    label="Valor da Consulta"
                                    value={formatCurrency(therapist.profissional?.valorConsulta)}
                                />
                            </div>
                        </div>

                        {/* CNPJ */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5" />
                                Dados CNPJ
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <ReadOnlyField label="CNPJ" value={maskCNPJ(therapist.cnpj)} />
                            </div>
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">
                                    <strong>Nota:</strong> Por questões de segurança, o CNPJ é
                                    exibido de forma mascarada.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
