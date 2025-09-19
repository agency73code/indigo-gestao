import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import type { Terapeuta } from '../../types/cadastros.types';

interface FormacaoStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
}

export default function FormacaoStep({ data, onUpdate, errors }: FormacaoStepProps) {
    const handleFormacaoChange = (field: string, value: any) => {
        onUpdate(`formacao.${field}`, value);
    };

    const posGraduacoes = data.formacao?.posGraduacoes || [];

    const handlePosChange = (index: number, field: string, value: any) => {
        const list = [...posGraduacoes];
        list[index] = { ...list[index], [field]: value };
        handleFormacaoChange('posGraduacoes', list);
    };

    const addPos = () => {
        const list = [
            ...posGraduacoes,
            { tipo: 'lato' as 'lato' | 'stricto', curso: '', instituicao: '', conclusao: '' },
        ];
        handleFormacaoChange('posGraduacoes', list);
    };

    const removePos = (index: number) => {
        const list = posGraduacoes.filter((_, i) => i !== index);
        handleFormacaoChange('posGraduacoes', list);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold">Formação Acadêmica</h3>

            {/* Graduação */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-primary">Graduação</h4>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="graduacao">Curso de Graduação *</Label>
                        <Input
                            id="graduacao"
                            value={data.formacao?.graduacao || ''}
                            onChange={(e) => handleFormacaoChange('graduacao', e.target.value)}
                            placeholder="Ex: Psicologia"
                            className={errors['formacao.graduacao'] ? 'border-destructive' : ''}
                            aria-describedby="graduacao-error"
                        />
                        {errors['formacao.graduacao'] && (
                            <p id="graduacao-error" className="text-sm text-destructive">
                                {errors['formacao.graduacao']}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="anoFormatura">Ano de Conclusão *</Label>
                        <Input
                            id="anoFormatura"
                            type="number"
                            min="1900"
                            max={new Date().getFullYear() + 10}
                            value={data.formacao?.anoFormatura || ''}
                            onChange={(e) => handleFormacaoChange('anoFormatura', e.target.value)}
                            placeholder="2020"
                            className={errors['formacao.anoFormatura'] ? 'border-destructive' : ''}
                            aria-describedby="anoFormatura-error"
                        />
                        {errors['formacao.anoFormatura'] && (
                            <p id="anoFormatura-error" className="text-sm text-destructive">
                                {errors['formacao.anoFormatura']}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="instituicaoGraduacao">Instituição *</Label>
                        <Input
                            id="instituicaoGraduacao"
                            value={data.formacao?.instituicaoGraduacao || ''}
                            onChange={(e) => handleFormacaoChange('instituicaoGraduacao', e.target.value)}
                            placeholder="Ex: Universidade de São Paulo"
                            className={errors['formacao.instituicaoGraduacao'] ? 'border-destructive' : ''}
                            aria-describedby="instituicaoGraduacao-error"
                        />
                        {errors['formacao.instituicaoGraduacao'] && (
                            <p id="instituicaoGraduacao-error" className="text-sm text-destructive">
                                {errors['formacao.instituicaoGraduacao']}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Pós-Graduação (múltiplas) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-primary">Pós-graduação</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addPos} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Adicionar pós-graduação
                    </Button>
                </div>

                {posGraduacoes.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma pós-graduação adicionada.</p>
                )}

                {posGraduacoes.map((pos, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <h5 className="font-medium">Pós-graduação {index + 1}</h5>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removePos(index)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                            <div className="space-y-2">
                                <Label htmlFor={`pos-tipo-${index}`}>Tipo *</Label>
                                <select
                                    id={`pos-tipo-${index}`}
                                    value={pos.tipo || ''}
                                    onChange={(e) => handlePosChange(index, 'tipo', e.target.value as 'lato' | 'stricto')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="">Selecione</option>
                                    <option value="lato">Lato Sensu</option>
                                    <option value="stricto">Stricto Sensu</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`pos-curso-${index}`}>Curso *</Label>
                                <Input
                                    id={`pos-curso-${index}`}
                                    value={pos.curso || ''}
                                    onChange={(e) => handlePosChange(index, 'curso', e.target.value)}
                                    placeholder="Ex: Especialização em TCC"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor={`pos-instituicao-${index}`}>Instituição *</Label>
                                <Input
                                    id={`pos-instituicao-${index}`}
                                    value={pos.instituicao || ''}
                                    onChange={(e) => handlePosChange(index, 'instituicao', e.target.value)}
                                    placeholder="Ex: Instituto de Psicologia"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                            <div className="space-y-2 md:max-w-xs">
                                <Label htmlFor={`pos-conclusao-${index}`}>Conclusão *</Label>
                                <Input
                                    id={`pos-conclusao-${index}`}
                                    type="month"
                                    value={pos.conclusao || ''}
                                    onChange={(e) => handlePosChange(index, 'conclusao', e.target.value)}
                                    placeholder="AAAA-MM"
                                />
                            </div>
                            {/* Se já houver upload/comprovante no projeto, este campo pode ser adaptado posteriormente */}
                        </div>
                    </div>
                ))}
            </div>

            {/* Descritivos */}
            <div className="space-y-4">
                <h4 className="text-md font-medium text-primary">Participação em Congressos</h4>
                <div className="space-y-2">
                    <Label htmlFor="participacaoCongressosDescricao">Descrição</Label>
                    <textarea
                        id="participacaoCongressosDescricao"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.formacao?.participacaoCongressosDescricao || ''}
                        onChange={(e) => handleFormacaoChange('participacaoCongressosDescricao', e.target.value)}
                        placeholder="Descreva participações relevantes, datas/eventos"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-md font-medium text-primary">Publicações e Livros</h4>
                <div className="space-y-2">
                    <Label htmlFor="publicacoesLivrosDescricao">Descrição</Label>
                    <textarea
                        id="publicacoesLivrosDescricao"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={data.formacao?.publicacoesLivrosDescricao || ''}
                        onChange={(e) => handleFormacaoChange('publicacoesLivrosDescricao', e.target.value)}
                        placeholder="Liste publicações, livros, veículos/ano"
                    />
                </div>
            </div>
        </div>
    );
}





