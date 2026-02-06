/**
 * Componente de Núcleo Familiar
 */

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { InputField } from '@/ui/input-field';
import { SelectField } from '@/ui/select-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import { AutoExpandTextarea } from '@/components/ui/auto-expand-textarea';
import { maskCPF, isValidCPF } from '@/common/utils/mask';
import type { ProntuarioFormData, MembroNucleoFamiliar } from '../types';

interface NucleoFamiliarProps {
    data: ProntuarioFormData;
    onChange: (data: ProntuarioFormData) => void;
    onAddMembro: (membro: MembroNucleoFamiliar) => void;
    onRemoveMembro: (id: string) => void;
    fieldErrors?: Record<string, string>;
}

const PARENTESCOS = [
    'Pai',
    'Mãe',
    'Irmão/Irmã',
    'Avô/Avó',
    'Tio/Tia',
    'Primo/Prima',
    'Padrasto/Madrasta',
    'Padrinho/Madrinha',
    'Outro',
];

// Função para calcular idade a partir da data de nascimento
function calcularIdade(dataNascimento: string): string {
    if (!dataNascimento) return '';
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNascimento = nascimento.getMonth();
    if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
        idade--;
    }
    if (idade < 1) {
        const meses = (hoje.getFullYear() - nascimento.getFullYear()) * 12 + (mesAtual - mesNascimento);
        return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    }
    return `${idade} ${idade === 1 ? 'ano' : 'anos'}`;
}

