import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/ui/input-field';
import AutoExpandTextarea from '../../ui/AutoExpandTextarea';
import type { AnamneseContextoFamiliarRotina, HistoricoFamiliar, AtividadeRotina } from '../../types/anamnese.types';

interface ContextoFamiliarRotinaStepProps {
    data: Partial<AnamneseContextoFamiliarRotina>;
    onChange: (data: Partial<AnamneseContextoFamiliarRotina>) => void;
}

export default function ContextoFamiliarRotinaStep({ data, onChange }: ContextoFamiliarRotinaStepProps) {
    // Gerar ID único para novos itens
    const generateId = () => crypto.randomUUID();

    // Handlers para Histórico Familiar
    const handleAddHistorico = () => {
        const novoHistorico: HistoricoFamiliar = {
            id: generateId(),
            condicaoDiagnostico: '',
            parentesco: '',
            observacao: '',
        };
        onChange({
            ...data,
            historicosFamiliares: [...(data.historicosFamiliares || []), novoHistorico],
        });
    };

    const handleUpdateHistorico = (id: string, field: keyof HistoricoFamiliar, value: string) => {
        const updated = (data.historicosFamiliares || []).map((hist) =>
            hist.id === id ? { ...hist, [field]: value } : hist
        );
        onChange({ ...data, historicosFamiliares: updated });
    };

    const handleRemoveHistorico = (id: string) => {
        const updated = (data.historicosFamiliares || []).filter((hist) => hist.id !== id);
        onChange({ ...data, historicosFamiliares: updated });
    };

    // Handlers para Atividades na Rotina
    const handleAddAtividade = () => {
        const novaAtividade: AtividadeRotina = {
            id: generateId(),
            atividade: '',
            horario: '',
            frequencia: '',
            observacao: '',
        };
        onChange({
            ...data,
            atividadesRotina: [...(data.atividadesRotina || []), novaAtividade],
        });
    };

    const handleUpdateAtividade = (id: string, field: keyof AtividadeRotina, value: string) => {
        const updated = (data.atividadesRotina || []).map((ativ) =>
            ativ.id === id ? { ...ativ, [field]: value } : ativ
        );
        onChange({ ...data, atividadesRotina: updated });
    };

    const handleRemoveAtividade = (id: string) => {
        const updated = (data.atividadesRotina || []).filter((ativ) => ativ.id !== id);
        onChange({ ...data, atividadesRotina: updated });
    };

    return (
        <div className="space-y-4">
            {/* 8. Histórico Familiar */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            8. Histórico Familiar
                        </span>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddHistorico}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Lista de Históricos Familiares */}
                <div className="space-y-3">
                    {(data.historicosFamiliares || []).map((hist, index) => (
                        <div
                            key={hist.id}
                            className="rounded-2xl border bg-white p-4 space-y-4"
                        >
                            {/* Título da linha com botão de remover */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    Registro {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveHistorico(hist.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Linha: Condição/Diagnóstico e Parentesco */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-3">
                                    <InputField
                                        label="Condição/Diagnóstico *"
                                        placeholder="Ex: TEA, TDAH, Depressão..."
                                        value={hist.condicaoDiagnostico}
                                        onChange={(e) => handleUpdateHistorico(hist.id, 'condicaoDiagnostico', e.target.value)}
                                    />
                                </div>
                                <InputField
                                    label="Parentesco *"
                                    placeholder="Ex: Pai, Tio, Avó..."
                                    value={hist.parentesco}
                                    onChange={(e) => handleUpdateHistorico(hist.id, 'parentesco', e.target.value)}
                                />
                            </div>

                            {/* Observações do registro */}
                            <AutoExpandTextarea
                                label="Observações"
                                description="(Em caso de não haver diagnóstico e o comportamento de pessoas da família ser notadamente atípico, descrever)"
                                placeholder="Sua resposta"
                                value={hist.observacao}
                                onChange={(value) => handleUpdateHistorico(hist.id, 'observacao', value)}
                            />
                        </div>
                    ))}

                    {(data.historicosFamiliares || []).length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                            Nenhum registro adicionado. Clique em "Adicionar" para incluir.
                        </div>
                    )}
                </div>
            </div>

            {/* 9. Rotina Atual */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            9. Rotina Atual
                        </span>
                        <p className="text-xs text-muted-foreground">
                            (Esportes, música, entre outros)
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddAtividade}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Lista de Atividades */}
                <div className="space-y-3">
                    {(data.atividadesRotina || []).map((ativ, index) => (
                        <div
                            key={ativ.id}
                            className="rounded-2xl border bg-white p-4 space-y-4"
                        >
                            {/* Título da linha com botão de remover */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                    Atividade {index + 1}
                                </span>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveAtividade(ativ.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            
                            {/* Linha: Atividade, Horário e Frequência */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Atividade *"
                                        placeholder="Ex: Natação, Piano, Futebol..."
                                        value={ativ.atividade}
                                        onChange={(e) => handleUpdateAtividade(ativ.id, 'atividade', e.target.value)}
                                    />
                                </div>
                                <InputField
                                    label="Horário *"
                                    placeholder="Ex: 14:00 - 15:00"
                                    value={ativ.horario}
                                    onChange={(e) => handleUpdateAtividade(ativ.id, 'horario', e.target.value)}
                                />
                                <InputField
                                    label="Frequência"
                                    placeholder="Ex: 2x/semana"
                                    value={ativ.frequencia}
                                    onChange={(e) => handleUpdateAtividade(ativ.id, 'frequencia', e.target.value)}
                                />
                            </div>

                            {/* Observações da atividade */}
                            <AutoExpandTextarea
                                label="Observações"
                                description="(Quando começou; se adaptou bem? Apresenta problemas de comportamento para ir ou sair das atividades extracurriculares?)"
                                placeholder="Sua resposta"
                                value={ativ.observacao}
                                onChange={(value) => handleUpdateAtividade(ativ.id, 'observacao', value)}
                            />
                        </div>
                    ))}

                    {(data.atividadesRotina || []).length === 0 && (
                        <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                            Nenhuma atividade adicionada. Clique em "Adicionar" para incluir.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
