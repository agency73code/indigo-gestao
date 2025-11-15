import { useEffect, useState } from 'react';
import { InputField } from '@/ui/input-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import { SelectFieldRadix, SelectItem } from '@/ui/select-field-radix';
import { ComboboxField } from '@/ui/combobox-field';
import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import { fetchProfessionalMetadata } from '@/lib/api';
import type { Terapeuta } from '../../types/cadastros.types';

interface DadosProfissionaisStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string | string[] | File | null | any) => void;
    errors: Record<string, string>;
}

type ComboboxOption = {
    value: string;
    label: string;
};

type DadoProfissional = NonNullable<Terapeuta['dadosProfissionais']>[number];

export default function DadosProfissionaisStep({
    data,
    onUpdate,
    errors,
}: DadosProfissionaisStepProps) {
    const [areaOptions, setAreaOptions] = useState<ComboboxOption[]>([]);
    const [cargoOptions, setCargoOptions] = useState<ComboboxOption[]>([]);

    useEffect(() => {
        let isMounted = true;

        async function loadMetadata() {
            try {
                const metadata = await fetchProfessionalMetadata();
                if (!isMounted) return;
                
                setAreaOptions(
                    metadata.areasAtuacao.map((area) => ({
                        value: String(area.id),
                        label: area.nome,
                    })),
                );
                setCargoOptions(
                    metadata.cargos.map((cargo) => ({
                        value: String(cargo.id),
                        label: cargo.nome,
                    })),
                );
            } catch (error) {
                console.error('Falha ao carregar metadados profissionais:', error);
            }
        }

        loadMetadata();
        
        return () => {
            isMounted = false;
        };
    }, []);

    const dadosProfissionais = (data.dadosProfissionais?.length
        ? data.dadosProfissionais
        : [
            {
                areaAtuacao: '',
                areaAtuacaoId: null,
                cargo: '',
                cargoId: null,
                numeroConselho: '',
            },
        ]) as DadoProfissional[];

    const handleDadoProfissionalChange = <K extends keyof DadoProfissional>(
        index: number,
        field: K,
        value: DadoProfissional[K],
    ) => {
        const updatedDados = [...dadosProfissionais];
        updatedDados[index] = { ...updatedDados[index], [field]: value };
        onUpdate('dadosProfissionais', updatedDados);
    };

    const handleAreaAtuacaoSelect = (index: number, value: string) => {
        const option = areaOptions.find((item) => item.value === value);
        const updated = [...dadosProfissionais];
        updated[index] = {
            ...updated[index],
            areaAtuacaoId: value || null,
            areaAtuacao: option?.label ?? '',
        };
        onUpdate('dadosProfissionais', updated);
    };

    const handleCargoSelect = (index: number, value: string) => {
        const option = cargoOptions.find((item) => item.value === value);
        const updated = [...dadosProfissionais];
        updated[index] = {
            ...updated[index],
            cargoId: value || null,
            cargo: option?.label ?? '',
        };
        onUpdate('dadosProfissionais', updated);
    };

    const adicionarDadoProfissional = () => {
        const updatedDados = [
            ...dadosProfissionais,
            {
                areaAtuacao: '',
                areaAtuacaoId: null,
                cargo: '',
                cargoId: null,
                numeroConselho: '',
            },
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
        <div className="space-y-4 md:space-y-4">
           

            {/* Conjuntos de Dados Profissionais */}
            {dadosProfissionais.map((dadoProfissional, index) => (
                <div key={index} className="relative">
                    <div className="flex items-center justify-between">
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
                        <ComboboxField
                            label={`Área de Atuação ${index === 0 ? '*' : ''}`}
                            options={areaOptions}
                            value={
                                dadoProfissional.areaAtuacaoId &&
                                dadoProfissional.areaAtuacaoId !== ''
                                    ? String(dadoProfissional.areaAtuacaoId)
                                    : ''
                            }
                            onValueChange={(value) => handleAreaAtuacaoSelect(index, value)}
                            placeholder="Selecione a área de atuação"
                            searchPlaceholder="Buscar área de atuação..."
                            emptyMessage="Nenhuma área de atuação encontrada."
                            error={errors[`dadosProfissionais.${index}.areaAtuacao`]}
                        />

                        {/* Cargo */}
                        <ComboboxField
                            label={`Cargo ${index === 0 ? '*' : ''}`}
                            options={cargoOptions}
                            value={
                                dadoProfissional.cargoId &&
                                dadoProfissional.cargoId !== ''
                                    ? String(dadoProfissional.cargoId)
                                    : ''
                            }
                            onValueChange={(value) => handleCargoSelect(index, value)}
                            placeholder="Selecione o cargo"
                            searchPlaceholder="Buscar cargo..."
                            emptyMessage="Nenhum cargo encontrado."
                            error={errors[`dadosProfissionais.${index}.cargo`]}
                        />

                        {/* Número do Conselho */}
                        <div>
                            <InputField
                                label="Número do Conselho"
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
                                error={errors[`dadosProfissionais.${index}.numeroConselho`]}
                            />
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

            {/* Professor UniÍndigo e Disciplina + Datas de Início e Fim */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                <div>
                    <SelectFieldRadix
                        label="É um professor(a) UniÍndigo?"
                        value={data.professorUnindigo || ''}
                        onValueChange={(value) => onUpdate('professorUnindigo', value)}
                        error={errors.professorUnindigo}
                        placeholder="Selecione"
                    >
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                    </SelectFieldRadix>
                </div>

                {data.professorUnindigo === 'sim' && (
                    <div>
                        <InputField
                            label="Disciplina"
                            id="disciplinaUniindigo"
                            value={data.disciplinaUniindigo || ''}
                            onChange={(e) => onUpdate('disciplinaUniindigo', e.target.value)}
                            placeholder="Informe a disciplina"
                            error={errors.disciplinaUniindigo}
                        />
                    </div>
                )}

                <div>
                    <DateFieldWithLabel
                        label="Data de Início *"
                        value={data.dataInicio || ''}
                        onChange={(iso) => onUpdate('dataInicio', iso)}
                        placeholder="dd/mm/aaaa"
                        error={errors.dataInicio}
                    />
                </div>

                <div>
                    <DateFieldWithLabel
                        label="Data de Fim"
                        value={data.dataFim || ''}
                        onChange={(iso) => onUpdate('dataFim', iso)}
                        placeholder="dd/mm/aaaa"
                        error={errors.dataFim}
                        clearable={true}
                    />
                </div>
            </div>
        </div>
    );
}