export default function NucleoFamiliar({ 
    data, 
    onChange, 
    onAddMembro,
    onRemoveMembro,
    fieldErrors: _fieldErrors = {} 
}: NucleoFamiliarProps) {
    const [showForm, setShowForm] = useState(false);
    const [cpfError, setCpfError] = useState<string | null>(null);
    const [novoMembro, setNovoMembro] = useState<Partial<MembroNucleoFamiliar>>({
        nome: '',
        cpf: '',
        parentesco: '',
        descricaoRelacao: '',
        dataNascimento: '',
        ocupacao: '',
    });

    // Handler para CPF com máscara e validação
    const handleCpfChange = (value: string) => {
        const masked = maskCPF(value);
        setNovoMembro({ ...novoMembro, cpf: masked });
        
        // Validar apenas quando tiver 14 caracteres (CPF completo com máscara)
        if (masked.length === 14) {
            if (!isValidCPF(masked)) {
                setCpfError('CPF inválido');
            } else {
                setCpfError(null);
            }
        } else {
            setCpfError(null);
        }
    };

    const handleAddMembro = () => {
        // Se for "Outro", precisa da descrição da relação
        const parentescoFinal = novoMembro.parentesco === 'Outro' && novoMembro.descricaoRelacao 
            ? novoMembro.descricaoRelacao 
            : novoMembro.parentesco;
        
        // Validar CPF antes de adicionar
        if (!isValidCPF(novoMembro.cpf || '')) {
            setCpfError('CPF inválido');
            return;
        }
            
        if (!novoMembro.nome || !novoMembro.cpf || !parentescoFinal || !novoMembro.dataNascimento) return;
        
        const membro: MembroNucleoFamiliar = {
            id: String(Date.now()),
            nome: novoMembro.nome || '',
            cpf: novoMembro.cpf || '',
            parentesco: parentescoFinal || '',
            descricaoRelacao: novoMembro.parentesco === 'Outro' ? novoMembro.descricaoRelacao : undefined,
            dataNascimento: novoMembro.dataNascimento || '',
            idade: calcularIdade(novoMembro.dataNascimento || ''),
            ocupacao: novoMembro.ocupacao,
            origemBanco: false, // Membro adicionado manualmente
        };
        
        onAddMembro(membro);
        setCpfError(null);
        setNovoMembro({ nome: '', cpf: '', parentesco: '', descricaoRelacao: '', dataNascimento: '', ocupacao: '' });
        setShowForm(false);
    };

    return (
        <div className="space-y-3">
            {/* Membros do Núcleo Familiar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            Membros da Família
                        </span>
                        <p className="text-xs text-muted-foreground">
                            Cuidadores cadastrados do cliente serão exibidos aqui
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowForm(true)}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Lista de membros */}
                <div className="space-y-3">
                    {data.nucleoFamiliar.map((membro, index) => (
                        <div
                            key={membro.id}
                            className="rounded-2xl border bg-white p-4"
                        >
                            {/* Título da linha com botão de remover */}
                            <div className="flex items-center justify-between pb-3 border-b">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-foreground">
                                        Membro {index + 1}
                                    </span>
                                    {membro.origemBanco && (
                                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                            Cadastrado
                                        </span>
                                    )}
                                </div>
                                {/* Só permite excluir membros que NÃO vieram do banco */}
                                {!membro.origemBanco && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onRemoveMembro(membro.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            
                            {/* Dados do membro em formato simples */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm pt-3">
                                <div>
                                    <span className="text-muted-foreground">Nome</span>
                                    <p className="font-medium">{membro.nome}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Parentesco</span>
                                    <p className="font-medium">{membro.parentesco}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Idade</span>
                                    <p className="font-medium">{membro.idade || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Ocupação</span>
                                    <p className="font-medium">{membro.ocupacao || '-'}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Formulário para novo membro */}
                    {showForm && (
                        <div className="rounded-2xl border bg-white p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    Novo Membro
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setShowForm(false);
                                        setCpfError(null);
                                        setNovoMembro({ nome: '', cpf: '', parentesco: '', descricaoRelacao: '', dataNascimento: '', ocupacao: '' });
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Linha 1: Nome, CPF, Parentesco (e campo Relação se Outro) */}
                            <div className={`grid grid-cols-1 gap-4 ${novoMembro.parentesco === 'Outro' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
                                <InputField
                                    label="Nome *"
                                    placeholder="Nome completo"
                                    value={novoMembro.nome || ''}
                                    onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
                                />
                                <InputField
                                    label="CPF *"
                                    placeholder="000.000.000-00"
                                    value={novoMembro.cpf || ''}
                                    onChange={(e) => handleCpfChange(e.target.value)}
                                    error={cpfError || undefined}
                                />
                                <SelectField
                                    label="Parentesco *"
                                    value={novoMembro.parentesco || ''}
                                    onChange={(e) => setNovoMembro({ ...novoMembro, parentesco: e.target.value, descricaoRelacao: '' })}
                                >
                                    <option value="">Selecione</option>
                                    {PARENTESCOS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </SelectField>
                                {novoMembro.parentesco === 'Outro' && (
                                    <InputField
                                        label="Qual relação? *"
                                        placeholder="Descreva a relação"
                                        value={novoMembro.descricaoRelacao || ''}
                                        onChange={(e) => setNovoMembro({ ...novoMembro, descricaoRelacao: e.target.value })}
                                    />
                                )}
                            </div>
                            
                            {/* Linha 2: Data de Nascimento, Ocupação, Idade calculada */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DateFieldWithLabel
                                    label="Data de Nascimento *"
                                    value={novoMembro.dataNascimento || ''}
                                    onChange={(iso) => setNovoMembro({ ...novoMembro, dataNascimento: iso })}
                                    placeholder="Selecione a data"
                                />
                                <InputField
                                    label="Ocupação"
                                    placeholder="Ex: Professora"
                                    value={novoMembro.ocupacao || ''}
                                    onChange={(e) => setNovoMembro({ ...novoMembro, ocupacao: e.target.value })}
                                />
                                {novoMembro.dataNascimento && (
                                    <div className="flex flex-col justify-center rounded-lg border border-input bg-muted/30 px-4 py-2">
                                        <span className="text-xs text-muted-foreground">Idade calculada</span>
                                        <span className="text-sm font-medium">{calcularIdade(novoMembro.dataNascimento)}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddMembro}
                                    disabled={
                                        !novoMembro.nome || 
                                        !novoMembro.cpf || 
                                        !isValidCPF(novoMembro.cpf || '') ||
                                        !novoMembro.parentesco || 
                                        !novoMembro.dataNascimento ||
                                        (novoMembro.parentesco === 'Outro' && !novoMembro.descricaoRelacao)
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Confirmar
                                </Button>
                            </div>
                        </div>
                    )}

                    {data.nucleoFamiliar.length === 0 && !showForm && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                            Nenhum membro adicionado. Clique em "Adicionar" para incluir.
                        </div>
                    )}
                </div>
            </div>

            {/* Observações do núcleo familiar */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Observações"
                    description="Quem reside com a pessoa, histórico familiar, relacionamentos"
                    placeholder="Sua resposta"
                    value={data.observacoesNucleoFamiliar || ''}
                    onChange={(value) => onChange({ ...data, observacoesNucleoFamiliar: value })}
                />
            </div>
        </div>
    );
}
