import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { useEffect, useState } from 'react';
import { useCepLookup } from '../../hooks/useCepLookup';
import type { Terapeuta } from '../../types/cadastros.types';

interface DadosCNPJStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function DadosCNPJStep({ data, onUpdate, errors }: DadosCNPJStepProps) {
    const [temCNPJ, setTemCNPJ] = useState(!!data.cnpj?.numero);
    const { data: cepData, error: cepError } = useCepLookup(
        data.cnpj?.endereco?.cep || ''
    );

    const handleCNPJChange = (field: string, value: string) => {
        onUpdate(`cnpj.${field}`, value);
    };

    const handleCNPJEnderecoChange = (field: string, value: string) => {
        onUpdate(`cnpj.endereco.${field}`, value);
    };

    const toggleCNPJ = (value: boolean) => {
        setTemCNPJ(value);
        if (!value) {
            // Limpar dados do CNPJ se desabilitado
            onUpdate('cnpj.numero', '');
            onUpdate('cnpj.razaoSocial', '');
            onUpdate('cnpj.nomeFantasia', '');
            onUpdate('cnpj.endereco.cep', '');
            onUpdate('cnpj.endereco.rua', '');
            onUpdate('cnpj.endereco.numero', '');
            onUpdate('cnpj.endereco.complemento', '');
            onUpdate('cnpj.endereco.bairro', '');
            onUpdate('cnpj.endereco.cidade', '');
            onUpdate('cnpj.endereco.estado', '');
        }
    };

    useEffect(() => {
        if (cepData) {
            handleCNPJEnderecoChange('rua', cepData.logradouro || '');
            handleCNPJEnderecoChange('bairro', cepData.bairro || '');
            handleCNPJEnderecoChange('cidade', cepData.cidade || '');
            handleCNPJEnderecoChange('estado', cepData.uf || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cepData]);

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Dados do CNPJ (Opcional)</h3>

            <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-4">
                    Se você possui CNPJ para exercer a atividade profissional, preencha os dados
                    abaixo. Caso contrário, pode pular esta etapa.
                </p>

                <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="temCNPJ"
                            checked={!temCNPJ}
                            onChange={() => toggleCNPJ(false)}
                            className="text-primary"
                        />
                        <span className="text-sm">Não possuo CNPJ</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="temCNPJ"
                            checked={temCNPJ}
                            onChange={() => toggleCNPJ(true)}
                            className="text-primary"
                        />
                        <span className="text-sm">Possuo CNPJ</span>
                    </label>
                </div>
            </div>

            {temCNPJ && (
                <div className="space-y-6">
                    {/* Dados básicos do CNPJ */}
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-primary">Dados da Empresa</h4>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cnpjNumero">CNPJ</Label>
                                <Input
                                    id="cnpjNumero"
                                    value={data.cnpj?.numero || ''}
                                    onChange={(e) => handleCNPJChange('numero', e.target.value)}
                                    placeholder="00.000.000/0000-00"
                                    className={errors['cnpj.numero'] ? 'border-destructive' : ''}
                                />
                                {errors['cnpj.numero'] && (
                                    <p className="text-sm text-destructive">
                                        {errors['cnpj.numero']}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="razaoSocial">Razão Social</Label>
                                <Input
                                    id="razaoSocial"
                                    value={data.cnpj?.razaoSocial || ''}
                                    onChange={(e) =>
                                        handleCNPJChange('razaoSocial', e.target.value)
                                    }
                                    placeholder="Nome da empresa conforme registro"
                                    className={
                                        errors['cnpj.razaoSocial'] ? 'border-destructive' : ''
                                    }
                                />
                                {errors['cnpj.razaoSocial'] && (
                                    <p className="text-sm text-destructive">
                                        {errors['cnpj.razaoSocial']}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Endereço do CNPJ */}
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-primary">Endereço da Empresa</h4>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cnpjCep">CEP</Label>
                                <Input
                                    id="cnpjCep"
                                    value={data.cnpj?.endereco?.cep || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('cep', e.target.value)
                                    }
                                    placeholder="00000-000"
                                />
                            </div>
                            {cepError && (
                                <p className='text-sm text-destructive'>{cepError}</p>
                            )}
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="cnpjRua">Rua</Label>
                                <Input
                                    id="cnpjRua"
                                    value={data.cnpj?.endereco?.rua || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('rua', e.target.value)
                                    }
                                    placeholder="Nome da rua"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cnpjNumero">Número</Label>
                                <Input
                                    id="cnpjNumeroEndereco"
                                    value={data.cnpj?.endereco?.numero || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('numero', e.target.value)
                                    }
                                    placeholder="123"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cnpjComplemento">Complemento</Label>
                                <Input
                                    id="cnpjComplemento"
                                    value={data.cnpj?.endereco?.complemento || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('complemento', e.target.value)
                                    }
                                    placeholder="Sala, Andar..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cnpjBairro">Bairro</Label>
                                <Input
                                    id="cnpjBairro"
                                    value={data.cnpj?.endereco?.bairro || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('bairro', e.target.value)
                                    }
                                    placeholder="Nome do bairro"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cnpjCidade">Cidade</Label>
                                <Input
                                    id="cnpjCidade"
                                    value={data.cnpj?.endereco?.cidade || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('cidade', e.target.value)
                                    }
                                    placeholder="Nome da cidade"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="cnpjEstado">Estado</Label>
                                <select
                                    id="cnpjEstado"
                                    value={data.cnpj?.endereco?.estado || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('estado', e.target.value)
                                    }
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                                    {/* Adicionar outros estados conforme necessário */}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
