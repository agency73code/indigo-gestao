/**
 * Componente de Avaliação da Demanda
 * Estilo Google Forms
 */

import { Plus, Trash2 } from 'lucide-react';
import { AutoExpandTextarea } from '@/components/ui/auto-expand-textarea';
import { Button } from '@/ui/button';
import { InputField } from '@/ui/input-field';
import { Switch } from '@/components/ui/switch';
import type { ProntuarioFormData, TerapiaPrevia } from '../types';

interface AvaliacaoDemandaProps {
    data: ProntuarioFormData;
    onChange: (data: ProntuarioFormData) => void;
    fieldErrors?: Record<string, string>;
}

export default function AvaliacaoDemanda({ 
    data, 
    onChange, 
    fieldErrors = {} 
}: AvaliacaoDemandaProps) {
    
    // Handlers para Terapias Prévias
    const handleAddTerapia = () => {
        const novaTerapia: TerapiaPrevia = {
            id: String(Date.now()) + '-' + Math.random().toString(36).substr(2, 9),
            profissional: '',
            especialidadeAbordagem: '',
            tempoIntervencao: '',
            observacao: '',
            ativo: true,
            origemAnamnese: false,
        };
        onChange({ 
            ...data, 
            terapiasPrevias: [...(data.terapiasPrevias || []), novaTerapia] 
        });
    };

    const handleUpdateTerapia = (id: string, field: keyof TerapiaPrevia, value: any) => {
        const updated = (data.terapiasPrevias || []).map((ter) =>
            ter.id === id ? { ...ter, [field]: value } : ter
        );
        onChange({ ...data, terapiasPrevias: updated });
    };

    const handleRemoveTerapia = (id: string) => {
        const updated = (data.terapiasPrevias || []).filter((ter) => ter.id !== id);
        onChange({ ...data, terapiasPrevias: updated });
    };

    // Separar terapias da anamnese das adicionadas manualmente
    const terapiasDaAnamnese = (data.terapiasPrevias || []).filter(t => t.origemAnamnese);
    const terapiasAdicionadas = (data.terapiasPrevias || []).filter(t => !t.origemAnamnese);

    return (
        <div className="space-y-3">
            {/* Encaminhado por */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Encaminhado por"
                    description="Caso tenha buscado por conta própria, basta sinalizar"
                    placeholder="Sua resposta"
                    value={data.encaminhadoPor || ''}
                    onChange={(value) => onChange({ ...data, encaminhadoPor: value })}
                />
            </div>

            {/* Motivo da busca pelo atendimento */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Motivo da busca pelo atendimento"
                    description="Descrever de forma sucinta as principais queixas apresentadas"
                    placeholder="Sua resposta"
                    value={data.motivoBuscaAtendimento || ''}
                    onChange={(value) => onChange({ ...data, motivoBuscaAtendimento: value })}
                    required
                    error={fieldErrors.motivoBuscaAtendimento}
                />
            </div>

            {/* Terapias Prévias e/ou em Andamento */}
            <div className="rounded-2xl border bg-white p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-sm font-medium">
                            Terapias Prévias e/ou em Andamento
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Terapias cadastradas na anamnese serão exibidas automaticamente
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTerapia}
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Adicionar
                    </Button>
                </div>

                {/* Terapias da Anamnese (somente visualização) */}
                {terapiasDaAnamnese.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">Da Anamnese:</p>
                        {terapiasDaAnamnese.map((terapia) => (
                            <div 
                                key={terapia.id}
                                className="p-3 border rounded-lg bg-muted/30"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-sm">{terapia.profissional}</p>
                                        <p className="text-xs text-muted-foreground">{terapia.especialidadeAbordagem}</p>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        terapia.ativo 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {terapia.ativo ? 'Ativo' : 'Finalizado'}
                                    </span>
                                </div>
                                {terapia.tempoIntervencao && (
                                    <p className="text-xs mt-1">Tempo: {terapia.tempoIntervencao}</p>
                                )}
                                {terapia.observacao && (
                                    <p className="text-xs mt-1 text-muted-foreground">{terapia.observacao}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Terapias Adicionadas Manualmente (editáveis) */}
                {terapiasAdicionadas.length > 0 && (
                    <div className="space-y-3">
                        {terapiasDaAnamnese.length > 0 && (
                            <p className="text-xs text-muted-foreground font-medium">Adicionadas:</p>
                        )}
                        {terapiasAdicionadas.map((terapia, index) => (
                            <div
                                key={terapia.id}
                                className="rounded-xl border bg-white p-4 space-y-4"
                            >
                                {/* Título da linha com switch e botão de remover */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-foreground">
                                            Terapia {terapiasDaAnamnese.length + index + 1}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Switch
                                                checked={terapia.ativo ?? true}
                                                onCheckedChange={(checked) => handleUpdateTerapia(terapia.id, 'ativo', checked)}
                                            />
                                            <span className={`text-xs ${terapia.ativo ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                {terapia.ativo ? 'Em andamento' : 'Encerrada'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemoveTerapia(terapia.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                
                                {/* Linha 1: Profissional, Especialidade/Abordagem, Tempo de Intervenção */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputField
                                        label="Profissional *"
                                        placeholder="Nome do profissional"
                                        value={terapia.profissional}
                                        onChange={(e) => handleUpdateTerapia(terapia.id, 'profissional', e.target.value)}
                                        error={fieldErrors[`terapiasPrevias.${index}.profissional`]}
                                    />
                                    <InputField
                                        label="Especialidade/Abordagem *"
                                        placeholder="Ex: TO, Fono, ABA..."
                                        value={terapia.especialidadeAbordagem}
                                        onChange={(e) => handleUpdateTerapia(terapia.id, 'especialidadeAbordagem', e.target.value)}
                                        error={fieldErrors[`terapiasPrevias.${index}.especialidadeAbordagem`]}
                                    />
                                    <InputField
                                        label="Tempo de Intervenção"
                                        placeholder="Ex: 1 ano, 6 meses..."
                                        value={terapia.tempoIntervencao}
                                        onChange={(e) => handleUpdateTerapia(terapia.id, 'tempoIntervencao', e.target.value)}
                                    />
                                </div>
                                
                                {/* Linha 2: Observações */}
                                <AutoExpandTextarea
                                    label="Observações"
                                    description="(Quantas horas semanais de intervenção fez; assiduidade; motivo do encerramento com o prestador de serviço)"
                                    placeholder="Sua resposta"
                                    value={terapia.observacao || ''}
                                    onChange={(value) => handleUpdateTerapia(terapia.id, 'observacao', value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Estado vazio */}
                {(data.terapiasPrevias || []).length === 0 && (
                    <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-xl">
                        Nenhuma terapia prévia encontrada. Clique em "Adicionar" para incluir.
                    </div>
                )}
            </div>

            {/* Atendimentos anteriores */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Atendimentos anteriores"
                    description="Registrar acompanhamento psicológico anterior, duração e motivo do encerramento"
                    placeholder="Sua resposta"
                    value={data.atendimentosAnteriores || ''}
                    onChange={(value) => onChange({ ...data, atendimentosAnteriores: value })}
                />
            </div>

            {/* Observações */}
            <div className="rounded-2xl border bg-white p-4">
                <AutoExpandTextarea
                    label="Observações"
                    description="Acompanhamento psiquiátrico, diagnóstico médico, medicação e tempo de tratamento"
                    placeholder="Sua resposta"
                    value={data.observacoesAvaliacao || ''}
                    onChange={(value) => onChange({ ...data, observacoesAvaliacao: value })}
                />
            </div>
        </div>
    );
}
