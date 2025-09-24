import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { DateField } from '@/common/components/layout/DateField';
import { Button } from '@/ui/button';
import { Combobox } from '@/ui/combobox';
import { Plus, X } from 'lucide-react';
import type { Terapeuta } from '../../types/cadastros.types';

interface DadosProfissionaisStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string | string[] | File | null | any) => void;
    errors: Record<string, string>;
}

const AREAS_ATUACAO_OPTIONS = [
    { value: 'Fonoaudiologia', label: 'Fonoaudiologia' },
    { value: 'Psicomotricidade', label: 'Psicomotricidade' },
    { value: 'Fisioterapia', label: 'Fisioterapia' },
    { value: 'Terapia Ocupacional', label: 'Terapia Ocupacional' },
    { value: 'Psicopedagogia', label: 'Psicopedagogia' },
    { value: 'Educador Físico', label: 'Educador Físico' },
    { value: 'Terapia ABA', label: 'Terapia ABA' },
    { value: 'Musicoterapia', label: 'Musicoterapia' },
    { value: 'Pedagogia', label: 'Pedagogia' },
    { value: 'Neuropsicologia', label: 'Neuropsicologia' },
    { value: 'Nutrição', label: 'Nutrição' },
];

const CARGOS_OPTIONS = [
    { value: 'Acompanhante Terapeutico', label: 'Acompanhante Terapeutico' },
    { value: 'Coordenador ABA', label: 'Coordenador ABA' },
    { value: 'Supervisor ABA', label: 'Supervisor ABA' },
    { value: 'Mediador de Conflitos', label: 'Mediador de Conflitos' },
    { value: 'Coordenador Executivo', label: 'Coordenador Executivo' },
    { value: 'Professor UniIndigo', label: 'Professor UniIndigo' },
    { value: 'Terapeuta clinico', label: 'Terapeuta clinico' },
    { value: 'Terapeuta Supervisor', label: 'Terapeuta Supervisor' },
    { value: 'Gerente', label: 'Gerente' },
];

