import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import type { Cliente } from '../../types/cadastros.types';

interface EnderecoStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
}

export default function EnderecoStep({ data, onUpdate, errors }: EnderecoStepProps) {
    const enderecos = data.enderecos || [
        {
            cep: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            uf: '',
        },
    ];

    const handleEnderecoChange = (index: number, field: string, value: string) => {
        const updatedEnderecos = [...enderecos];
        updatedEnderecos[index] = { ...updatedEnderecos[index], [field]: value };
        onUpdate('enderecos', updatedEnderecos);
    };

    const adicionarEndereco = () => {
        const updatedEnderecos = [
            ...enderecos,
            {
                cep: '',
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                uf: '',
            },
        ];
        onUpdate('enderecos', updatedEnderecos);
    };

    const removerEndereco = (index: number) => {
        if (enderecos.length > 1) {
            const updatedEnderecos = enderecos.filter((_, i) => i !== index);
            onUpdate('enderecos', updatedEnderecos);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Endereço</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os endereços do cliente. Campos marcados com * são obrigatórios.
                </p>
            </div>

            {/* Endereços */}
            {enderecos.map((endereco, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                    <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                            {index === 0 ? 'Endereço Principal' : `Endereço ${index + 1}`}
                        </h4>
                        {index > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removerEndereco(index)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* CEP */}
                        <div className="space-y-2">
                            <Label htmlFor={`cep-${index}`}>CEP {index === 0 ? '*' : ''}</Label>
                            <Input
                                id={`cep-${index}`}
                                value={endereco.cep || ''}
                                onChange={(e) => handleEnderecoChange(index, 'cep', e.target.value)}
                                placeholder="00000-000"
                                className={
                                    errors[`enderecos.${index}.cep`] ? 'border-destructive' : ''
                                }
                            />
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
                                onChange={(e) =>
                                    handleEnderecoChange(index, 'logradouro', e.target.value)
                                }
                                placeholder="Rua, Avenida, etc."
                                className={
                                    errors[`enderecos.${index}.logradouro`]
                                        ? 'border-destructive'
                                        : ''
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
                            <Label htmlFor={`numero-${index}`}>
                                Número {index === 0 ? '*' : ''}
                            </Label>
                            <Input
                                id={`numero-${index}`}
                                value={endereco.numero || ''}
                                onChange={(e) =>
                                    handleEnderecoChange(index, 'numero', e.target.value)
                                }
                                placeholder="123"
                                className={
                                    errors[`enderecos.${index}.numero`] ? 'border-destructive' : ''
                                }
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
                                onChange={(e) =>
                                    handleEnderecoChange(index, 'complemento', e.target.value)
                                }
                                placeholder="Apto, Casa, etc."
                                className={
                                    errors[`enderecos.${index}.complemento`]
                                        ? 'border-destructive'
                                        : ''
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
                            <Label htmlFor={`bairro-${index}`}>
                                Bairro {index === 0 ? '*' : ''}
                            </Label>
                            <Input
                                id={`bairro-${index}`}
                                value={endereco.bairro || ''}
                                onChange={(e) =>
                                    handleEnderecoChange(index, 'bairro', e.target.value)
                                }
                                placeholder="Nome do bairro"
                                className={
                                    errors[`enderecos.${index}.bairro`] ? 'border-destructive' : ''
                                }
                            />
                            {errors[`enderecos.${index}.bairro`] && (
                                <p className="text-sm text-destructive">
                                    {errors[`enderecos.${index}.bairro`]}
                                </p>
                            )}
                        </div>

                        {/* Cidade */}
                        <div className="space-y-2">
                            <Label htmlFor={`cidade-${index}`}>
                                Cidade {index === 0 ? '*' : ''}
                            </Label>
                            <Input
                                id={`cidade-${index}`}
                                value={endereco.cidade || ''}
                                onChange={(e) =>
                                    handleEnderecoChange(index, 'cidade', e.target.value)
                                }
                                placeholder="Nome da cidade"
                                className={
                                    errors[`enderecos.${index}.cidade`] ? 'border-destructive' : ''
                                }
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
                                onChange={(e) => handleEnderecoChange(index, 'uf', e.target.value)}
                                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                    errors[`enderecos.${index}.uf`] ? 'border-destructive' : ''
                                }`}
                            >
                                <option value="">Selecione o estado</option>
                                <option value="AC">AC</option>
                                <option value="AL">AL</option>
                                <option value="AP">AP</option>
                                <option value="AM">AM</option>
                                <option value="BA">BA</option>
                                <option value="CE">CE</option>
                                <option value="DF">DF</option>
                                <option value="ES">ES</option>
                                <option value="GO">GO</option>
                                <option value="MA">MA</option>
                                <option value="MT">MT</option>
                                <option value="MS">MS</option>
                                <option value="MG">MG</option>
                                <option value="PA">PA</option>
                                <option value="PB">PB</option>
                                <option value="PR">PR</option>
                                <option value="PE">PE</option>
                                <option value="PI">PI</option>
                                <option value="RJ">RJ</option>
                                <option value="RN">RN</option>
                                <option value="RS">RS</option>
                                <option value="RO">RO</option>
                                <option value="RR">RR</option>
                                <option value="SC">SC</option>
                                <option value="SP">SP</option>
                                <option value="SE">SE</option>
                                <option value="TO">TO</option>
                            </select>
                            {errors[`enderecos.${index}.uf`] && (
                                <p className="text-sm text-destructive">
                                    {errors[`enderecos.${index}.uf`]}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Botão para adicionar novo endereço */}
            <Button 
                type="button"
                variant="outline"
                onClick={adicionarEndereco}
                className="w-full flex items-center gap-2 mb-8"
            >
                <Plus className="w-4 h-4" />
                Adicionar outro endereço
            </Button>

            
        </div>
    );
}
