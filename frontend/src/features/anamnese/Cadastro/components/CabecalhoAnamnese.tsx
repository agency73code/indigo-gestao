import { useState, useEffect } from 'react';
import { InputField } from '@/ui/input-field';
import { SelectField } from '@/ui/select-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import PatientSelector from '@/features/programas/consultar-programas/components/PatientSelector';
import type { Patient } from '@/features/programas/consultar-programas/types';
import type { AnamnseeCabecalho } from '../types/anamnese.types';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
    buscarTerapeuta,
    buscarCliente, 
    calcularIdade, 
    formatarData,
} from '../services/anamnese-cadastro.service';
import { correctFormatDate } from '@/lib/api';

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
    fieldErrors?: Record<string, string>;
}

export default function CabecalhoAnamnese({ data, onChange, fieldErrors = {} }: CabecalhoAnamneseProps) {
    const { user } = useAuth();
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    // Preencher data da entrevista e profissional automaticamente
    useEffect(() => {
        if (!data.dataEntrevista) {
            onChange({ ...data, dataEntrevista: getDataHoje() });
        }
    }, [data, onChange]);

    // Carregar terapeuta logado e preencher profissional automaticamente
    useEffect(() => {
        async function loadTerapeutaLogado() {
            if (!user || data.profissionalId) {
                return;
            }

            try {
                const terapeuta = await buscarTerapeuta(user.id);
                onChange({
                    ...data,
                    dataEntrevista: data.dataEntrevista || getDataHoje(),
                    profissionalId: terapeuta.id,
                    profissionalNome: terapeuta.nome,
                });
            } catch (error) {
                console.error('Erro ao carregar terapeuta:', error);
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
        loadTerapeutaLogado();
    }, [user, data, onChange]);

    // Quando seleciona um cliente pelo PatientSelector
    const handlePatientSelect = async (patient: Patient) => {
        setSelectedPatient(patient);
        
        try {
            const clienteCompleto = await buscarCliente(patient.id);
            
            // Mapear cuidadores do cliente
            const cuidadoresMapeados = clienteCompleto.cuidadores?.map((c: any) => ({
                id: c.id || '',
                nome: c.nome || '',
                relacao: c.relacao || '',
                descricaoRelacao: c.descricaoRelacao || '',
                telefone: c.telefone || '',
                email: c.email || '',
                profissao: c.profissao || '',
                escolaridade: c.escolaridade || '',
                dataNascimento: c.dataNascimento || '',
            })) || [];
            
            onChange({
                ...data,
                clienteId: clienteCompleto.id || patient.id,
                clienteNome: clienteCompleto.nome || patient.name,
                dataNascimento: clienteCompleto.dataNascimento || patient.birthDate || '',
                idade: calcularIdade(clienteCompleto.dataNascimento || patient.birthDate || ''),
                informante: '', // Deixar vazio para o terapeuta preencher
                parentesco: '', // Deixar vazio para o terapeuta selecionar
                cuidadores: cuidadoresMapeados,
                escolaCliente: clienteCompleto.dadosEscola?.nome || null,
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
                informante: '', // Deixar vazio para o terapeuta preencher
                parentesco: '',
                cuidadores: [],
            });
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Seletor de Cliente */}
            <div>
                <PatientSelector
                    selected={selectedPatient}
                    onSelect={handlePatientSelect}
                />
                {fieldErrors.clienteId && !data.clienteId && (
                    <p className="text-sm text-destructive mt-1">{fieldErrors.clienteId}</p>
                )}
            </div>

            {/* Card do Cabeçalho - só aparece depois de selecionar cliente */}
            {data.clienteId && (
                    <div className="space-y-4">
                        {/* Linha 1: Data da Entrevista, DN e Idade */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DateFieldWithLabel
                                label="Data da Entrevista *"
                                value={data.dataEntrevista || ''}
                                onChange={(iso) => onChange({ ...data, dataEntrevista: iso })}
                                error={fieldErrors.dataEntrevista}
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
                                label="Informante *"
                                id="informante"
                                value={data.informante || ''}
                                onChange={(e) => onChange({ ...data, informante: e.target.value })}
                                placeholder="Nome do informante"
                                error={fieldErrors.informante}
                            />
                            <SelectField
                                label="Parentesco *"
                                id="parentesco"
                                value={data.parentesco || ''}
                                onChange={(e) => onChange({ ...data, parentesco: e.target.value, parentescoDescricao: e.target.value !== 'outro' ? '' : data.parentescoDescricao })}
                                error={fieldErrors.parentesco}
                            >
                                <option value="">Selecione o parentesco</option>
                                <option value="mae">Mãe</option>
                                <option value="pai">Pai</option>
                                <option value="avo">Avó/Avô</option>
                                <option value="tio">Tia/Tio</option>
                                <option value="responsavel">Responsável legal</option>
                                <option value="tutor">Tutor(a)</option>
                                <option value="outro">Outro</option>
                            </SelectField>
                        </div>

                        {/* Campo de descrição quando Parentesco = Outro */}
                        {data.parentesco === 'outro' && (
                            <InputField
                                label="Especifique o parentesco"
                                id="parentescoDescricao"
                                value={data.parentescoDescricao || ''}
                                onChange={(e) => onChange({ ...data, parentescoDescricao: e.target.value })}
                                placeholder="Descreva o parentesco"
                            />
                        )}

                        {/* Linha 4: Quem indicou */}
                        <InputField
                            label="Quem indicou a clínica?"
                            id="quemIndicou"
                            value={data.quemIndicou || ''}
                            onChange={(e) => onChange({ ...data, quemIndicou: e.target.value })}
                            placeholder="Nome ou origem da indicação"
                        />

                        {/* Cuidadores do Cliente */}
                        {data.cuidadores && data.cuidadores.length > 0 && (
                            <div className="pt-4 border-t">
                                <h4 className="text-sm font-medium text-muted-foreground mb-3">Cuidadores</h4>
                                <div className="space-y-3">
                                    {data.cuidadores.map((cuidador) => {
                                        // Calcular idade a partir da data de nascimento
                                        const calcularIdadeCuidador = (dataNasc?: string) => {
                                            if (!dataNasc) return null;
                                            const hoje = new Date();
                                            const nascimento = new Date(dataNasc);
                                            let idade = hoje.getFullYear() - nascimento.getFullYear();
                                            const m = hoje.getMonth() - nascimento.getMonth();
                                            if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
                                                idade--;
                                            }
                                            return idade;
                                        };
                                        const idade = calcularIdadeCuidador(cuidador.dataNascimento);
                                        
                                        return (
                                            <div key={cuidador.id} className="p-4 border rounded-lg bg-muted/30">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                                        {cuidador.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{cuidador.nome}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {cuidador.relacao === 'outro' && cuidador.descricaoRelacao 
                                                                ? cuidador.descricaoRelacao 
                                                                : RELACAO_LABELS[cuidador.relacao] || cuidador.relacao}
                                                            {idade !== null && ` • ${idade} anos`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                                                        <p className="text-sm">{cuidador.dataNascimento ? correctFormatDate(cuidador.dataNascimento) : 'Não informado'}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Idade</p>
                                                        <p className="text-sm">{idade !== null ? `${idade} anos` : 'Não informado'}</p>
                                                    </div>
                                                    {cuidador.telefone && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Telefone</p>
                                                            <p className="text-sm">{cuidador.telefone}</p>
                                                        </div>
                                                    )}
                                                    {cuidador.email && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">E-mail</p>
                                                            <p className="text-sm">{cuidador.email}</p>
                                                        </div>
                                                    )}
                                                    {cuidador.escolaridade && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Escolaridade</p>
                                                            <p className="text-sm">{cuidador.escolaridade}</p>
                                                        </div>
                                                    )}
                                                    {cuidador.profissao && (
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Profissão</p>
                                                            <p className="text-sm">{cuidador.profissao}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
            )}
        </div>
    );
}
