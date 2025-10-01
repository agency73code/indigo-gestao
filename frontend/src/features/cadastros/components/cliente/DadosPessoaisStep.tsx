import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Cliente } from '../../types/cadastros.types';
import { DateField } from '@/common/components/layout/DateField';
import * as mask from '@/common/utils/mask';

interface DadosPessoaisStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
    onBlur: (field: string) => void;
}

export default function DadosPessoaisStep({
    data,
    onUpdate,
    errors,
    onBlur,
}: DadosPessoaisStepProps) {
    // Inicializar com pelo menos um cuidador se não existir
    useEffect(() => {
        if (!data.cuidadores || data.cuidadores.length === 0) {
            onUpdate('cuidadores', [
                {
                    relacao: null,
                    nome: null,
                    cpf: null,
                    profissao: null,
                    escolaridade: null,
                    telefone: null,
                    email: null,
                    endereco: {
                        cep: null,
                        logradouro: null,
                        numero: null,
                        complemento: null,
                        bairro: null,
                        cidade: null,
                        uf: null,
                    },
                },
            ]);
        }
    }, [data.cuidadores, onUpdate]);

    return (
        <div className="space-y-6">
            <div>
                <h3
                    className="text-lg font-semibold text-primary"
                    style={{ fontFamily: 'Sora, sans-serif' }}
                >
                    Dados Pessoais
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os dados pessoais do cliente. Campos marcados com * são obrigatórios.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                        id="nome"
                        value={data.nome || ''}
                        onChange={(e) => onUpdate('nome', mask.toTitleCaseSimple(e.target.value))}
                        placeholder="Nome completo do cliente"
                        className={errors.nome ? 'border-destructive' : ''}
                    />
                    {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                </div>

                {/* CPF */}
                <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                        id="cpf"
                        value={data.cpf || ''}
                        onChange={(e) => onUpdate('cpf', mask.maskCPF(e.target.value))}
                        onBlur={() => onBlur('cpf')}
                        placeholder="000.000.000-00"
                        className={errors.cpf ? 'border-destructive' : ''}
                    />
                    {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de nascimento *</Label>
                    <DateField
                        value={data.dataNascimento || ''}
                        onChange={(iso) => onUpdate('dataNascimento', iso)}
                        placeholder="dd/mm/aaaa"
                    />
                    {errors.dataNascimento && (
                        <p className="text-sm text-destructive">{errors.dataNascimento}</p>
                    )}
                </div>

                {/* E-mail de contato */}
                <div className="space-y-2">
                    <Label htmlFor="emailContato">E-mail de contato *</Label>
                    <Input
                        id="emailContato"
                        type="email"
                        value={mask.normalizeEmail(data.emailContato || '')}
                        onChange={(e) =>
                            onUpdate('emailContato', mask.normalizeEmail(e.target.value))
                        }
                        placeholder="email@exemplo.com"
                        className={errors.emailContato ? 'border-destructive' : ''}
                    />
                    {errors.emailContato && (
                        <p className="text-sm text-destructive">{errors.emailContato}</p>
                    )}
                </div>

                {/* Data Entrada */}
                <div className="space-y-2">
                    <Label htmlFor="dataEntrada">Data Entrada *</Label>
                    <DateField
                        value={data.dataEntrada || ''}
                        onChange={(iso) => onUpdate('dataEntrada', iso)}
                        placeholder="dd/mm/aaaa"
                    />
                    {errors.dataEntrada && (
                        <p className="text-sm text-destructive">{errors.dataEntrada}</p>
                    )}
                </div>

                {/* Data Saída */}
                <div className="space-y-2">
                    <Label htmlFor="dataSaida">Data Saída</Label>
                    <DateField
                        value={data.dataSaida || ''}
                        onChange={(iso) => onUpdate('dataSaida', iso)}
                        placeholder="dd/mm/aaaa"
                        error={errors.dataSaida}
                    />
                    {errors.dataSaida && (
                        <p className="text-sm text-destructive">{errors.dataSaida}</p>
                    )}
                </div>
            </div>

            {/* Cuidadores */}
            <div className="space-y-4">
                <h4 className="font-medium text-muted-foreground border-b pb-2">Cuidadores</h4>

                {/* Lista de cuidadores */}
                {(data.cuidadores || []).map((cuidador, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Cuidador {index + 1}</h4>
                            {(data.cuidadores || []).length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores.splice(index, 1);
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Relação com o paciente */}
                            <div className="space-y-2">
                                <Label htmlFor={`relacao-${index}`}>Relação com o paciente *</Label>
                                <select
                                    id={`relacao-${index}`}
                                    value={cuidador.relacao || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores[index] = {
                                            ...cuidadores[index],
                                            relacao: e.target.value as any,
                                        };
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                        errors[`cuidadores.${index}.relacao`]
                                            ? 'border-destructive'
                                            : ''
                                    }`}
                                >
                                    <option value="">Selecione a relação</option>
                                    <option value="mae">Mãe</option>
                                    <option value="pai">Pai</option>
                                    <option value="avo">Avó/Avô</option>
                                    <option value="tio">Tia/Tio</option>
                                    <option value="responsavel">Responsável legal</option>
                                    <option value="tutor">Tutor(a)</option>
                                    <option value="outro">Outro (especificar)</option>
                                </select>
                                {errors[`cuidadores.${index}.relacao`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`cuidadores.${index}.relacao`]}
                                    </p>
                                )}
                            </div>

                            {/* Descrição (se Outro) */}
                            {cuidador.relacao === 'outro' && (
                                <div className="space-y-2">
                                    <Label htmlFor={`descricaoRelacao-${index}`}>Descrição *</Label>
                                    <Input
                                        id={`descricaoRelacao-${index}`}
                                        value={cuidador.descricaoRelacao || ''}
                                        onChange={(e) => {
                                            const cuidadores = [...(data.cuidadores || [])];
                                            cuidadores[index] = {
                                                ...cuidadores[index],
                                                descricaoRelacao: e.target.value,
                                            };
                                            onUpdate('cuidadores', cuidadores);
                                        }}
                                        placeholder="Especifique a relação"
                                        className={
                                            errors[`cuidadores.${index}.descricaoRelacao`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                    {errors[`cuidadores.${index}.descricaoRelacao`] && (
                                        <p className="text-sm text-destructive">
                                            {errors[`cuidadores.${index}.descricaoRelacao`]}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Nome completo */}
                            <div className="space-y-2">
                                <Label htmlFor={`nome-${index}`}>Nome completo *</Label>
                                <Input
                                    id={`nome-${index}`}
                                    value={cuidador.nome || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores[index] = {
                                            ...cuidadores[index],
                                            nome: mask.maskPersonName(e.target.value),
                                        };
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    placeholder="Nome completo do cuidador"
                                    className={
                                        errors[`cuidadores.${index}.nome`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`cuidadores.${index}.nome`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`cuidadores.${index}.nome`]}
                                    </p>
                                )}
                            </div>

                            {/* CPF */}
                            <div className="space-y-2">
                                <Label htmlFor={`cpf-${index}`}>CPF *</Label>
                                <Input
                                    id={`cpf-${index}`}
                                    value={cuidador.cpf || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores[index] = {
                                            ...cuidadores[index],
                                            cpf: mask.maskCPF(e.target.value),
                                        };
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    onBlur={() => onBlur(`cuidadores.${index}.cpf`)}
                                    placeholder="000.000.000-00"
                                    className={
                                        errors[`cuidadores.${index}.cpf`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`cuidadores.${index}.cpf`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`cuidadores.${index}.cpf`]}
                                    </p>
                                )}
                            </div>

                            {/* Profissão */}
                            <div className="space-y-2">
                                <Label htmlFor={`profissao-${index}`}>Profissão</Label>
                                <Input
                                    id={`profissao-${index}`}
                                    value={cuidador.profissao || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores[index] = {
                                            ...cuidadores[index],
                                            profissao: e.target.value,
                                        };
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    placeholder="Profissão do cuidador"
                                    className={
                                        errors[`cuidadores.${index}.profissao`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`cuidadores.${index}.profissao`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`cuidadores.${index}.profissao`]}
                                    </p>
                                )}
                            </div>

                            {/* Escolaridade */}
                            <div className="space-y-2">
                                <Label htmlFor={`escolaridade-${index}`}>Escolaridade</Label>
                                <select
                                    id={`escolaridade-${index}`}
                                    value={cuidador.escolaridade || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores[index] = {
                                            ...cuidadores[index],
                                            escolaridade: e.target.value,
                                        };
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                        errors[`cuidadores.${index}.escolaridade`]
                                            ? 'border-destructive'
                                            : ''
                                    }`}
                                >
                                    <option value="">Selecione a escolaridade</option>
                                    <option value="fundamental-incompleto">
                                        Ensino Fundamental Incompleto
                                    </option>
                                    <option value="fundamental-completo">
                                        Ensino Fundamental Completo
                                    </option>
                                    <option value="medio-incompleto">
                                        Ensino Médio Incompleto
                                    </option>
                                    <option value="medio-completo">Ensino Médio Completo</option>
                                    <option value="superior-incompleto">
                                        Ensino Superior Incompleto
                                    </option>
                                    <option value="superior-completo">
                                        Ensino Superior Completo
                                    </option>
                                    <option value="pos-graduacao">Pós-graduação</option>
                                </select>
                                {errors[`cuidadores.${index}.escolaridade`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`cuidadores.${index}.escolaridade`]}
                                    </p>
                                )}
                            </div>

                            {/* Telefone */}
                            <div className="space-y-2">
                                <Label htmlFor={`telefone-${index}`}>Telefone *</Label>
                                <Input
                                    id={`telefone-${index}`}
                                    value={cuidador.telefone || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores[index] = {
                                            ...cuidadores[index],
                                            telefone: mask.maskBRPhone(e.target.value),
                                        };
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    onBlur={() => onBlur(`cuidadores.${index}.telefone`)}
                                    placeholder="(11) 99999-9999"
                                    className={
                                        errors[`cuidadores.${index}.telefone`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`cuidadores.${index}.telefone`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`cuidadores.${index}.telefone`]}
                                    </p>
                                )}
                            </div>

                            {/* E-mail */}
                            <div className="space-y-2">
                                <Label htmlFor={`email-${index}`}>E-mail *</Label>
                                <Input
                                    id={`email-${index}`}
                                    type="email"
                                    value={cuidador.email || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        cuidadores[index] = {
                                            ...cuidadores[index],
                                            email: mask.normalizeEmail(e.target.value),
                                        };
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    onBlur={() => onBlur(`cuidadores.${index}.email`)}
                                    placeholder="email@exemplo.com"
                                    className={
                                        errors[`cuidadores.${index}.email`]
                                            ? 'border-destructive'
                                            : ''
                                    }
                                />
                                {errors[`cuidadores.${index}.email`] && (
                                    <p className="text-sm text-destructive">
                                        {errors[`cuidadores.${index}.email`]}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Endereço do cuidador */}
                        <div className="space-y-4">
                            <h5 className="text-sm font-medium text-muted-foreground">Endereço</h5>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CEP */}
                                <div className="space-y-2">
                                    <Label htmlFor={`cep-cuidador-${index}`}>CEP</Label>
                                    <Input
                                        id={`cep-cuidador-${index}`}
                                        value={cuidador.endereco?.cep || ''}
                                        onChange={async (e) => {
                                            const masked = mask.maskCEP(e.target.value);
                                            const digits = masked.replace(/\D/g, '');

                                            const cuidadores = [...(data.cuidadores || [])];
                                            if (!cuidadores[index].endereco)
                                                cuidadores[index].endereco = {};
                                            cuidadores[index].endereco.cep = masked;
                                            onUpdate('cuidadores', cuidadores);

                                            // Quando completar 8 dígitos, busca no ViaCEP e preenche endereço
                                            if (digits.length === 8) {
                                                try {
                                                    const resp = await fetch(
                                                        `https://viacep.com.br/ws/${digits}/json/`,
                                                    );
                                                    const json = await resp.json();
                                                    if (!json.erro) {
                                                        const c = [...(data.cuidadores || [])];
                                                        if (!c[index].endereco)
                                                            c[index].endereco = {};
                                                        c[index].endereco.logradouro =
                                                            json.logradouro || '';
                                                        c[index].endereco.bairro =
                                                            json.bairro || '';
                                                        c[index].endereco.cidade =
                                                            json.localidade || json.cidade || '';
                                                        c[index].endereco.uf = json.uf || '';
                                                        onUpdate('cuidadores', c);
                                                    }
                                                } catch {
                                                    // silencioso
                                                }
                                            }
                                        }}
                                        placeholder="00000-000"
                                        className={
                                            errors[`cuidadores.${index}.endereco.cep`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                </div>

                                {/* Logradouro */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor={`logradouro-cuidador-${index}`}>
                                        Logradouro
                                    </Label>
                                    <Input
                                        id={`logradouro-cuidador-${index}`}
                                        value={cuidador.endereco?.logradouro || ''}
                                        onChange={(e) => {
                                            const cuidadores = [...(data.cuidadores || [])];
                                            if (!cuidadores[index].endereco)
                                                cuidadores[index].endereco = {};
                                            cuidadores[index].endereco.logradouro = e.target.value;
                                            onUpdate('cuidadores', cuidadores);
                                        }}
                                        placeholder="Rua, Avenida, etc."
                                        className={
                                            errors[`cuidadores.${index}.endereco.logradouro`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                </div>

                                {/* Número */}
                                <div className="space-y-2">
                                    <Label htmlFor={`numero-cuidador-${index}`}>Número</Label>
                                    <Input
                                        id={`numero-cuidador-${index}`}
                                        value={cuidador.endereco?.numero || ''}
                                        onChange={(e) => {
                                            const cuidadores = [...(data.cuidadores || [])];
                                            if (!cuidadores[index].endereco)
                                                cuidadores[index].endereco = {};
                                            cuidadores[index].endereco.numero = e.target.value;
                                            onUpdate('cuidadores', cuidadores);
                                        }}
                                        placeholder="123"
                                        className={
                                            errors[`cuidadores.${index}.endereco.numero`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                </div>

                                {/* Complemento */}
                                <div className="space-y-2">
                                    <Label htmlFor={`complemento-cuidador-${index}`}>
                                        Complemento
                                    </Label>
                                    <Input
                                        id={`complemento-cuidador-${index}`}
                                        value={cuidador.endereco?.complemento || ''}
                                        onChange={(e) => {
                                            const cuidadores = [...(data.cuidadores || [])];
                                            if (!cuidadores[index].endereco)
                                                cuidadores[index].endereco = {};
                                            cuidadores[index].endereco.complemento = e.target.value;
                                            onUpdate('cuidadores', cuidadores);
                                        }}
                                        placeholder="Apto, Casa, etc."
                                        className={
                                            errors[`cuidadores.${index}.endereco.complemento`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                </div>

                                {/* Bairro */}
                                <div className="space-y-2">
                                    <Label htmlFor={`bairro-cuidador-${index}`}>Bairro</Label>
                                    <Input
                                        id={`bairro-cuidador-${index}`}
                                        value={cuidador.endereco?.bairro || ''}
                                        onChange={(e) => {
                                            const cuidadores = [...(data.cuidadores || [])];
                                            if (!cuidadores[index].endereco)
                                                cuidadores[index].endereco = {};
                                            cuidadores[index].endereco.bairro = e.target.value;
                                            onUpdate('cuidadores', cuidadores);
                                        }}
                                        placeholder="Nome do bairro"
                                        className={
                                            errors[`cuidadores.${index}.endereco.bairro`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                </div>

                                {/* Cidade */}
                                <div className="space-y-2">
                                    <Label htmlFor={`cidade-cuidador-${index}`}>Cidade</Label>
                                    <Input
                                        id={`cidade-cuidador-${index}`}
                                        value={cuidador.endereco?.cidade || ''}
                                        onChange={(e) => {
                                            const cuidadores = [...(data.cuidadores || [])];
                                            if (!cuidadores[index].endereco)
                                                cuidadores[index].endereco = {};
                                            cuidadores[index].endereco.cidade = e.target.value;
                                            onUpdate('cuidadores', cuidadores);
                                        }}
                                        placeholder="Nome da cidade"
                                        className={
                                            errors[`cuidadores.${index}.endereco.cidade`]
                                                ? 'border-destructive'
                                                : ''
                                        }
                                    />
                                </div>

                                {/* UF */}
                                <div className="space-y-2">
                                    <Label htmlFor={`uf-cuidador-${index}`}>UF</Label>
                                    <select
                                        id={`uf-cuidador-${index}`}
                                        value={cuidador.endereco?.uf || ''}
                                        onChange={(e) => {
                                            const cuidadores = [...(data.cuidadores || [])];
                                            if (!cuidadores[index].endereco)
                                                cuidadores[index].endereco = {};
                                            cuidadores[index].endereco.uf = e.target.value;
                                            onUpdate('cuidadores', cuidadores);
                                        }}
                                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                                            errors[`cuidadores.${index}.endereco.uf`]
                                                ? 'border-destructive'
                                                : ''
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
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Botão para adicionar cuidador */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        const cuidadores = [...(data.cuidadores || [])];
                        cuidadores.push({
                            relacao: '',
                            nome: '',
                            cpf: '',
                            profissao: '',
                            escolaridade: '',
                            telefone: '',
                            email: '',
                            endereco: {
                                cep: '',
                                logradouro: '',
                                numero: '',
                                complemento: '',
                                bairro: '',
                                cidade: '',
                                uf: '',
                            },
                        });
                        onUpdate('cuidadores', cuidadores);
                    }}
                    className="w-full flex items-center gap-2 mb-8"
                >
                    <Plus className="w-4 h-4" />
                    Adicionar cuidador
                </Button>
            </div>
        </div>
    );
}
