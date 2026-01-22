/**
 * Cabeçalho de Identificação do Prontuário Psicológico
 */

import { useState } from 'react';
import { InputField } from '@/ui/input-field';
import { SelectField } from '@/ui/select-field';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import type { ProntuarioFormData } from '../types';
import { formatarData } from '../services';

interface CabecalhoIdentificacaoProps {
    data: ProntuarioFormData;
    onChange: (data: ProntuarioFormData) => void;
    onClienteSelect: (patient: Patient) => void;
    isLoading?: boolean;
    prontuarioExistente?: boolean;
    fieldErrors?: Record<string, string>;
    isEditMode?: boolean;
}

export default function CabecalhoIdentificacao({ 
    data, 
    onChange, 
    onClienteSelect,
    isLoading = false,
    prontuarioExistente = false,
    fieldErrors = {},
    isEditMode = false,
}: CabecalhoIdentificacaoProps) {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Quando seleciona um cliente pelo PatientSelector
    const handlePatientSelect = (patient: Patient) => {
        setSelectedPatient(patient);
        onClienteSelect(patient);
    };

    return (
        <div className="space-y-3">
            {/* Seletor de Cliente - desabilitado em modo de edição */}
            {isEditMode ? (
                <div className="rounded-2xl border bg-white p-4">
                    <div className="flex items-center gap-4">
                        {data.clienteNome && (
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {data.clienteNome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-medium">{data.clienteNome}</p>
                            <p className="text-sm text-muted-foreground">{data.idade}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    <PatientSelector
                        selected={selectedPatient}
                        onSelect={handlePatientSelect}
                    />
                    {fieldErrors.clienteId && !data.clienteId && (
                        <p className="text-sm text-destructive mt-1">{fieldErrors.clienteId}</p>
                    )}
                    {prontuarioExistente && (
                        <p className="text-sm text-destructive mt-1">
                            Este cliente já possui um prontuário psicológico cadastrado.
                    </p>
                    )}
                </>
            )}

            {/* Loading */}
            {isLoading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3 text-muted-foreground">Carregando dados do cliente...</span>
                </div>
            )}

            {/* Dados Pessoais - só aparece depois de selecionar cliente */}
            {data.clienteId && !isLoading && !prontuarioExistente && (
                <>
                    {/* Dados Pessoais */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InputField
                            label="Data de Nascimento"
                            id="dataNascimento"
                            value={data.dataNascimento ? formatarData(data.dataNascimento) : ''}
                            onChange={() => {}}
                            disabled
                            placeholder="Preenchido automaticamente"
                        />
                        <InputField
                            label="Idade"
                            id="idade"
                            value={data.idade || ''}
                            onChange={() => {}}
                            disabled
                            placeholder="Preenchido automaticamente"
                        />
                        <SelectField
                            label="Gênero"
                            id="genero"
                            value={data.genero || ''}
                            onChange={(e) => onChange({ ...data, genero: e.target.value })}
                        >
                            <option value="">Selecione</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                            <option value="nao_informado">Prefiro não informar</option>
                        </SelectField>
                    </div>

                    {/* Endereço */}
                    <InputField
                        label="Endereço Residencial"
                        id="enderecoCompleto"
                        value={data.enderecoCompleto || ''}
                        onChange={() => {}}
                        disabled
                        placeholder="Preenchido automaticamente do cadastro"
                    />

                    {/* Contatos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InputField
                            label="Telefone Residencial"
                            id="telefoneResidencial"
                            value={data.telefoneResidencial || ''}
                            onChange={(e) => onChange({ ...data, telefoneResidencial: e.target.value })}
                            placeholder="(00) 0000-0000"
                        />
                        <InputField
                            label="Celular"
                            id="celular"
                            value={data.celular || ''}
                            onChange={() => {}}
                            disabled
                            placeholder="Preenchido automaticamente"
                        />
                        <InputField
                            label="E-mail"
                            id="email"
                            value={data.email || ''}
                            onChange={() => {}}
                            disabled
                            placeholder="Preenchido automaticamente"
                        />
                    </div>
                </>
            )}
        </div>
    );
}
