import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import type { Terapeuta } from '../types/cadastros.types';

interface DadosPessoaisStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function DadosPessoaisStep({ data, onUpdate, errors }: DadosPessoaisStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-primary font-sora">Dados Pessoais</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os dados pessoais do terapeuta. Campos marcados com * são obrigatórios.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                        id="nome"
                        value={data.nome || ''}
                        onChange={(e) => onUpdate('nome', e.target.value)}
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
                        onChange={(e) => onUpdate('cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        className={errors.cpf ? 'border-destructive' : ''}
                    />
                    {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                    <Input
                        id="dataNascimento"
                        type="date"
                        value={data.dataNascimento || ''}
                        onChange={(e) => onUpdate('dataNascimento', e.target.value)}
                        className={errors.dataNascimento ? 'border-destructive' : ''}
                    />
                    {errors.dataNascimento && (
                        <p className="text-sm text-destructive">{errors.dataNascimento}</p>
                    )}
                </div>
            </div>

            {/* Primeira linha - Email e Email Índigo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onUpdate('email', e.target.value)}
                        placeholder="email@exemplo.com"
                        className={errors.email ? 'border-destructive' : ''}
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
                        placeholder="email@indigo.com"
                        className={errors.emailIndigo ? 'border-destructive' : ''}
                    />
                    {errors.emailIndigo && (
                        <p className="text-sm text-destructive">{errors.emailIndigo}</p>
                    )}
                </div>
            </div>

            {/* Segunda linha - Celular e CPF */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="celular">Celular *</Label>
                    <Input
                        id="celular"
                        value={data.celular || ''}
                        onChange={(e) => onUpdate('celular', e.target.value)}
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
                        onChange={(e) => onUpdate('telefone', e.target.value)}
                        placeholder="(11) 3333-4444"
                        className={errors.telefone ? 'border-destructive' : ''}
                    />
                    {errors.telefone && (
                        <p className="text-sm text-destructive">{errors.telefone}</p>
                    )}
                </div>
            </div>

            {/* Seção Veículo */}
            <div className="space-y-4 border-t pt-6">
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="placaVeiculo">Placa do Veículo *</Label>
                            <Input
                                id="placaVeiculo"
                                value={data.placaVeiculo || ''}
                                onChange={(e) => onUpdate('placaVeiculo', e.target.value)}
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
                <h3 className="text-lg font-semibold text-primary font-sora">Dados para pagamento</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os dados necessários para cadastro bancário do terapeuta.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        onChange={(e) => onUpdate('agencia', e.target.value)}
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
                        onChange={(e) => onUpdate('conta', e.target.value)}
                        placeholder="Digite o número da conta"
                        className={errors.conta ? 'border-destructive' : ''}
                    />
                    {errors.conta && <p className="text-sm text-destructive">{errors.conta}</p>}
                </div>

                <div className="space-y-2">
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
            </div>
        </div>
    );
}
