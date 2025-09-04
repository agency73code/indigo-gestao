import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { Terapeuta } from '../types/cadastros.types';

interface DadosProfissionaisStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string | string[]) => void;
    errors: Record<string, string>;
}

export default function DadosProfissionaisStep({
    data,
    onUpdate,
    errors,
}: DadosProfissionaisStepProps) {
    const [novaEspecialidade, setNovaEspecialidade] = useState('');
    const [novaFormaAtendimento, setNovaFormaAtendimento] = useState('');

    const adicionarEspecialidade = () => {
        if (novaEspecialidade.trim()) {
            const especialidades = data.especialidades || [];
            onUpdate('especialidades', [...especialidades, novaEspecialidade.trim()]);
            setNovaEspecialidade('');
        }
    };

    const removerEspecialidade = (index: number) => {
        const especialidades = data.especialidades || [];
        onUpdate(
            'especialidades',
            especialidades.filter((_, i) => i !== index),
        );
    };

    const adicionarFormaAtendimento = () => {
        if (novaFormaAtendimento.trim()) {
            const formas = data.formasAtendimento || [];
            onUpdate('formasAtendimento', [...formas, novaFormaAtendimento.trim()]);
            setNovaFormaAtendimento('');
        }
    };

    const removerFormaAtendimento = (index: number) => {
        const formas = data.formasAtendimento || [];
        onUpdate(
            'formasAtendimento',
            formas.filter((_, i) => i !== index),
        );
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Dados Profissionais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="crp">CRP *</Label>
                    <Input
                        id="crp"
                        value={data.crp || ''}
                        onChange={(e) => onUpdate('crp', e.target.value)}
                        placeholder="Ex: 06/123456"
                        className={errors.crp ? 'border-destructive' : ''}
                    />
                    {errors.crp && <p className="text-sm text-destructive">{errors.crp}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início *</Label>
                    <Input
                        id="dataInicio"
                        type="date"
                        value={data.dataInicio || ''}
                        onChange={(e) => onUpdate('dataInicio', e.target.value)}
                        className={errors.dataInicio ? 'border-destructive' : ''}
                    />
                    {errors.dataInicio && (
                        <p className="text-sm text-destructive">{errors.dataInicio}</p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="valorConsulta">Valor da Consulta (R$) *</Label>
                <Input
                    id="valorConsulta"
                    type="number"
                    step="0.01"
                    value={data.valorConsulta || ''}
                    onChange={(e) => onUpdate('valorConsulta', e.target.value)}
                    placeholder="150.00"
                    className={errors.valorConsulta ? 'border-destructive' : ''}
                />
                {errors.valorConsulta && (
                    <p className="text-sm text-destructive">{errors.valorConsulta}</p>
                )}
            </div>

            {/* Especialidades */}
            <div className="space-y-4">
                <Label>Especialidades *</Label>
                <div className="flex gap-2">
                    <Input
                        value={novaEspecialidade}
                        onChange={(e) => setNovaEspecialidade(e.target.value)}
                        placeholder="Ex: Psicologia Clínica"
                        onKeyPress={(e) => e.key === 'Enter' && adicionarEspecialidade()}
                    />
                    <button
                        type="button"
                        onClick={adicionarEspecialidade}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                    >
                        Adicionar
                    </button>
                </div>

                {data.especialidades && data.especialidades.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.especialidades.map((especialidade, index) => (
                            <div
                                key={index}
                                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                                {especialidade}
                                <button
                                    type="button"
                                    onClick={() => removerEspecialidade(index)}
                                    className="hover:text-destructive"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {errors.especialidades && (
                    <p className="text-sm text-destructive">{errors.especialidades}</p>
                )}
            </div>

            {/* Formas de Atendimento */}
            <div className="space-y-4">
                <Label>Formas de Atendimento *</Label>
                <div className="flex gap-2">
                    <Input
                        value={novaFormaAtendimento}
                        onChange={(e) => setNovaFormaAtendimento(e.target.value)}
                        placeholder="Ex: Presencial, Online"
                        onKeyPress={(e) => e.key === 'Enter' && adicionarFormaAtendimento()}
                    />
                    <button
                        type="button"
                        onClick={adicionarFormaAtendimento}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
                    >
                        Adicionar
                    </button>
                </div>

                {data.formasAtendimento && data.formasAtendimento.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.formasAtendimento.map((forma, index) => (
                            <div
                                key={index}
                                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                                {forma}
                                <button
                                    type="button"
                                    onClick={() => removerFormaAtendimento(index)}
                                    className="hover:text-destructive"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {errors.formasAtendimento && (
                    <p className="text-sm text-destructive">{errors.formasAtendimento}</p>
                )}
            </div>
        </div>
    );
}
