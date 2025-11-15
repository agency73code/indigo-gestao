import { InputField } from '@/ui/input-field';
import { SelectField } from '@/ui/select-field';
import { Button } from '@/ui/button';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useCepLookup } from '../../hooks/useCepLookup';
import { maskCEP } from '@/common/utils/mask';

interface Endereco {
    cep: string | null;
    logradouro: string | null;
    numero: string | null;
    complemento: string | null;
    bairro: string | null;
    cidade: string | null;
    uf: string | null;
    residenciaDe?: string | null;
    outroResidencia?: string | null;
}

interface EnderecoFormProps {
    endereco: Endereco;
    index: number;
    onUpdate: (index: number, field: string, value: string) => void;
    onRemove: (index: number) => void;
    errors: Record<string, string>;
    onBlur: (field: string) => void;
}

export default function EnderecoForm({
    endereco,
    index,
    onUpdate,
    onRemove,
    errors,
    onBlur,
}: EnderecoFormProps) {
    const { data, error } = useCepLookup(endereco.cep || '');

    useEffect(() => {
        if (!data) return;

        const nextLogradouro = data.logradouro ?? '';
        const nextBairro = data.bairro ?? '';
        const nextCidade = data.cidade ?? '';
        const nextUf = data.uf ?? '';

        if (endereco.logradouro !== nextLogradouro) onUpdate(index, 'logradouro', nextLogradouro);
        if (endereco.bairro !== nextBairro) onUpdate(index, 'bairro', nextBairro);
        if (endereco.cidade !== nextCidade) onUpdate(index, 'cidade', nextCidade);
        if (endereco.uf !== nextUf) onUpdate(index, 'uf', nextUf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, index, endereco.logradouro, endereco.bairro, endereco.cidade, endereco.uf]);

    return (
        <div className="space-y-4 relative">
            <div className="flex items-center justify-between">
                <h4 
                    style={{ 
                        fontFamily: "var(--hub-card-title-font-family)",
                        fontWeight: "var(--hub-card-title-font-weight)",
                        color: "var(--hub-card-title-color)"
                    }}
                    className="leading-none tracking-tight"
                >
                    {index === 0 ? 'Endereço Principal' : `Endereço ${index + 1}`}
                </h4>
                {index > 0 && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemove(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Residência de */}
            <div className="space-y-4">
                <SelectField
                    label="Residência de *"
                    id={`residenciaDe-${index}`}
                    value={endereco.residenciaDe || ''}
                    onChange={(e) => onUpdate(index, 'residenciaDe', e.target.value)}
                    error={errors[`enderecos.${index}.residenciaDe`]}
                >
                    <option value="">Selecione quem reside neste endereço</option>
                    <option value="paciente">Cliente</option>
                    <option value="mae">Mãe</option>
                    <option value="pai">Pai</option>
                    <option value="outro">Outro (especificar)</option>
                </SelectField>

                {/* Campo para especificar "Outro" */}
                {endereco.residenciaDe === 'outro' && (
                    <InputField
                        label="Especificar *"
                        id={`outroResidencia-${index}`}
                        value={endereco.outroResidencia || ''}
                        onChange={(e) => onUpdate(index, 'outroResidencia', e.target.value)}
                        placeholder="Especifique quem reside neste endereço"
                        error={errors[`enderecos.${index}.outroResidencia`]}
                    />
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CEP */}
                <InputField
                    label={`CEP ${index === 0 ? '*' : ''}`}
                    id={`cep-${index}`}
                    value={endereco.cep || ''}
                    onChange={(e) => onUpdate(index, 'cep', maskCEP(e.target.value))}
                    onBlur={() => onBlur(`enderecos.${index}.cep`)}
                    placeholder="00000-000"
                    error={error || errors[`enderecos.${index}.cep`]}
                />

                {/* Logradouro */}
                <div className="md:col-span-2">
                    <InputField
                        label={`Logradouro ${index === 0 ? '*' : ''}`}
                        id={`logradouro-${index}`}
                        value={endereco.logradouro || ''}
                        onChange={(e) => onUpdate(index, 'logradouro', e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        error={errors[`enderecos.${index}.logradouro`]}
                    />
                </div>

                {/* Número */}
                <InputField
                    label={`Número ${index === 0 ? '*' : ''}`}
                    id={`numero-${index}`}
                    value={endereco.numero || ''}
                    onChange={(e) => onUpdate(index, 'numero', e.target.value)}
                    placeholder="123"
                    error={errors[`enderecos.${index}.numero`]}
                />

                {/* Complemento */}
                <InputField
                    label={`Complemento ${index === 0 ? '*' : ''}`}
                    id={`complemento-${index}`}
                    value={endereco.complemento || ''}
                    onChange={(e) => onUpdate(index, 'complemento', e.target.value)}
                    placeholder="Apto, Casa, etc."
                    error={errors[`enderecos.${index}.complemento`]}
                />

                {/* Bairro */}
                <InputField
                    label={`Bairro ${index === 0 ? '*' : ''}`}
                    id={`bairro-${index}`}
                    value={endereco.bairro || ''}
                    onChange={(e) => onUpdate(index, 'bairro', e.target.value)}
                    placeholder="Nome do bairro"
                    error={errors[`enderecos.${index}.bairro`]}
                />

                {/* Cidade */}
                <div className="md:col-span-2">
                    <InputField
                        label={`Cidade ${index === 0 ? '*' : ''}`}
                        id={`cidade-${index}`}
                        value={endereco.cidade || ''}
                        onChange={(e) => onUpdate(index, 'cidade', e.target.value)}
                        placeholder="Nome da cidade"
                        error={errors[`enderecos.${index}.cidade`]}
                    />
                </div>

                {/* UF */}
                <SelectField
                    label={`UF ${index === 0 ? '*' : ''}`}
                    id={`uf-${index}`}
                    value={endereco.uf || ''}
                    onChange={(e) => onUpdate(index, 'uf', e.target.value)}
                    error={errors[`enderecos.${index}.uf`]}
                >
                    <option value="">Selecione o estado</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                </SelectField>
            </div>
        </div>
    );
}