export default function DadosProfissionaisStep({
    data,
    onUpdate,
    errors,
}: DadosProfissionaisStepProps) {
    const dadosProfissionais = data.dadosProfissionais || [
        { areaAtuacao: '', cargo: '', numeroConselho: '' },
    ];

    const handleDadoProfissionalChange = (index: number, field: string, value: string) => {
        const updatedDados = [...dadosProfissionais];
        updatedDados[index] = { ...updatedDados[index], [field]: value };
        onUpdate('dadosProfissionais', updatedDados);
    };

    const adicionarDadoProfissional = () => {
        const updatedDados = [
            ...dadosProfissionais,
            { areaAtuacao: '', cargo: '', numeroConselho: '' },
        ];
        onUpdate('dadosProfissionais', updatedDados);
    };

    const removerDadoProfissional = (index: number) => {
        if (dadosProfissionais.length > 1) {
            const updatedDados = dadosProfissionais.filter((_, i) => i !== index);
            onUpdate('dadosProfissionais', updatedDados);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h3 className="text-base sm:text-lg font-semibold">Dados Profissionais</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os dados profissionais do terapeuta. Campos marcados com * são
                    obrigatórios.
                </p>
            </div>

            {/* Conjuntos de Dados Profissionais */}
            {dadosProfissionais.map((dadoProfissional, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                            {index === 0
                                ? 'Área de Atuação Principal'
                                : `Área de Atuação ${index + 1}`}
                        </h4>
                        {index > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removerDadoProfissional(index)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                        {/* Área de Atuação */}
                        <div className="space-y-2">
                            <Label htmlFor={`areaAtuacao-${index}`}>
                                Área de Atuação {index === 0 ? '*' : ''}
                            </Label>
                            <Combobox
                                options={AREAS_ATUACAO_OPTIONS}
                                value={dadoProfissional.areaAtuacao || ''}
                                onValueChange={(value) =>
                                    handleDadoProfissionalChange(index, 'areaAtuacao', value)
                                }
                                placeholder="Selecione a área de atuação"
                                searchPlaceholder="Buscar área de atuação..."
                                emptyMessage="Nenhuma área de atuação encontrada."
                                error={!!errors[`dadosProfissionais.${index}.areaAtuacao`]}
                            />
                            {errors[`dadosProfissionais.${index}.areaAtuacao`] && (
                                <p className="text-sm text-destructive">
                                    {errors[`dadosProfissionais.${index}.areaAtuacao`]}
                                </p>
                            )}
                        </div>

                        {/* Cargo */}
                        <div className="space-y-2">
                            <Label htmlFor={`cargo-${index}`}>Cargo {index === 0 ? '*' : ''}</Label>
                            <Combobox
                                options={CARGOS_OPTIONS}
                                value={dadoProfissional.cargo || ''}
                                onValueChange={(value) =>
                                    handleDadoProfissionalChange(index, 'cargo', value)
                                }
                                placeholder="Selecione o cargo"
                                searchPlaceholder="Buscar cargo..."
                                emptyMessage="Nenhum cargo encontrado."
                                error={!!errors[`dadosProfissionais.${index}.cargo`]}
                            />
                            {errors[`dadosProfissionais.${index}.cargo`] && (
                                <p className="text-sm text-destructive">
                                    {errors[`dadosProfissionais.${index}.cargo`]}
                                </p>
                            )}
                        </div>

                        {/* Número do Conselho */}
                        <div className="space-y-2">
                            <Label htmlFor={`numeroConselho-${index}`}>Número do Conselho</Label>
                            <Input
                                id={`numeroConselho-${index}`}
                                value={dadoProfissional.numeroConselho || ''}
                                onChange={(e) =>
                                    handleDadoProfissionalChange(
                                        index,
                                        'numeroConselho',
                                        e.target.value,
                                    )
                                }
                                placeholder="Ex: CRP 06/123456"
                                className={
                                    errors[`dadosProfissionais.${index}.numeroConselho`]
                                        ? 'border-destructive'
                                        : ''
                                }
                            />
                            {errors[`dadosProfissionais.${index}.numeroConselho`] && (
                                <p className="text-sm text-destructive">
                                    {errors[`dadosProfissionais.${index}.numeroConselho`]}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Botão para adicionar novo conjunto */}
            <Button
                type="button"
                variant="outline"
                onClick={adicionarDadoProfissional}
                className="w-full flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                Adicionar outra Área de Atuação
            </Button>

            <div className="border rounded-[5px] p-4 space-y-3">
                <div className="space-y-2 md:max-w-sm">
                    <Label htmlFor="professorUnindigo">É um professor(a) UniÍndigo?</Label>
                    <select
                        id="professorUnindigo"
                        value={data.professorUnindigo || ''}
                        onChange={(e) => onUpdate('professorUnindigo', e.target.value)}
                        aria-describedby="professorUnindigo-help"
                        className={`flex h-10 w-full rounded-[5px] border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors.professorUnindigo ? 'border-destructive' : ''}`}
                    >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                    </select>
                    <p className="text-xs text-muted-foreground mt-1">
                        {data.professorUnindigo === 'sim'
                            ? 'Informe a disciplina no campo abaixo.'
                            : data.professorUnindigo === 'nao'
                              ? 'Marque “Sim” apenas se o profissional leciona na UniÍndigo.'
                              : 'Selecione uma opção.'}
                    </p>
                </div>

                {data.professorUnindigo === 'sim' && (
                    <div className="space-y-2 md:max-w-sm">
                        <Label htmlFor="disciplinaUniindigo">Disciplina</Label>
                        <Input
                            id="disciplinaUniindigo"
                            value={data.disciplinaUniindigo || ''}
                            onChange={(e) => onUpdate('disciplinaUniindigo', e.target.value)}
                            placeholder="Informe a disciplina"
                            className={errors.disciplinaUniindigo ? 'border-destructive' : ''}
                        />
                        {errors.disciplinaUniindigo && (
                            <p className="text-sm text-destructive">{errors.disciplinaUniindigo}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Datas de Início e Fim */}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                <div className="space-y-2">
                    <Label htmlFor="dataInicio">Data de Início *</Label>
                    <DateField
                        value={data.dataInicio || ''}
                        onChange={(iso) => onUpdate('dataInicio', iso)}
                        placeholder="dd/mm/aaaa"
                    />
                    {errors.dataInicio && (
                        <p className="text-sm text-destructive">{errors.dataInicio}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <DateField
                        value={data.dataFim || ''}
                        onChange={(iso) => onUpdate('dataFim', iso)}
                        placeholder="dd/mm/aaaa"
                        error={errors.dataFim}
                        clearable={true}
                    />
                    {errors.dataFim && <p className="text-sm text-destructive">{errors.dataFim}</p>}
                </div>
            </div>
        </div>
    );
}
