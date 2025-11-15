import { InputField } from '@/ui/input-field';
import { SelectFieldRadix, SelectItem } from '@/ui/select-field-radix';
import type { Terapeuta } from '../../types/cadastros.types';
import { useCepLookup } from '../../hooks/useCepLookup';
import { useCallback, useEffect } from 'react';
import { maskCEP } from '@/common/utils/mask';

interface EnderecoStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function EnderecoStep({ data, onUpdate, errors }: EnderecoStepProps) {
    const handleEnderecoChange = useCallback(
        (field: string, value: string) => {
            onUpdate(`endereco.${field}`, value);
        },
        [onUpdate],
    );

    const { data: cepData, error: cepError } = useCepLookup(data.endereco?.cep || '');

    useEffect(() => {
        if (!cepData) return;

        const nextRua = cepData.logradouro ?? '';
        const nextBairro = cepData.bairro ?? '';
        const nextCidade = cepData.cidade ?? '';
        const nextEstado = cepData.uf ?? '';

        const unchanged =
            (data.endereco?.rua ?? '') === nextRua &&
            (data.endereco?.bairro ?? '') === nextBairro &&
            (data.endereco?.cidade ?? '') === nextCidade &&
            (data.endereco?.estado ?? '') === nextEstado;
        if (unchanged) return;

        onUpdate('endereco.rua', nextRua);
        onUpdate('endereco.bairro', nextBairro);
        onUpdate('endereco.cidade', nextCidade);
        onUpdate('endereco.estado', nextEstado);
    }, [
        cepData,
        data.endereco?.rua,
        data.endereco?.bairro,
        data.endereco?.cidade,
        data.endereco?.estado,
        onUpdate,
    ]);

    return (
        <div className="space-y-4 md:space-y-6">
            

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                <div>
                    <InputField
                        label="CEP *"
                        id="cep"
                        value={data.endereco?.cep || ''}
                        onChange={(e) => handleEnderecoChange('cep', maskCEP(e.target.value))}
                        placeholder="00000-000"
                        error={errors['endereco.cep'] || cepError || undefined}
                    />
                </div>

                <div className="md:col-span-2">
                    <InputField
                        label="Rua *"
                        id="rua"
                        value={data.endereco?.rua || ''}
                        onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                        placeholder="Nome da rua"
                        error={errors['endereco.rua']}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                <div>
                    <InputField
                        label="Número *"
                        id="numero"
                        value={data.endereco?.numero || ''}
                        onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                        placeholder="123"
                        error={errors['endereco.numero']}
                    />
                </div>

                <div>
                    <InputField
                        label="Complemento"
                        id="complemento"
                        value={data.endereco?.complemento || ''}
                        onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                        placeholder="Apto, Sala..."
                    />
                </div>

                <div>
                    <InputField
                        label="Bairro *"
                        id="bairro"
                        value={data.endereco?.bairro || ''}
                        onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                        placeholder="Nome do bairro"
                        error={errors['endereco.bairro']}
                    />
                </div>

                <div>
                    <InputField
                        label="Cidade *"
                        id="cidade"
                        value={data.endereco?.cidade || ''}
                        onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                        placeholder="Nome da cidade"
                        error={errors['endereco.cidade']}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:gap-4">
                <div>
                    <SelectFieldRadix
                        label="Estado *"
                        value={data.endereco?.estado || ''}
                        onValueChange={(value) => handleEnderecoChange('estado', value)}
                        error={errors['endereco.estado']}
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
    );
}
