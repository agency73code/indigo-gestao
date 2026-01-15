/**
 * Componente de Núcleo Familiar
 * Estilo Google Forms (igual Anamnese)
 */

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/ui/button';
import { InputField } from '@/ui/input-field';
import { SelectField } from '@/ui/select-field';
import { AutoExpandTextarea } from '@/components/ui/auto-expand-textarea';
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

export default function NucleoFamiliar({ 
    data, 
    onChange, 
    onAddMembro,
    onRemoveMembro,
    fieldErrors: _fieldErrors = {} 
}: NucleoFamiliarProps) {
    const [showForm, setShowForm] = useState(false);
    const [novoMembro, setNovoMembro] = useState<Partial<MembroNucleoFamiliar>>({
        nome: '',
        parentesco: '',
        idade: '',
        ocupacao: '',
    });

    const handleAddMembro = () => {
        if (!novoMembro.nome || !novoMembro.parentesco) return;
        
        const membro: MembroNucleoFamiliar = {
            id: String(Date.now()),
            nome: novoMembro.nome || '',
            parentesco: novoMembro.parentesco || '',
            idade: novoMembro.idade,
            ocupacao: novoMembro.ocupacao,
        };
        
        onAddMembro(membro);
        setNovoMembro({ nome: '', parentesco: '', idade: '', ocupacao: '' });
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
                                <span className="text-sm font-medium text-foreground">
                                    Membro {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemoveMembro(membro.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
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
                                        setNovoMembro({ nome: '', parentesco: '', idade: '', ocupacao: '' });
                                    }}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Nome *"
                                    placeholder="Nome completo"
                                    value={novoMembro.nome || ''}
                                    onChange={(e) => setNovoMembro({ ...novoMembro, nome: e.target.value })}
                                />
                                <SelectField
                                    label="Parentesco *"
                                    value={novoMembro.parentesco || ''}
                                    onChange={(e) => setNovoMembro({ ...novoMembro, parentesco: e.target.value })}
                                >
                                    <option value="">Selecione</option>
                                    {PARENTESCOS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                    ))}
                                </SelectField>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField
                                    label="Idade"
                                    placeholder="Ex: 42"
                                    value={String(novoMembro.idade || '')}
                                    onChange={(e) => setNovoMembro({ ...novoMembro, idade: e.target.value })}
                                />
                                <InputField
                                    label="Ocupação"
                                    placeholder="Ex: Professora"
                                    value={novoMembro.ocupacao || ''}
                                    onChange={(e) => setNovoMembro({ ...novoMembro, ocupacao: e.target.value })}
                                />
                            </div>
                            
                            <div className="flex justify-end">
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleAddMembro}
                                    disabled={!novoMembro.nome || !novoMembro.parentesco}
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
