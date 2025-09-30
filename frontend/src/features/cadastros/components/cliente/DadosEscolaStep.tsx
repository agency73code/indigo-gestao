import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
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
            <div>
                <h3 className="text-lg font-semibold">Dados Escola</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os dados da escola do cliente. Campos marcados com * são obrigatórios.
                </p>
            </div>

            {/* Dados básicos da escola */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipo escola */}
                <div className="space-y-2">
                    <Label htmlFor="tipoEscola">Tipo escola *</Label>
                    <select
                        id="tipoEscola"
                        value={data.dadosEscola?.tipoEscola || ''}
                        onChange={(e) => updateDadosEscola('tipoEscola', e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            errors['dadosEscola.tipoEscola'] ? 'border-destructive' : ''
                        }`}
                    >
                        <option value="">Selecione o tipo</option>
                        <option value="particular">Particular</option>
                        <option value="publica">Pública</option>
                        <option value="afastado">Afastado da escola</option>
                        <option value="clinica-escola">Clínica-escola</option>
                    </select>
                    {errors['dadosEscola.tipoEscola'] && (
                        <p className="text-sm text-destructive">
                            {errors['dadosEscola.tipoEscola']}
                        </p>
                    )}
                </div>

                {/* Nome */}
                <div className="space-y-2">
                    <Label htmlFor="nomeEscola">Nome *</Label>
                    <Input
                        id="nomeEscola"
                        value={data.dadosEscola?.nome || ''}
                        onChange={(e) => updateDadosEscola('nome', e.target.value)}
                        placeholder="Nome da escola"
                        className={errors['dadosEscola.nome'] ? 'border-destructive' : ''}
                    />
                    {errors['dadosEscola.nome'] && (
                        <p className="text-sm text-destructive">{errors['dadosEscola.nome']}</p>
                    )}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                    <Label htmlFor="telefoneEscola">Telefone *</Label>
                    <Input
                        id="telefoneEscola"
                        value={data.dadosEscola?.telefone || ''}
                        onChange={(e) =>
                            updateDadosEscola('telefone', mask.maskBRPhone(e.target.value))
                        }
                        onBlur={() => onBlur('dadosEscola.telefone')}
                        placeholder="(11) 99999-9999"
                        className={errors['dadosEscola.telefone'] ? 'border-destructive' : ''}
                    />
                    {errors['dadosEscola.telefone'] && (
                        <p className="text-sm text-destructive">{errors['dadosEscola.telefone']}</p>
                    )}
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                    <Label htmlFor="emailEscola">E-mail *</Label>
                    <Input
                        id="emailEscola"
                        type="email"
                        value={data.dadosEscola?.email || ''}
                        onChange={(e) =>
                            updateDadosEscola('email', mask.normalizeEmail(e.target.value))
                        }
                        onBlur={() => onBlur('dadosEscola.email')}
                        placeholder="escola@exemplo.com"
                        className={errors['dadosEscola.email'] ? 'border-destructive' : ''}
                    />
                    {errors['dadosEscola.email'] && (
                        <p className="text-sm text-destructive">{errors['dadosEscola.email']}</p>
                    )}
                </div>
            </div>

            {/* Contatos da Escola */}
            <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground border-b pb-2">
                    Contatos da Escola
                </h4>

                {/* Lista de contatos */}
                {(data.dadosEscola?.contatos || []).map((contato, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Contato {index + 1}</h4>
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
                            <div className="space-y-2">
                                <Label htmlFor={`nomeContato-${index}`}>Nome *</Label>
                                <Input
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
                                    className={
                                        errors[`dadosEscola.contatos.${index}.nome`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`dadosEscola.contatos.${index}.nome`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`dadosEscola.contatos.${index}.nome`]}
                                    </p>
                                )}
                            </div>

                            {/* Telefone */}
                            <div className="space-y-2">
                                <Label htmlFor={`telefoneContato-${index}`}>Telefone *</Label>
                                <Input
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
                                    className={
                                        errors[`dadosEscola.contatos.${index}.telefone`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`dadosEscola.contatos.${index}.telefone`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`dadosEscola.contatos.${index}.telefone`]}
                                    </p>
                                )}
                            </div>

                            {/* E-mail */}
                            <div className="space-y-2">
                                <Label htmlFor={`emailContato-${index}`}>E-mail *</Label>
                                <Input
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
                                    className={
                                        errors[`dadosEscola.contatos.${index}.email`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`dadosEscola.contatos.${index}.email`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`dadosEscola.contatos.${index}.email`]}
                                    </p>
                                )}
                            </div>

                            {/* Função */}
                            <div className="space-y-2">
                                <Label htmlFor={`funcaoContato-${index}`}>
                                    Função/Relacionamento *
                                </Label>
                                <Input
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
                                    className={
                                        errors[`dadosEscola.contatos.${index}.funcao`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`dadosEscola.contatos.${index}.funcao`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`dadosEscola.contatos.${index}.funcao`]}
                                    </p>
                                )}
                            </div>
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
            <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground border-b pb-2">
                    Endereço da Escola
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* CEP */}
                    <div className="space-y-2">
                        <Label htmlFor="cepEscola">CEP</Label>
                        <Input
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
                            className={
                                errors['dadosEscola.endereco.cep'] ? 'border-destructive' : ''
                            }
                        />
                        {errors['dadosEscola.endereco.cep'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosEscola.endereco.cep']}
                            </p>
                        )}
                        {cepError && <p className="text-sm text-destructive">{cepError}</p>}
                    </div>

                    {/* Logradouro */}
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="logradouroEscola">Logradouro</Label>
                        <Input
                            id="logradouroEscola"
                            value={data.dadosEscola?.endereco?.logradouro || ''}
                            onChange={(e) => updateEnderecoEscola('logradouro', e.target.value)}
                            placeholder="Rua, Avenida, etc."
                            className={
                                errors['dadosEscola.endereco.logradouro']
                                    ? 'border-destructive'
                                    : ''
                            }
                        />
                        {errors['dadosEscola.endereco.logradouro'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosEscola.endereco.logradouro']}
                            </p>
                        )}
                    </div>

                    {/* Número */}
                    <div className="space-y-2">
                        <Label htmlFor="numeroEscola">Número</Label>
                        <Input
                            id="numeroEscola"
                            value={data.dadosEscola?.endereco?.numero || ''}
                            onChange={(e) => updateEnderecoEscola('numero', e.target.value)}
                            placeholder="123"
                            className={
                                errors['dadosEscola.endereco.numero'] ? 'border-destructive' : ''
                            }
                        />
                        {errors['dadosEscola.endereco.numero'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosEscola.endereco.numero']}
                            </p>
                        )}
                    </div>

                    {/* Complemento */}
                    <div className="space-y-2">
                        <Label htmlFor="complementoEscola">Complemento</Label>
                        <Input
                            id="complementoEscola"
                            value={data.dadosEscola?.endereco?.complemento || ''}
                            onChange={(e) => updateEnderecoEscola('complemento', e.target.value)}
                            placeholder="Bloco, Andar, etc."
                            className={
                                errors['dadosEscola.endereco.complemento']
                                    ? 'border-destructive'
                                    : ''
                            }
                        />
                        {errors['dadosEscola.endereco.complemento'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosEscola.endereco.complemento']}
                            </p>
                        )}
                    </div>

                    {/* Bairro */}
                    <div className="space-y-2">
                        <Label htmlFor="bairroEscola">Bairro</Label>
                        <Input
                            id="bairroEscola"
                            value={data.dadosEscola?.endereco?.bairro || ''}
                            onChange={(e) => updateEnderecoEscola('bairro', e.target.value)}
                            placeholder="Nome do bairro"
                            className={
                                errors['dadosEscola.endereco.bairro'] ? 'border-destructive' : ''
                            }
                        />
                        {errors['dadosEscola.endereco.bairro'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosEscola.endereco.bairro']}
                            </p>
                        )}
                    </div>

                    {/* Cidade */}
                    <div className="space-y-2">
                        <Label htmlFor="cidadeEscola">Cidade</Label>
                        <Input
                            id="cidadeEscola"
                            value={data.dadosEscola?.endereco?.cidade || ''}
                            onChange={(e) => updateEnderecoEscola('cidade', e.target.value)}
                            placeholder="Nome da cidade"
                            className={
                                errors['dadosEscola.endereco.cidade'] ? 'border-destructive' : ''
                            }
                        />
                        {errors['dadosEscola.endereco.cidade'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosEscola.endereco.cidade']}
                            </p>
                        )}
                    </div>

                    {/* UF */}
                    <div className="space-y-2">
                        <Label htmlFor="ufEscola">UF</Label>
                        <select
                            id="ufEscola"
                            value={data.dadosEscola?.endereco?.uf || ''}
                            onChange={(e) => updateEnderecoEscola('uf', e.target.value)}
                            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                errors['dadosEscola.endereco.uf'] ? 'border-destructive' : ''
                            }`}
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
                        {errors['dadosEscola.endereco.uf'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosEscola.endereco.uf']}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
