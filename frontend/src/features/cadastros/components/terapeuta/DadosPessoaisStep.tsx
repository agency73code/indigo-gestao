import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import type { Terapeuta } from '../../types/cadastros.types';
import { DateField } from '@/common/components/layout/DateField';

import {
    maskCPF,
    maskBRPhone,
    onlyDigits,
    maskPlate,
    maskPersonName,
    maskBRL,
} from '@/common/utils/mask';

interface DadosPessoaisStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: any) => void;
    onBlurField?: (field: string) => void; // <- novo
    errors: Record<string, string>;
}

export default function DadosPessoaisStep({
    data,
    onUpdate,
    onBlurField,
    errors,
}: DadosPessoaisStepProps) {
    return (
        <div className="space-y-4 md:space-y-6">
            <div>
                <h3 className="text-base  sm:text-lg font-semibold text-primary">Dados Pessoais</h3>
                <p className="text-xs sm:text-xs  text-muted-foreground mt-1">
                    Informe os dados pessoais do terapeuta. Campos marcados com * são obrigatórios.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                        id="nome"
                        value={data.nome || ''}
                        onChange={(e) => onUpdate('nome', maskPersonName(e.target.value))}
                        onBlur={(e) => onUpdate('nome', maskPersonName(e.target.value).trim())}
                        placeholder="Digite o nome completo"
                        className={errors.nome ? 'border-destructive' : ''}
                    />
                    {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                        id="cpf"
                        value={data.cpf || ''}
                        onChange={(e) => onUpdate('cpf', maskCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        className={errors.cpf ? 'border-destructive' : ''}
                        ria-invalid={!!errors.cpf}
                        aria-describedby={errors.cpf ? 'cpf-error' : undefined}
                    />
                    <p id="cpf-error" className="text-sm text-destructive">
                        {errors.cpf}
                    </p>
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
            </div>

            {/* Primeira linha - Email e Email Índigo */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onUpdate('email', e.target.value)}
                        onBlur={() => onBlurField?.('email')}
                        placeholder="email@exemplo.com"
                        className={errors.email ? 'border-destructive' : ''}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="emailIndigo">E-mail Índigo *</Label>
                    <Input
                        id="emailIndigo"
                        type="email"
                        value={data.emailIndigo || ''}
                        onChange={(e) => onUpdate('emailIndigo', e.target.value)}
                        onBlur={() => onBlurField?.('email')}
                        placeholder="email@indigo.com"
                        className={errors.emailIndigo ? 'border-destructive' : ''}
                        aria-invalid={!!errors.emailIndigo}
                        aria-describedby={errors.emailIndigo ? 'emailIndigo-error' : undefined}
                    />
                    {errors.emailIndigo && (
                        <p className="text-sm text-destructive">{errors.emailIndigo}</p>
                    )}
                </div>
            </div>

            {/* Segunda linha - Celular e CPF */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                <div className="space-y-2">
                    <Label htmlFor="celular">Celular *</Label>
                    <Input
                        id="celular"
                        value={data.celular || ''}
                        onChange={(e) => onUpdate('celular', maskBRPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        className={errors.celular ? 'border-destructive' : ''}
                    />
                    {errors.celular && <p className="text-sm text-destructive">{errors.celular}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                        id="telefone"
                        value={data.telefone || ''}
                        onChange={(e) => onUpdate('telefone', maskBRPhone(e.target.value))}
                        placeholder="(11) 3333-4444"
                        className={errors.telefone ? 'border-destructive' : ''}
                    />
                    {errors.telefone && (
                        <p className="text-sm text-destructive">{errors.telefone}</p>
                    )}
                </div>
            </div>

            {/* Seção Veículo */}
            <div className="space-y-4 md:space-y-6 border-t pt-6">
                <div className="space-y-2">
                    <Label htmlFor="possuiVeiculo">Possui Veículo? *</Label>
                    <select
                        id="possuiVeiculo"
                        value={data.possuiVeiculo || ''}
                        onChange={(e) => onUpdate('possuiVeiculo', e.target.value)}
                        className={`flex h-10 w-full rounded-[5px] border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            errors.possuiVeiculo ? 'border-destructive' : ''
                        }`}
                    >
                        <option value="">Selecione</option>
                        <option value="sim">Sim</option>
                        <option value="nao">Não</option>
                    </select>
                    {errors.possuiVeiculo && (
                        <p className="text-sm text-destructive">{errors.possuiVeiculo}</p>
                    )}
                </div>

                {/* Campos condicionais do veículo */}
                {data.possuiVeiculo === 'sim' && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="placaVeiculo">Placa do Veículo *</Label>
                            <Input
                                id="placaVeiculo"
                                value={data.placaVeiculo || ''}
                                onChange={(e) =>
                                    onUpdate('placaVeiculo', maskPlate(e.target.value))
                                }
                                placeholder="ABC-1234"
                                className={errors.placaVeiculo ? 'border-destructive' : ''}
                            />
                            {errors.placaVeiculo && (
                                <p className="text-sm text-destructive">{errors.placaVeiculo}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="modeloVeiculo">Modelo do Veículo *</Label>
                            <Input
                                id="modeloVeiculo"
                                value={data.modeloVeiculo || ''}
                                onChange={(e) => onUpdate('modeloVeiculo', e.target.value)}
                                placeholder="Ex: Honda Civic"
                                className={errors.modeloVeiculo ? 'border-destructive' : ''}
                            />
                            {errors.modeloVeiculo && (
                                <p className="text-sm text-destructive">{errors.modeloVeiculo}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-base sm:text-lg font-semibold text-primary font-sora">
                    Dados para pagamento
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Informe os dados necessários para cadastro bancário do terapeuta.
                </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                <div className="space-y-2">
                    <Label htmlFor="banco">Banco *</Label>
                    <Input
                        id="banco"
                        value={data.banco || ''}
                        onChange={(e) => onUpdate('banco', e.target.value)}
                        placeholder="Digite o nome do banco"
                        className={errors.banco ? 'border-destructive' : ''}
                    />
                    {errors.banco && <p className="text-sm text-destructive">{errors.banco}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="agencia">Agência *</Label>
                    <Input
                        id="agencia"
                        value={data.agencia || ''}
                        onChange={(e) => onUpdate('agencia', onlyDigits(e.target.value))}
                        placeholder="Digite o número da agência"
                        className={errors.agencia ? 'border-destructive' : ''}
                    />
                    {errors.agencia && <p className="text-sm text-destructive">{errors.agencia}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="conta">Conta *</Label>
                    <Input
                        id="conta"
                        value={data.conta || ''}
                        onChange={(e) => onUpdate('conta', onlyDigits(e.target.value))}
                        placeholder="Digite o número da conta"
                        className={errors.conta ? 'border-destructive' : ''}
                    />
                    {errors.conta && <p className="text-sm text-destructive">{errors.conta}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="chavePix">Chave Pix *</Label>
                    <Input
                        id="chavePix"
                        type="text"
                        value={data.chavePix || ''}
                        onChange={(e) => onUpdate('chavePix', e.target.value)}
                        placeholder="Digite sua chave Pix"
                        className={errors.chavePix ? 'border-destructive' : ''}
                    />
                    {errors.chavePix && (
                        <p className="text-sm text-destructive">{errors.chavePix}</p>
                    )}
                </div>
                <div className="space-y-2 md:col-span-1">
                    <Label htmlFor="valorHoraAcordado">Valor acordado por hora</Label>
                    <Input
                        id="valorHoraAcordado"
                        // [-] era type="number"
                        type="text"
                        inputMode="numeric"
                        value={data.valorHoraAcordado ?? ''} // pode ser string mascarada no estado
                        onChange={(e) => onUpdate('valorHoraAcordado', maskBRL(e.target.value))}
                        placeholder="R$ 0,00"
                        aria-describedby="valorHoraAcordado-help"
                        className={errors.valorHoraAcordado ? 'border-destructive' : ''}
                    />
                    <p id="valorHoraAcordado-help" className="text-xs text-muted-foreground">
                        Valor bruto acordado por hora de atendimento.
                    </p>
                    {errors.valorHoraAcordado && (
                        <p className="text-sm text-destructive">{errors.valorHoraAcordado}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
