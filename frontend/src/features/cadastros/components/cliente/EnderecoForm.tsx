import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
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
        <div className="border rounded-lg p-4 space-y-4 relative">
            <div className="flex items-center justify-between">
                <h4 className="font-medium">
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
            <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="space-y-2">
                    <Label htmlFor={`residenciaDe-${index}`}>Residência de *</Label>
                    <select
                        id={`residenciaDe-${index}`}
                        value={endereco.residenciaDe || ''}
                        onChange={(e) => onUpdate(index, 'residenciaDe', e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            errors[`enderecos.${index}.residenciaDe`] ? 'border-destructive' : ''
                        }`}
                    >
                        <option value="">Selecione quem reside neste endereço</option>
                        <option value="paciente">Paciente</option>
                        <option value="mae">Mãe</option>
                        <option value="pai">Pai</option>
                        <option value="outro">Outro (especificar)</option>
                    </select>
                    {errors[`enderecos.${index}.residenciaDe`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.residenciaDe`]}
                        </p>
                    )}
                </div>

                {/* Campo para especificar "Outro" */}
                {endereco.residenciaDe === 'outro' && (
                    <div className="space-y-2">
                        <Label htmlFor={`outroResidencia-${index}`}>Especificar *</Label>
                        <Input
                            id={`outroResidencia-${index}`}
                            value={endereco.outroResidencia || ''}
                            onChange={(e) => onUpdate(index, 'outroResidencia', e.target.value)}
                            placeholder="Especifique quem reside neste endereço"
                            className={
                                errors[`enderecos.${index}.outroResidencia`]
                                    ? 'border-destructive'
                                    : ''
                            }
                        />
                        {errors[`enderecos.${index}.outroResidencia`] && (
                            <p className="text-sm text-destructive">
                                {errors[`enderecos.${index}.outroResidencia`]}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CEP */}
                <div className="space-y-2">
                    <Label htmlFor={`cep-${index}`}>CEP {index === 0 ? '*' : ''}</Label>
                    <Input
                        id={`cep-${index}`}
                        value={endereco.cep || ''}
                        onChange={(e) => onUpdate(index, 'cep', maskCEP(e.target.value))}
                        onBlur={() => onBlur(`enderecos.${index}.cep`)}
                        placeholder="00000-000"
                        className={errors[`enderecos.${index}.cep`] ? 'border-destructive' : ''}
                    />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {errors[`enderecos.${index}.cep`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.cep`]}
                        </p>
                    )}
                </div>

                {/* Logradouro */}
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`logradouro-${index}`}>
                        Logradouro {index === 0 ? '*' : ''}
                    </Label>
                    <Input
                        id={`logradouro-${index}`}
                        value={endereco.logradouro || ''}
                        onChange={(e) => onUpdate(index, 'logradouro', e.target.value)}
                        placeholder="Rua, Avenida, etc."
                        className={
                            errors[`enderecos.${index}.logradouro`] ? 'border-destructive' : ''
                        }
                    />
                    {errors[`enderecos.${index}.logradouro`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.logradouro`]}
                        </p>
                    )}
                </div>

                {/* Número */}
                <div className="space-y-2">
                    <Label htmlFor={`numero-${index}`}>Número {index === 0 ? '*' : ''}</Label>
                    <Input
                        id={`numero-${index}`}
                        value={endereco.numero || ''}
                        onChange={(e) => onUpdate(index, 'numero', e.target.value)}
                        placeholder="123"
                        className={errors[`enderecos.${index}.numero`] ? 'border-destructive' : ''}
                    />
                    {errors[`enderecos.${index}.numero`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.numero`]}
                        </p>
                    )}
                </div>

                {/* Complemento */}
                <div className="space-y-2">
                    <Label htmlFor={`complemento-${index}`}>
                        Complemento {index === 0 ? '*' : ''}
                    </Label>
                    <Input
                        id={`complemento-${index}`}
                        value={endereco.complemento || ''}
                        onChange={(e) => onUpdate(index, 'complemento', e.target.value)}
                        placeholder="Apto, Casa, etc."
                        className={
                            errors[`enderecos.${index}.complemento`] ? 'border-destructive' : ''
                        }
                    />
                    {errors[`enderecos.${index}.complemento`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.complemento`]}
                        </p>
                    )}
                </div>

                {/* Bairro */}
                <div className="space-y-2">
                    <Label htmlFor={`bairro-${index}`}>Bairro {index === 0 ? '*' : ''}</Label>
                    <Input
                        id={`bairro-${index}`}
                        value={endereco.bairro || ''}
                        onChange={(e) => onUpdate(index, 'bairro', e.target.value)}
                        placeholder="Nome do bairro"
                        className={errors[`enderecos.${index}.bairro`] ? 'border-destructive' : ''}
                    />
                    {errors[`enderecos.${index}.bairro`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.bairro`]}
                        </p>
                    )}
                </div>

                {/* Cidade */}
                <div className="space-y-2">
                    <Label htmlFor={`cidade-${index}`}>Cidade {index === 0 ? '*' : ''}</Label>
                    <Input
                        id={`cidade-${index}`}
                        value={endereco.cidade || ''}
                        onChange={(e) => onUpdate(index, 'cidade', e.target.value)}
                        placeholder="Nome da cidade"
                        className={errors[`enderecos.${index}.cidade`] ? 'border-destructive' : ''}
                    />
                    {errors[`enderecos.${index}.cidade`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.cidade`]}
                        </p>
                    )}
                </div>

                {/* UF */}
                <div className="space-y-2">
                    <Label htmlFor={`uf-${index}`}>UF {index === 0 ? '*' : ''}</Label>
                    <select
                        id={`uf-${index}`}
                        value={endereco.uf || ''}
                        onChange={(e) => onUpdate(index, 'uf', e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${errors[`enderecos.${index}.uf`] ? 'border-destructive' : ''}`}
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
                    </select>
                    {errors[`enderecos.${index}.uf`] && (
                        <p className="text-sm text-destructive">
                            {errors[`enderecos.${index}.uf`]}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
