import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import type { Cliente } from '../../types/cadastros.types';

interface DadosEscolaStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
}

export default function DadosEscolaStep({ data, onUpdate, errors }: DadosEscolaStepProps) {
    const updateDadosEscola = (field: string, value: any) => {
        onUpdate(`dadosEscola.${field}`, value);
    };

    const updateEnderecoEscola = (field: string, value: any) => {
        onUpdate(`dadosEscola.endereco.${field}`, value);
    };

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
                        onChange={(e) => updateDadosEscola('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className={errors['dadosEscola.telefone'] ? 'border-destructive' : ''}
                    />
                    {errors['dadosEscola.telefone'] && (
                        <p className="text-sm text-destructive">{errors['dadosEscola.telefone']}</p>
                    )}
                </div>

                {/* E-mail */}
                <div className="space-y-2">
                    <Label htmlFor="emailEscola">E-mail</Label>
                    <Input
                        id="emailEscola"
                        type="email"
                        value={data.dadosEscola?.email || ''}
                        onChange={(e) => updateDadosEscola('email', e.target.value)}
                        placeholder="escola@exemplo.com"
                        className={errors['dadosEscola.email'] ? 'border-destructive' : ''}
                    />
                    {errors['dadosEscola.email'] && (
                        <p className="text-sm text-destructive">{errors['dadosEscola.email']}</p>
                    )}
                </div>
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
                            onChange={(e) => updateEnderecoEscola('cep', e.target.value)}
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
