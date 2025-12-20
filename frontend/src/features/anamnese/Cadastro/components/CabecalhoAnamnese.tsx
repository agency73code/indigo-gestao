import { useState, useEffect } from 'react';
import { InputField } from '@/ui/input-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import type { AnamnseeCabecalho } from '../types/anamnese.types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
    listarTerapeutas,
    buscarCliente, 
    calcularIdade, 
    formatarData,
} from '../services/anamnese.service';

// Mapa de relações para exibição
const RELACAO_LABELS: Record<string, string> = {
    'mae': 'Mãe',
    'pai': 'Pai',
    'avo': 'Avô/Avó',
    'tio': 'Tio/Tia',
    'responsavel': 'Responsável',
    'tutor': 'Tutor',
    'outro': 'Outro',
};

// Função para obter data atual em formato ISO
function getDataHoje(): string {
    return new Date().toISOString().split('T')[0];
}

interface CabecalhoAnamneseProps {
    data: AnamnseeCabecalho;
    onChange: (data: AnamnseeCabecalho) => void;
}

export default function CabecalhoAnamnese({ data, onChange }: CabecalhoAnamneseProps) {
    const { user } = useAuth();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Preencher data da entrevista e profissional automaticamente
    useEffect(() => {
        if (!data.dataEntrevista) {
            onChange({ ...data, dataEntrevista: getDataHoje() });
        }
    }, []);

    // Carregar terapeutas e preencher profissional logado
    useEffect(() => {
        async function loadTerapeutas() {
            try {
                const terapeutasData = await listarTerapeutas();
                
                // Preencher automaticamente com o terapeuta logado
                if (user && !data.profissionalId) {
                    const terapeuta = terapeutasData.find(t => t.id === user.id);
                    if (terapeuta) {
                        onChange({
                            ...data,
                            dataEntrevista: data.dataEntrevista || getDataHoje(),
                            profissionalId: terapeuta.id,
                            profissionalNome: terapeuta.nome,
                        });
                    } else {
                        // Fallback: usar dados básicos do usuário logado
                        onChange({
                            ...data,
                            dataEntrevista: data.dataEntrevista || getDataHoje(),
                            profissionalId: user.id,
                            profissionalNome: user.name ?? 'Terapeuta',
                        });
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar terapeutas:', error);
                // Em caso de erro, ainda tenta usar os dados do usuário logado
                if (user && !data.profissionalId) {
                    onChange({
                        ...data,
                        dataEntrevista: data.dataEntrevista || getDataHoje(),
                        profissionalId: user.id,
                        profissionalNome: user.name ?? 'Terapeuta',
                    });
                }
            }
        }
        loadTerapeutas();
    }, [user]);

    // Quando seleciona um cliente pelo PatientSelector
    const handlePatientSelect = async (patient: Patient) => {
        setSelectedPatient(patient);
        
        try {
            const clienteCompleto = await buscarCliente(patient.id);
            const cuidadorPrincipal = clienteCompleto.cuidadores?.[0];
            
            onChange({
                ...data,
                clienteId: clienteCompleto.id || patient.id,
                clienteNome: clienteCompleto.nome || patient.name,
                dataNascimento: clienteCompleto.dataNascimento || patient.birthDate || '',
                idade: calcularIdade(clienteCompleto.dataNascimento || patient.birthDate || ''),
                informante: cuidadorPrincipal?.nome || patient.guardianName || '',
                parentesco: cuidadorPrincipal?.relacao ? RELACAO_LABELS[cuidadorPrincipal.relacao] || cuidadorPrincipal.relacao : '',
            });
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            // Usa os dados básicos do patient se falhar
            onChange({
                ...data,
                clienteId: patient.id,
                clienteNome: patient.name,
                dataNascimento: patient.birthDate || '',
                idade: patient.age ? `${patient.age} anos` : '',
                informante: patient.guardianName || '',
                parentesco: '',
            });
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Seletor de Cliente */}
            <PatientSelector
                selected={selectedPatient}
                onSelect={handlePatientSelect}
            />

            {/* Card do Cabeçalho - só aparece depois de selecionar cliente */}
            {data.clienteId && (
                    <div className="space-y-4">
                        {/* Linha 1: Data da Entrevista, DN e Idade */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DateFieldWithLabel
                                label="Data da Entrevista *"
                                value={data.dataEntrevista || ''}
                                onChange={(iso) => onChange({ ...data, dataEntrevista: iso })}
                            />
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
                        </div>

                        {/* Linha 2: Informante e Parentesco */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Informante"
                                id="informante"
                                value={data.informante || ''}
                                onChange={(e) => onChange({ ...data, informante: e.target.value })}
                                placeholder="Nome do informante"
                            />
                            <InputField
                                label="Parentesco"
                                id="parentesco"
                                value={data.parentesco || ''}
                                onChange={(e) => onChange({ ...data, parentesco: e.target.value })}
                                placeholder="Relação com o cliente"
                            />
                        </div>

                        {/* Linha 4: Quem indicou */}
                        <InputField
                            label="Quem indicou a clínica?"
                            id="quemIndicou"
                            value={data.quemIndicou || ''}
                            onChange={(e) => onChange({ ...data, quemIndicou: e.target.value })}
                            placeholder="Nome ou origem da indicação"
                        />
                    </div>
            )}
        </div>
    );
}
