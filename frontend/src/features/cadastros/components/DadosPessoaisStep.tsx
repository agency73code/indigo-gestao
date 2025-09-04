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
            <h3 className="text-lg font-semibold">Dados Pessoais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                        id="email"
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onUpdate('email', e.target.value)}
                        placeholder="Digite o e-mail"
                        className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                        id="telefone"
                        value={data.telefone || ''}
                        onChange={(e) => onUpdate('telefone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className={errors.telefone ? 'border-destructive' : ''}
                    />
                    {errors.telefone && (
                        <p className="text-sm text-destructive">{errors.telefone}</p>
                    )}
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
                    <Label htmlFor="rg">RG *</Label>
                    <Input
                        id="rg"
                        value={data.rg || ''}
                        onChange={(e) => onUpdate('rg', e.target.value)}
                        placeholder="00.000.000-0"
                        className={errors.rg ? 'border-destructive' : ''}
                    />
                    {errors.rg && <p className="text-sm text-destructive">{errors.rg}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                    <Label htmlFor="estadoCivil">Estado Civil *</Label>
                    <select
                        id="estadoCivil"
                        value={data.estadoCivil || ''}
                        onChange={(e) => onUpdate('estadoCivil', e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            errors.estadoCivil ? 'border-destructive' : ''
                        }`}
                    >
                        <option value="">Selecione</option>
                        <option value="solteiro">Solteiro(a)</option>
                        <option value="casado">Casado(a)</option>
                        <option value="divorciado">Divorciado(a)</option>
                        <option value="viuvo">Viúvo(a)</option>
                        <option value="uniao_estavel">União Estável</option>
                    </select>
                    {errors.estadoCivil && (
                        <p className="text-sm text-destructive">{errors.estadoCivil}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
