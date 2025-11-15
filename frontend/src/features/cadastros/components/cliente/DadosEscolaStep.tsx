import { InputField } from '@/ui/input-field';
import { SelectField } from '@/ui/select-field';
import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import { useCepLookup } from '../../hooks/useCepLookup';
import type { Cliente } from '../../types/cadastros.types';
import * as mask from '@/common/utils/mask';

interface DadosEscolaStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
    onBlur: (field: string) => void;
}

export default function DadosEscolaStep({ data, onUpdate, errors, onBlur }: DadosEscolaStepProps) {
    const updateDadosEscola = (field: string, value: any) => {
        onUpdate(`dadosEscola.${field}`, value);
    };

    // Inicializar com pelo menos um contato se não existir
    useEffect(() => {
        if (!data.dadosEscola?.contatos || data.dadosEscola.contatos.length === 0) {
            updateDadosEscola('contatos', [
                {
                    nome: '',
                    telefone: '',
                    email: '',
                    funcao: '',
                },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.dadosEscola?.contatos]);

    const updateEnderecoEscola = (field: string, value: any) => {
        onUpdate(`dadosEscola.endereco.${field}`, value);
    };

    const { data: cepData, error: cepError } = useCepLookup(data.dadosEscola?.endereco?.cep || '');

    useEffect(() => {
        if (cepData) {
            updateEnderecoEscola('logradouro', cepData.logradouro);
            updateEnderecoEscola('bairro', cepData.bairro);
            updateEnderecoEscola('cidade', cepData.cidade);
            updateEnderecoEscola('uf', cepData.uf);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cepData]);

    return (
        <div className="space-y-6">
            

            {/* Dados básicos da escola */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo escola */}
                <SelectField
                    label="Tipo escola *"
                    id="tipoEscola"
                    value={data.dadosEscola?.tipoEscola || ''}
                    onChange={(e) => updateDadosEscola('tipoEscola', e.target.value)}
                    error={errors['dadosEscola.tipoEscola']}
                >
                    <option value="">Selecione o tipo</option>
                    <option value="particular">Particular</option>
                    <option value="publica">Pública</option>
                    <option value="afastado">Afastado da escola</option>
                    <option value="clinica-escola">Clínica-escola</option>
                </SelectField>

                {/* Nome */}
                <InputField
                    label="Nome *"
                    id="nomeEscola"
                    value={data.dadosEscola?.nome || ''}
                    onChange={(e) => updateDadosEscola('nome', e.target.value)}
                    placeholder="Nome da escola"
                    error={errors['dadosEscola.nome']}
                />

                {/* Telefone */}
                <InputField
                    label="Telefone *"
                    id="telefoneEscola"
                    value={data.dadosEscola?.telefone || ''}
                    onChange={(e) =>
                        updateDadosEscola('telefone', mask.maskBRPhone(e.target.value))
                    }
                    onBlur={() => onBlur('dadosEscola.telefone')}
                    placeholder="(11) 99999-9999"
                    error={errors['dadosEscola.telefone']}
                />

                {/* E-mail */}
                <InputField
                    label="E-mail *"
                    id="emailEscola"
                    type="email"
                    value={data.dadosEscola?.email || ''}
                    onChange={(e) =>
                        updateDadosEscola('email', mask.normalizeEmail(e.target.value))
                    }
                    onBlur={() => onBlur('dadosEscola.email')}
                    placeholder="escola@exemplo.com"
                    error={errors['dadosEscola.email']}
                />
            </div>

            {/* Contatos da Escola */}
            <div className="space-y-4">
                

                {/* Lista de contatos */}
                {(data.dadosEscola?.contatos || []).map((contato, index) => (
                    <div key={index} className="space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <h4
                                style={{
                                    fontFamily: "var(--hub-card-title-font-family)",
                                    fontWeight: "var(--hub-card-title-font-weight)",
                                    color: "var(--hub-card-title-color)",
                                }}
                                className="text-sm"
                            >
                                Contato {index + 1}
                            </h4>
                            {(data.dadosEscola?.contatos || []).length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const contatos = [...(data.dadosEscola?.contatos || [])];
                                        contatos.splice(index, 1);
                                        updateDadosEscola('contatos', contatos);
                                    }}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nome */}
                            <InputField
                                label="Nome *"
                                id={`nomeContato-${index}`}
                                value={contato.nome || ''}
                                onChange={(e) => {
                                    const contatos = [...(data.dadosEscola?.contatos || [])];
                                    contatos[index] = {
                                        ...contatos[index],
                                        nome: mask.maskPersonName(e.target.value),
                                    };
                                    updateDadosEscola('contatos', contatos);
                                }}
                                placeholder="Nome do contato"
                                error={errors[`dadosEscola.contatos.${index}.nome`]}
                            />

                            {/* Telefone */}
                            <InputField
                                label="Telefone *"
                                id={`telefoneContato-${index}`}
                                value={contato.telefone || ''}
                                onChange={(e) => {
                                    const contatos = [...(data.dadosEscola?.contatos || [])];
                                    contatos[index] = {
                                        ...contatos[index],
                                        telefone: mask.maskBRPhone(e.target.value),
                                    };
                                    updateDadosEscola('contatos', contatos);
                                }}
                                onBlur={() => onBlur(`dadosEscola.contatos.${index}.telefone`)}
                                placeholder="(11) 99999-9999"
                                error={errors[`dadosEscola.contatos.${index}.telefone`]}
                            />

                            {/* E-mail */}
                            <InputField
                                label="E-mail *"
                                id={`emailContato-${index}`}
                                type="email"
                                value={contato.email || ''}
                                onChange={(e) => {
                                    const contatos = [...(data.dadosEscola?.contatos || [])];
                                    contatos[index] = {
                                        ...contatos[index],
                                        email: mask.normalizeEmail(e.target.value),
                                    };
                                    updateDadosEscola('contatos', contatos);
                                }}
                                onBlur={() => onBlur(`dadosEscola.contatos.${index}.email`)}
                                placeholder="contato@exemplo.com"
                                error={errors[`dadosEscola.contatos.${index}.email`]}
                            />

                            {/* Função */}
                            <InputField
                                label="Função/Relacionamento *"
                                id={`funcaoContato-${index}`}
                                value={contato.funcao || ''}
                                onChange={(e) => {
                                    const contatos = [...(data.dadosEscola?.contatos || [])];
                                    contatos[index] = {
                                        ...contatos[index],
                                        funcao: e.target.value,
                                    };
                                    updateDadosEscola('contatos', contatos);
                                }}
                                placeholder="Ex: Coordenadora, Professora, Secretária"
                                error={errors[`dadosEscola.contatos.${index}.funcao`]}
                            />
                        </div>
                    </div>
                ))}

                {/* Botão para adicionar contato */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        const contatos = [...(data.dadosEscola?.contatos || [])];
                        contatos.push({
                            nome: '',
                            telefone: '',
                            email: '',
                            funcao: '',
                        });
                        updateDadosEscola('contatos', contatos);
                    }}
                    className="w-full flex items-center gap-2 mb-8"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar contato
                </Button>
            </div>

            {/* Endereço da escola */}
            <div className="space-y-4 mb-4">
                <h4
                    style={{
                        fontFamily: "var(--hub-card-title-font-family)",
                        fontWeight: "var(--hub-card-title-font-weight)",
                        color: "var(--hub-card-title-color)",
                    }}
                    className="text-sm leading-none tracking-tight"
                >
                    Endereço da Escola
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* CEP */}
                    <InputField
                        label="CEP"
                        id="cepEscola"
                        value={data.dadosEscola?.endereco?.cep || ''}
                        onChange={async (e) => {
                            const masked = mask.maskCEP(e.target.value);
                            const digits = masked.replace(/\D/g, '');

                            // Atualiza CEP
                            onUpdate('dadosEscola.endereco.cep', masked);

                            // Lookup quando tiver 8 dígitos
                            if (digits.length === 8) {
                                try {
                                    const resp = await fetch(
                                        `https://viacep.com.br/ws/${digits}/json/`,
                                    );
                                    const json = await resp.json();
                                    if (!json.erro) {
                                        onUpdate(
                                            'dadosEscola.endereco.logradouro',
                                            json.logradouro || '',
                                        );
                                        onUpdate(
                                            'dadosEscola.endereco.bairro',
                                            json.bairro || '',
                                        );
                                        onUpdate(
                                            'dadosEscola.endereco.cidade',
                                            json.localidade || json.cidade || '',
                                        );
                                        onUpdate('dadosEscola.endereco.uf', json.uf || '');
                                    }
                                } catch {
                                    // silencioso
                                }
                            }
                        }}
                        placeholder="00000-000"
                        error={cepError || errors['dadosEscola.endereco.cep']}
                    />

                    {/* Logradouro */}
                    <div className="md:col-span-2">
                        <InputField
                            label="Logradouro"
                            id="logradouroEscola"
                            value={data.dadosEscola?.endereco?.logradouro || ''}
                            onChange={(e) => updateEnderecoEscola('logradouro', e.target.value)}
                            placeholder="Rua, Avenida, etc."
                            error={errors['dadosEscola.endereco.logradouro']}
                        />
                    </div>

                    {/* Número */}
                    <InputField
                        label="Número"
                        id="numeroEscola"
                        value={data.dadosEscola?.endereco?.numero || ''}
                        onChange={(e) => updateEnderecoEscola('numero', e.target.value)}
                        placeholder="123"
                        error={errors['dadosEscola.endereco.numero']}
                    />

                    {/* Complemento */}
                    <InputField
                        label="Complemento"
                        id="complementoEscola"
                        value={data.dadosEscola?.endereco?.complemento || ''}
                        onChange={(e) => updateEnderecoEscola('complemento', e.target.value)}
                        placeholder="Bloco, Andar, etc."
                        error={errors['dadosEscola.endereco.complemento']}
                    />

                    {/* Bairro */}
                    <InputField
                        label="Bairro"
                        id="bairroEscola"
                        value={data.dadosEscola?.endereco?.bairro || ''}
                        onChange={(e) => updateEnderecoEscola('bairro', e.target.value)}
                        placeholder="Nome do bairro"
                        error={errors['dadosEscola.endereco.bairro']}
                    />

                    {/* Cidade */}
                    <InputField
                        label="Cidade"
                        id="cidadeEscola"
                        value={data.dadosEscola?.endereco?.cidade || ''}
                        onChange={(e) => updateEnderecoEscola('cidade', e.target.value)}
                        placeholder="Nome da cidade"
                        error={errors['dadosEscola.endereco.cidade']}
                    />

                    {/* UF */}
                    <SelectField
                        label="UF"
                        id="ufEscola"
                        value={data.dadosEscola?.endereco?.uf || ''}
                        onChange={(e) => updateEnderecoEscola('uf', e.target.value)}
                        error={errors['dadosEscola.endereco.uf']}
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
        </div>
    );
}
