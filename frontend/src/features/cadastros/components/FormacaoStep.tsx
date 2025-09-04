import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import type { Terapeuta } from '../types/cadastros.types';

interface FormacaoStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function FormacaoStep({ data, onUpdate, errors }: FormacaoStepProps) {
    const handleFormacaoChange = (field: string, value: string) => {
        onUpdate(`formacao.${field}`, value);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Formação Acadêmica</h3>

            {/* Graduação */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-primary">Graduação *</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="graduacao">Curso de Graduação *</Label>
                        <Input
                            id="graduacao"
                            value={data.formacao?.graduacao || ''}
                            onChange={(e) => handleFormacaoChange('graduacao', e.target.value)}
                            placeholder="Ex: Psicologia"
                            className={errors['formacao.graduacao'] ? 'border-destructive' : ''}
                        />
                        {errors['formacao.graduacao'] && (
                            <p className="text-sm text-destructive">
                                {errors['formacao.graduacao']}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instituicaoGraduacao">Instituição *</Label>
                        <Input
                            id="instituicaoGraduacao"
                            value={data.formacao?.instituicaoGraduacao || ''}
                            onChange={(e) =>
                                handleFormacaoChange('instituicaoGraduacao', e.target.value)
                            }
                            placeholder="Ex: Universidade de São Paulo"
                            className={
                                errors['formacao.instituicaoGraduacao'] ? 'border-destructive' : ''
                            }
                        />
                        {errors['formacao.instituicaoGraduacao'] && (
                            <p className="text-sm text-destructive">
                                {errors['formacao.instituicaoGraduacao']}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="anoFormatura">Ano de Formatura *</Label>
                        <Input
                            id="anoFormatura"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear()}
                            value={data.formacao?.anoFormatura || ''}
                            onChange={(e) => handleFormacaoChange('anoFormatura', e.target.value)}
                            placeholder="2020"
                            className={errors['formacao.anoFormatura'] ? 'border-destructive' : ''}
                        />
                        {errors['formacao.anoFormatura'] && (
                            <p className="text-sm text-destructive">
                                {errors['formacao.anoFormatura']}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pós-Graduação */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-primary">Pós-Graduação (Opcional)</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="posGraduacao">Curso de Pós-Graduação</Label>
                        <Input
                            id="posGraduacao"
                            value={data.formacao?.posGraduacao || ''}
                            onChange={(e) => handleFormacaoChange('posGraduacao', e.target.value)}
                            placeholder="Ex: Especialização em Terapia Cognitivo-Comportamental"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instituicaoPosGraduacao">Instituição</Label>
                        <Input
                            id="instituicaoPosGraduacao"
                            value={data.formacao?.instituicaoPosGraduacao || ''}
                            onChange={(e) =>
                                handleFormacaoChange('instituicaoPosGraduacao', e.target.value)
                            }
                            placeholder="Ex: Instituto de Psicologia"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="anoPosGraduacao">Ano de Conclusão</Label>
                        <Input
                            id="anoPosGraduacao"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear() + 10}
                            value={data.formacao?.anoPosGraduacao || ''}
                            onChange={(e) =>
                                handleFormacaoChange('anoPosGraduacao', e.target.value)
                            }
                            placeholder="2022"
                        />
                    </div>
                </div>
            </div>

            {/* Cursos Adicionais */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-primary">
                    Cursos e Certificações Adicionais
                </h4>

                <div className="space-y-2">
                    <Label htmlFor="cursos">Cursos e Certificações</Label>
                    <textarea
                        id="cursos"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.formacao?.cursos || ''}
                        onChange={(e) => handleFormacaoChange('cursos', e.target.value)}
                        placeholder="Descreva cursos complementares, workshops, certificações relevantes..."
                    />
                </div>
            </div>
        </div>
    );
}
