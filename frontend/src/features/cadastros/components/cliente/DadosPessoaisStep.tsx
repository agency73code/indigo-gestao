import { InputField } from '@/ui/input-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import { SelectField } from '@/ui/select-field';
import { Button } from '@/ui/button';
import { Plus, X } from 'lucide-react';
import { useEffect } from 'react';
import type { Cliente } from '../../types/cadastros.types';
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

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Nome - 2/4 */}
                <div className="md:col-span-2">
                    <InputField
                        label="Nome *"
                        id="nome"
                        value={data.nome || ''}
                        onChange={(e) => onUpdate('nome', mask.toTitleCaseSimple(e.target.value))}
                        placeholder="Nome completo do cliente"
                        error={errors.nome}
                    />
                </div>

                {/* CPF - 1/4 */}
                <InputField
                    label="CPF *"
                    id="cpf"
                    value={data.cpf || ''}
                    onChange={(e) => onUpdate('cpf', mask.maskCPF(e.target.value))}
                    onBlur={() => onBlur('cpf')}
                    placeholder="000.000.000-00"
                    error={errors.cpf}
                />

                {/* Data de Nascimento - 1/4 */}
                <DateFieldWithLabel
                    label="Data de nascimento *"
                    value={data.dataNascimento || ''}
                    onChange={(iso) => onUpdate('dataNascimento', iso)}
                    placeholder="dd/mm/aaaa"
                    error={errors.dataNascimento}
                />

                {/* E-mail de contato - 2/4 */}
                <div className="md:col-span-2">
                    <InputField
                        label="E-mail de contato *"
                        id="emailContato"
                        type="email"
                        value={mask.normalizeEmail(data.emailContato || '')}
                        onChange={(e) =>
                            onUpdate('emailContato', mask.normalizeEmail(e.target.value))
                        }
                        placeholder="email@exemplo.com"
                        error={errors.emailContato}
                    />
                </div>

                {/* Data Entrada - 1/4 */}
                <DateFieldWithLabel
                    label="Data Entrada *"
                    value={data.dataEntrada || ''}
                    onChange={(iso) => onUpdate('dataEntrada', iso)}
                    placeholder="dd/mm/aaaa"
                    error={errors.dataEntrada}
                />

                {/* Data Saída - 1/4 */}
                <DateFieldWithLabel
                    label="Data Saída"
                    value={data.dataSaida || ''}
                    onChange={(iso) => onUpdate('dataSaida', iso)}
                    placeholder="dd/mm/aaaa"
                    error={errors.dataSaida}
                />
            </div>

            {/* Cuidadores */}
            <div className="space-y-4">

                {/* Lista de cuidadores */}
                {(data.cuidadores || []).map((cuidador, index) => (
                    <div key={index} className="space-y-4 ">
                        <div className="flex items-center justify-between">
                            <h4 
                                style={{ 
                                    fontFamily: "var(--hub-card-title-font-family)",
                                    fontWeight: "var(--hub-card-title-font-weight)",
                                    color: "var(--hub-card-title-color)"
                                }}
                                className="leading-none tracking-tight"
                            >
                                Cuidador {index + 1}
                            </h4>
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Nome completo - 2/4 */}
                            <div className="md:col-span-2">
                                <InputField
                                    label="Nome completo *"
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
                                    error={errors[`cuidadores.${index}.nome`]}
                                />
                            </div>

                            {/* CPF - 1/4 */}
                            <InputField
                                label="CPF *"
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
                                error={errors[`cuidadores.${index}.cpf`]}
                            />

                            {/* Data de Nascimento - 1/4 */}
                            <DateFieldWithLabel
                                label="Data de Nascimento *"
                                value={cuidador.dataNascimento || ''}
                                onChange={(iso) => {
                                    const cuidadores = [...(data.cuidadores || [])];
                                    cuidadores[index] = {
                                        ...cuidadores[index],
                                        dataNascimento: iso,
                                    };
                                    onUpdate('cuidadores', cuidadores);
                                }}
                                placeholder="dd/mm/aaaa"
                                error={errors[`cuidadores.${index}.dataNascimento`]}
                            />
                        </div>

                        {/* Segunda linha - Relação */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Relação com o cliente - 1/4 */}
                            <SelectField
                                label="Relação com o cliente *"
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
                                error={errors[`cuidadores.${index}.relacao`]}
                            >
                                <option value="">Selecione a relação</option>
                                <option value="mae">Mãe</option>
                                <option value="pai">Pai</option>
                                <option value="avo">Avó/Avô</option>
                                <option value="tio">Tia/Tio</option>
                                <option value="responsavel">Responsável legal</option>
                                <option value="tutor">Tutor(a)</option>
                                <option value="outro">Outro (especificar)</option>
                            </SelectField>

                            {/* Descrição (se Outro) */}
                            {cuidador.relacao === 'outro' && (
                                <InputField
                                    label="Descrição *"
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
                                    error={errors[`cuidadores.${index}.descricaoRelacao`]}
                                />
                            )}

                            {/* E-mail - 2/4 */}
                            <div className="md:col-span-2">
                                <InputField
                                    label="E-mail *"
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
                                    error={errors[`cuidadores.${index}.email`]}
                                />
                            </div>

                            {/* Telefone - 1/4 */}
                            <InputField
                                label="Telefone *"
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
                                placeholder="(00) 00000-0000"
                                error={errors[`cuidadores.${index}.telefone`]}
                            />
                        </div>

                        {/* Terceira linha - Profissão e Escolaridade */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Profissão - 2/4 */}
                            <div className="md:col-span-2">
                                <InputField
                                    label="Profissão"
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
                                    error={errors[`cuidadores.${index}.profissao`]}
                                />
                            </div>

                            {/* Escolaridade - 2/4 */}
                            <div className="md:col-span-2">
                                <SelectField
                                    label="Escolaridade *"
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
                                    onBlur={() => onBlur(`cuidadores.${index}.escolaridade`)}
                                    error={errors[`cuidadores.${index}.escolaridade`]}
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
                                </SelectField>
                            </div>
                        </div>

                        {/* Endereço do cuidador */}
                        <div className="space-y-4">
                            <h5 
                                style={{ 
                                    fontFamily: "var(--hub-card-title-font-family)",
                                    fontWeight: "var(--hub-card-title-font-weight)",
                                    color: "var(--hub-card-title-color)"
                                }}
                                className="text-sm leading-none tracking-tight"
                            >
                                Endereço
                            </h5>

                            {/* Primeira linha: CEP e Logradouro */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* CEP - 1/3 */}
                                <InputField
                                    label="CEP"
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
                                    error={errors[`cuidadores.${index}.endereco.cep`]}
                                />

                                {/* Logradouro - 2/3 */}
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Logradouro"
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
                                        error={errors[`cuidadores.${index}.endereco.logradouro`]}
                                    />
                                </div>
                            </div>

                            {/* Segunda linha: Número, Complemento, Bairro */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Número - 1/3 */}
                                <InputField
                                    label="Número"
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
                                    error={errors[`cuidadores.${index}.endereco.numero`]}
                                />

                                {/* Complemento - 1/3 */}
                                <InputField
                                    label="Complemento"
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
                                    error={errors[`cuidadores.${index}.endereco.complemento`]}
                                />

                                {/* Bairro - 1/3 */}
                                <InputField
                                    label="Bairro"
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
                                    error={errors[`cuidadores.${index}.endereco.bairro`]}
                                />
                            </div>

                            {/* Terceira linha: Cidade e UF */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Cidade - 2/3 */}
                                <div className="md:col-span-2">
                                    <InputField
                                        label="Cidade"
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
                                        error={errors[`cuidadores.${index}.endereco.cidade`]}
                                    />
                                </div>

                                {/* UF - 1/3 */}
                                <SelectField
                                    label="UF"
                                    id={`uf-cuidador-${index}`}
                                    value={cuidador.endereco?.uf || ''}
                                    onChange={(e) => {
                                        const cuidadores = [...(data.cuidadores || [])];
                                        if (!cuidadores[index].endereco)
                                            cuidadores[index].endereco = {};
                                        cuidadores[index].endereco.uf = e.target.value;
                                        onUpdate('cuidadores', cuidadores);
                                    }}
                                    error={errors[`cuidadores.${index}.endereco.uf`]}
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
