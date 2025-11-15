import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import type { Terapeuta } from '../../types/cadastros.types';
import { InputField } from '@/ui/input-field';
import { SelectFieldRadix, SelectItem } from '@/ui/select-field-radix';
import { TextAreaField } from '@/ui/textarea-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';

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
        const list = posGraduacoes.filter((_: any, i: number) => i !== index);
        handleFormacaoChange('posGraduacoes', list);
    };

    return (
        <div className="space-y-4 md:space-y-6">
            

            {/* Graduação */}
            <div className="space-y-4">

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                    <InputField
                        id="graduacao"
                        label="Curso de Graduação"
                        value={data.formacao?.graduacao || ''}
                        onChange={(e) => handleFormacaoChange('graduacao', e.target.value)}
                        placeholder="Ex: Psicologia"
                        error={errors['formacao.graduacao']}
                        required
                    />

                    <InputField
                        id="anoFormatura"
                        label="Ano de Conclusão"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear() + 10}
                        value={data.formacao?.anoFormatura || ''}
                        onChange={(e) => handleFormacaoChange('anoFormatura', e.target.value)}
                        placeholder="2020"
                        error={errors['formacao.anoFormatura']}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 md:gap-4">
                    <InputField
                        id="instituicaoGraduacao"
                        label="Instituição"
                        value={data.formacao?.instituicaoGraduacao || ''}
                        onChange={(e) =>
                            handleFormacaoChange('instituicaoGraduacao', e.target.value)
                        }
                        placeholder="Ex: Universidade de São Paulo"
                        error={errors['formacao.instituicaoGraduacao']}
                        required
                    />
                </div>
            </div>

            {/* Pós-Graduação (múltiplas) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addPos}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Adicionar pós-graduação
                    </Button>
                </div>

              

                {posGraduacoes.map((pos: any, index: number) => (
                    <div key={index} className="space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <h5 
                                style={{ 
                                    fontFamily: "var(--hub-card-title-font-family)",
                                    fontWeight: "var(--hub-card-title-font-weight)",
                                    color: "var(--hub-card-title-color)"
                                }}
                                className="text-base sm:text-lg leading-none tracking-tight"
                            >
                                Pós-graduação {index + 1}
                            </h5>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removePos(index)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                                <SelectFieldRadix
                                    label="Tipo *"
                                    value={pos.tipo || ''}
                                    onValueChange={(value) =>
                                        handlePosChange(
                                            index,
                                            'tipo',
                                            value as 'lato' | 'stricto',
                                        )
                                    }
                                    placeholder="Selecione"
                                >
                                    <SelectItem value="lato">Lato Sensu</SelectItem>
                                    <SelectItem value="stricto">Stricto Sensu</SelectItem>
                                </SelectFieldRadix>

                                <div className="md:col-span-2">
                                    <InputField
                                        id={`pos-curso-${index}`}
                                        label="Curso"
                                        value={pos.curso || ''}
                                        onChange={(e) =>
                                            handlePosChange(index, 'curso', e.target.value)
                                        }
                                        placeholder="Ex: Especialização em TCC"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                                <div className="md:col-span-2">
                                    <InputField
                                        id={`pos-instituicao-${index}`}
                                        label="Instituição"
                                        value={pos.instituicao || ''}
                                        onChange={(e) =>
                                            handlePosChange(index, 'instituicao', e.target.value)
                                        }
                                        placeholder="Ex: Instituto de Psicologia"
                                        required
                                    />
                                </div>

                                <DateFieldWithLabel
                                    label="Conclusão *"
                                    value={pos.conclusao || ''}
                                    onChange={(value) => handlePosChange(index, 'conclusao', value)}
                                />
                            </div>
                        </div>

                        {/* Se já houver upload/comprovante no projeto, este campo pode ser adaptado posteriormente */}
                    </div>
                ))}
            </div>

            {/* Descritivos */}
            <div className="space-y-4">
                <TextAreaField
                    id="participacaoCongressosDescricao"
                    label="Participação em Congressos"
                    value={data.formacao?.participacaoCongressosDescricao || ''}
                    onChange={(e) =>
                        handleFormacaoChange('participacaoCongressosDescricao', e.target.value)
                    }
                    placeholder="Descreva participações relevantes, datas/eventos"
                />
            </div>

            <div className="space-y-4">
                <TextAreaField
                    id="publicacoesLivrosDescricao"
                    label="Publicações e Livros"
                    value={data.formacao?.publicacoesLivrosDescricao || ''}
                    onChange={(e) =>
                        handleFormacaoChange('publicacoesLivrosDescricao', e.target.value)
                    }
                    placeholder="Liste publicações, livros, veículos/ano"
                />
            </div>
        </div>
    );
}
