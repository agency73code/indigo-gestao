import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import type { Cliente } from '../../types/cadastros.types';

interface DadosPessoaisStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: any) => void;
    errors: Record<string, string>;
}

export default function DadosPessoaisStep({ data, onUpdate, errors }: DadosPessoaisStepProps) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
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
                        onChange={(e) => onUpdate('nome', e.target.value)}
                        placeholder="Nome completo do cliente"
                        className={errors.nome ? 'border-destructive' : ''}
                    />
                    {errors.nome && <p className="text-sm text-destructive">{errors.nome}</p>}
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                    <Label htmlFor="dataNascimento">Data de nascimento *</Label>
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

                {/* Nome da Mãe */}
                <div className="space-y-2">
                    <Label htmlFor="nomeMae">Nome da mãe *</Label>
                    <Input
                        id="nomeMae"
                        value={data.nomeMae || ''}
                        onChange={(e) => onUpdate('nomeMae', e.target.value)}
                        placeholder="Nome completo da mãe"
                        className={errors.nomeMae ? 'border-destructive' : ''}
                    />
                    {errors.nomeMae && <p className="text-sm text-destructive">{errors.nomeMae}</p>}
                </div>

                {/* CPF da Mãe */}
                <div className="space-y-2">
                    <Label htmlFor="cpfMae">CPF da mãe *</Label>
                    <Input
                        id="cpfMae"
                        value={data.cpfMae || ''}
                        onChange={(e) => onUpdate('cpfMae', e.target.value)}
                        placeholder="000.000.000-00"
                        className={errors.cpfMae ? 'border-destructive' : ''}
                    />
                    {errors.cpfMae && <p className="text-sm text-destructive">{errors.cpfMae}</p>}
                </div>

                {/* Nome Pai */}
                <div className="space-y-2">
                    <Label htmlFor="nomePai">Nome Pai</Label>
                    <Input
                        id="nomePai"
                        value={data.nomePai || ''}
                        onChange={(e) => onUpdate('nomePai', e.target.value)}
                        placeholder="Nome completo do pai"
                        className={errors.nomePai ? 'border-destructive' : ''}
                    />
                    {errors.nomePai && <p className="text-sm text-destructive">{errors.nomePai}</p>}
                </div>

                {/* CPF Pai */}
                <div className="space-y-2">
                    <Label htmlFor="cpfPai">CPF Pai</Label>
                    <Input
                        id="cpfPai"
                        value={data.cpfPai || ''}
                        onChange={(e) => onUpdate('cpfPai', e.target.value)}
                        placeholder="000.000.000-00"
                        className={errors.cpfPai ? 'border-destructive' : ''}
                    />
                    {errors.cpfPai && <p className="text-sm text-destructive">{errors.cpfPai}</p>}
                </div>

                {/* Telefone Pai */}
                <div className="space-y-2">
                    <Label htmlFor="telefonePai">Telefone Pai</Label>
                    <Input
                        id="telefonePai"
                        value={data.telefonePai || ''}
                        onChange={(e) => onUpdate('telefonePai', e.target.value)}
                        placeholder="(11) 99999-9999"
                        className={errors.telefonePai ? 'border-destructive' : ''}
                    />
                    {errors.telefonePai && (
                        <p className="text-sm text-destructive">{errors.telefonePai}</p>
                    )}
                </div>

                {/* E-mail de contato */}
                <div className="space-y-2">
                    <Label htmlFor="emailContato">E-mail de contato *</Label>
                    <Input
                        id="emailContato"
                        type="email"
                        value={data.emailContato || ''}
                        onChange={(e) => onUpdate('emailContato', e.target.value)}
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
                    <Input
                        id="dataEntrada"
                        type="date"
                        value={data.dataEntrada || ''}
                        onChange={(e) => onUpdate('dataEntrada', e.target.value)}
                        className={errors.dataEntrada ? 'border-destructive' : ''}
                    />
                    {errors.dataEntrada && (
                        <p className="text-sm text-destructive">{errors.dataEntrada}</p>
                    )}
                </div>

                {/* Data Saída */}
                <div className="space-y-2">
                    <Label htmlFor="dataSaida">Data Saída</Label>
                    <Input
                        id="dataSaida"
                        type="date"
                        value={data.dataSaida || ''}
                        onChange={(e) => onUpdate('dataSaida', e.target.value)}
                        className={errors.dataSaida ? 'border-destructive' : ''}
                    />
                    {errors.dataSaida && (
                        <p className="text-sm text-destructive">{errors.dataSaida}</p>
                    )}
                </div>
            </div>

            {/* Mais de um Pai? */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Mais de um Pai? *</Label>
                    <div className="flex gap-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="maisDeUmPai"
                                value="sim"
                                checked={data.maisDeUmPai === 'sim'}
                                onChange={(e) => onUpdate('maisDeUmPai', e.target.value)}
                                className="text-primary"
                            />
                            <span>Sim</span>
                        </label>
                        <label className="flex items-center space-x-2">
                            <input
                                type="radio"
                                name="maisDeUmPai"
                                value="nao"
                                checked={data.maisDeUmPai === 'nao'}
                                onChange={(e) => onUpdate('maisDeUmPai', e.target.value)}
                                className="text-primary"
                            />
                            <span>Não</span>
                        </label>
                    </div>
                    {errors.maisDeUmPai && (
                        <p className="text-sm text-destructive">{errors.maisDeUmPai}</p>
                    )}
                </div>

                {/* Dados do Pai 2 - Exibir apenas se "Sim" */}
                {data.maisDeUmPai === 'sim' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50 mb-8">
                        <div className="col-span-full">
                            <h4 className="font-medium text-sm text-muted-foreground mb-2">
                                Dados do Pai 2
                            </h4>
                        </div>

                        {/* Nome Pai 2 */}
                        <div className="space-y-2">
                            <Label htmlFor="nomePai2">Nome Pai 2</Label>
                            <Input
                                id="nomePai2"
                                value={data.nomePai2 || ''}
                                onChange={(e) => onUpdate('nomePai2', e.target.value)}
                                placeholder="Nome completo do pai 2"
                                className={errors.nomePai2 ? 'border-destructive' : ''}
                            />
                            {errors.nomePai2 && (
                                <p className="text-sm text-destructive">{errors.nomePai2}</p>
                            )}
                        </div>

                        {/* CPF Pai 2 */}
                        <div className="space-y-2">
                            <Label htmlFor="cpfPai2">CPF Pai 2</Label>
                            <Input
                                id="cpfPai2"
                                value={data.cpfPai2 || ''}
                                onChange={(e) => onUpdate('cpfPai2', e.target.value)}
                                placeholder="000.000.000-00"
                                className={errors.cpfPai2 ? 'border-destructive' : ''}
                            />
                            {errors.cpfPai2 && (
                                <p className="text-sm text-destructive">{errors.cpfPai2}</p>
                            )}
                        </div>

                        {/* Telefone Pai 2 */}
                        <div className="space-y-2">
                            <Label htmlFor="telefonePai2">Telefone Pai 2</Label>
                            <Input
                                id="telefonePai2"
                                value={data.telefonePai2 || ''}
                                onChange={(e) => onUpdate('telefonePai2', e.target.value)}
                                placeholder="(11) 99999-9999"
                                className={errors.telefonePai2 ? 'border-destructive' : ''}
                            />
                            {errors.telefonePai2 && (
                                <p className="text-sm text-destructive">{errors.telefonePai2}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
