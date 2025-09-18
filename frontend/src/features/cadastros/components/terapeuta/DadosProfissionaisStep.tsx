import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import type { Terapeuta } from '../../types/cadastros.types';

interface DadosProfissionaisStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string | string[] | File | null | any) => void;
    errors: Record<string, string>;
}

const AREAS_ATUACAO = [
    'Fonoaudiologia',
    'Psicomotricidade',
    'Fisioterapia',
    'Terapia Ocupacional',
    'Psicopedagogia',
    'Educador Físico',
    'Terapia ABA',
    'Musicoterapia',
    'Pedagogia',
    'Neuropsicologia',
    'Nutrição',
];

const CARGOS = [
    'Acompanhante Terapeutico',
    'Coordenador ABA',
    'Supervisor ABA',
    'Mediador de Conflitos',
    'Coordenador Executivo',
    'Professor UniIndigo',
    'Terapeuta clinico',
    'Terapeuta Supervisor',
    'Gerente',
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
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Dados Profissionais</h3>
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Área de Atuação */}
                        <div className="space-y-2">
                            <Label htmlFor={`areaAtuacao-${index}`}>
                                Área de Atuação {index === 0 ? '*' : ''}
                            </Label>
                            <select
                                id={`areaAtuacao-${index}`}
                                value={dadoProfissional.areaAtuacao || ''}
                                onChange={(e) =>
                                    handleDadoProfissionalChange(
                                        index,
                                        'areaAtuacao',
                                        e.target.value,
                                    )
                                }
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    errors[`dadosProfissionais.${index}.areaAtuacao`]
                                        ? 'border-destructive'
                                        : ''
                                }`}
                            >
                                <option value="">Selecione a área de atuação</option>
                                {AREAS_ATUACAO.map((area) => (
                                    <option key={area} value={area}>
                                        {area}
                                    </option>
                                ))}
                            </select>
                            {errors[`dadosProfissionais.${index}.areaAtuacao`] && (
                                <p className="text-sm text-destructive">
                                    {errors[`dadosProfissionais.${index}.areaAtuacao`]}
                                </p>
                            )}
                        </div>

                        {/* Cargo */}
                        <div className="space-y-2">
                            <Label htmlFor={`cargo-${index}`}>Cargo {index === 0 ? '*' : ''}</Label>
                            <select
                                id={`cargo-${index}`}
                                value={dadoProfissional.cargo || ''}
                                onChange={(e) =>
                                    handleDadoProfissionalChange(index, 'cargo', e.target.value)
                                }
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    errors[`dadosProfissionais.${index}.cargo`]
                                        ? 'border-destructive'
                                        : ''
                                }`}
                            >
                                <option value="">Selecione o cargo</option>
                                {CARGOS.map((cargo) => (
                                    <option key={cargo} value={cargo}>
                                        {cargo}
                                    </option>
                                ))}
                            </select>
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
                    <Label htmlFor="professorUnindigo">Professor UniÍndigo</Label>
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
                    <p id="professorUnindigo-help" className="text-xs text-muted-foreground">
                        Marque se o profissional leciona na UniÍndigo.
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                    <Label htmlFor="dataFim">Data de Fim</Label>
                    <Input
                        id="dataFim"
                        type="date"
                        value={data.dataFim || ''}
                        onChange={(e) => onUpdate('dataFim', e.target.value)}
                        className={errors.dataFim ? 'border-destructive' : ''}
                    />
                    {errors.dataFim && <p className="text-sm text-destructive">{errors.dataFim}</p>}
                </div>
            </div>
        </div>
    );
}









