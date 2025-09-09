import { X, User, MapPin } from 'lucide-react';
import { Button } from '@/ui/button';
import ReadOnlyField from './ReadOnlyField';
import type { Patient } from '../types/consultas.types';

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
    if (!patient || !open) return null;

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
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
            <div className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl overflow-y-auto">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b">
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

                    {/* Content */}
                    <div className="space-y-8">
                        {/* Dados Pessoais */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5" />
                                Dados Pessoais
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Nome Completo" value={patient.nome} />
                                <ReadOnlyField label="E-mail" value={patient.email} />
                                <ReadOnlyField label="Telefone" value={patient.telefone} />
                                <ReadOnlyField label="CPF" value={patient.pessoa?.cpf} />
                                <ReadOnlyField
                                    label="Data de Nascimento"
                                    value={formatDate(patient.pessoa?.dataNascimento)}
                                />
                                <ReadOnlyField label="Gênero" value={patient.pessoa?.genero} />
                            </div>

                            {patient.responsavel && (
                                <div className="mt-4">
                                    <ReadOnlyField
                                        label="Responsável"
                                        value={patient.responsavel}
                                    />
                                </div>
                            )}

                            {patient.pessoa?.observacoes && (
                                <div className="mt-4">
                                    <ReadOnlyField
                                        label="Observações"
                                        value={patient.pessoa.observacoes}
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
                                <ReadOnlyField label="CEP" value={patient.endereco?.cep} />
                                <ReadOnlyField label="UF" value={patient.endereco?.uf} />
                                <ReadOnlyField
                                    label="Logradouro"
                                    value={patient.endereco?.logradouro}
                                    className="md:col-span-2"
                                />
                                <ReadOnlyField label="Número" value={patient.endereco?.numero} />
                                <ReadOnlyField
                                    label="Complemento"
                                    value={patient.endereco?.complemento}
                                />
                                <ReadOnlyField label="Bairro" value={patient.endereco?.bairro} />
                                <ReadOnlyField label="Cidade" value={patient.endereco?.cidade} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
