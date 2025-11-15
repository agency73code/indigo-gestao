import { useEffect, useState } from 'react';
import { useCepLookup } from '../../hooks/useCepLookup';
import type { Terapeuta } from '../../types/cadastros.types';
import { InputField } from '@/ui/input-field';
import { SelectFieldRadix, SelectItem } from '@/ui/select-field-radix';

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
        <div className="space-y-4 md:space-y-6">
            <h3 
                style={{ 
                    fontFamily: "var(--hub-card-title-font-family)",
                    fontWeight: "var(--hub-card-title-font-weight)",
                    color: "var(--hub-card-title-color)"
                }}
                className="text-base sm:text-lg leading-none tracking-tight"
            >
                Dados do CNPJ (Opcional)
            </h3>

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
                <div className="space-y-4 md:space-y-6">
                    {/* Dados básicos do CNPJ */}
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-primary">Dados da Empresa</h4>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
                            <InputField
                                id="cnpjNumero"
                                label="CNPJ"
                                value={data.cnpj?.numero || ''}
                                onChange={(e) => handleCNPJChange('numero', e.target.value)}
                                placeholder="00.000.000/0000-00"
                                error={errors['cnpj.numero']}
                            />

                            <div className="md:col-span-2">
                                <InputField
                                    id="razaoSocial"
                                    label="Razão Social"
                                    value={data.cnpj?.razaoSocial || ''}
                                    onChange={(e) =>
                                        handleCNPJChange('razaoSocial', e.target.value)
                                    }
                                    placeholder="Nome da empresa conforme registro"
                                    error={errors['cnpj.razaoSocial']}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Endereço do CNPJ */}
                    <div className="space-y-4">
                        <h4 className="text-md font-medium text-primary">Endereço da Empresa</h4>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                            <InputField
                                id="cnpjCep"
                                label="CEP"
                                value={data.cnpj?.endereco?.cep || ''}
                                onChange={(e) =>
                                    handleCNPJEnderecoChange('cep', e.target.value)
                                }
                                placeholder="00000-000"
                                error={cepError || ''}
                            />
                            
                            <div className="md:col-span-2">
                                <InputField
                                    id="cnpjRua"
                                    label="Rua"
                                    value={data.cnpj?.endereco?.rua || ''}
                                    onChange={(e) =>
                                        handleCNPJEnderecoChange('rua', e.target.value)
                                    }
                                    placeholder="Nome da rua"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                            <InputField
                                id="cnpjNumeroEndereco"
                                label="Número"
                                value={data.cnpj?.endereco?.numero || ''}
                                onChange={(e) =>
                                    handleCNPJEnderecoChange('numero', e.target.value)
                                }
                                placeholder="123"
                            />

                            <InputField
                                id="cnpjComplemento"
                                label="Complemento"
                                value={data.cnpj?.endereco?.complemento || ''}
                                onChange={(e) =>
                                    handleCNPJEnderecoChange('complemento', e.target.value)
                                }
                                placeholder="Sala, Andar..."
                            />

                            <InputField
                                id="cnpjBairro"
                                label="Bairro"
                                value={data.cnpj?.endereco?.bairro || ''}
                                onChange={(e) =>
                                    handleCNPJEnderecoChange('bairro', e.target.value)
                                }
                                placeholder="Nome do bairro"
                            />

                            <InputField
                                id="cnpjCidade"
                                label="Cidade"
                                value={data.cnpj?.endereco?.cidade || ''}
                                onChange={(e) =>
                                    handleCNPJEnderecoChange('cidade', e.target.value)
                                }
                                placeholder="Nome da cidade"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                            <SelectFieldRadix
                                label="Estado"
                                value={data.cnpj?.endereco?.estado || ''}
                                onValueChange={(value) =>
                                    handleCNPJEnderecoChange('estado', value)
                                }
                                placeholder="Selecione o estado"
                            >
                                <SelectItem value="AC">Acre</SelectItem>
                                <SelectItem value="AL">Alagoas</SelectItem>
                                <SelectItem value="AP">Amapá</SelectItem>
                                <SelectItem value="AM">Amazonas</SelectItem>
                                <SelectItem value="BA">Bahia</SelectItem>
                                <SelectItem value="CE">Ceará</SelectItem>
                                <SelectItem value="DF">Distrito Federal</SelectItem>
                                <SelectItem value="ES">Espírito Santo</SelectItem>
                                <SelectItem value="GO">Goiás</SelectItem>
                                <SelectItem value="MA">Maranhão</SelectItem>
                                <SelectItem value="MT">Mato Grosso</SelectItem>
                                <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                                <SelectItem value="MG">Minas Gerais</SelectItem>
                                <SelectItem value="PA">Pará</SelectItem>
                                <SelectItem value="PB">Paraíba</SelectItem>
                                <SelectItem value="PR">Paraná</SelectItem>
                                <SelectItem value="PE">Pernambuco</SelectItem>
                                <SelectItem value="PI">Piauí</SelectItem>
                                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                                <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                                <SelectItem value="RO">Rondônia</SelectItem>
                                <SelectItem value="RR">Roraima</SelectItem>
                                <SelectItem value="SC">Santa Catarina</SelectItem>
                                <SelectItem value="SP">São Paulo</SelectItem>
                                <SelectItem value="SE">Sergipe</SelectItem>
                                <SelectItem value="TO">Tocantins</SelectItem>
                            </SelectFieldRadix>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}










