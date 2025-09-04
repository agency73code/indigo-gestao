import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import type { Terapeuta } from '../types/cadastros.types';

interface EnderecoStepProps {
    data: Partial<Terapeuta>;
    onUpdate: (field: string, value: string) => void;
    errors: Record<string, string>;
}

export default function EnderecoStep({ data, onUpdate, errors }: EnderecoStepProps) {
    const handleEnderecoChange = (field: string, value: string) => {
        onUpdate(`endereco.${field}`, value);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold">Endereço Pessoal</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                        id="cep"
                        value={data.endereco?.cep || ''}
                        onChange={(e) => handleEnderecoChange('cep', e.target.value)}
                        placeholder="00000-000"
                        className={errors['endereco.cep'] ? 'border-destructive' : ''}
                    />
                    {errors['endereco.cep'] && (
                        <p className="text-sm text-destructive">{errors['endereco.cep']}</p>
                    )}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="rua">Rua *</Label>
                    <Input
                        id="rua"
                        value={data.endereco?.rua || ''}
                        onChange={(e) => handleEnderecoChange('rua', e.target.value)}
                        placeholder="Nome da rua"
                        className={errors['endereco.rua'] ? 'border-destructive' : ''}
                    />
                    {errors['endereco.rua'] && (
                        <p className="text-sm text-destructive">{errors['endereco.rua']}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="numero">Número *</Label>
                    <Input
                        id="numero"
                        value={data.endereco?.numero || ''}
                        onChange={(e) => handleEnderecoChange('numero', e.target.value)}
                        placeholder="123"
                        className={errors['endereco.numero'] ? 'border-destructive' : ''}
                    />
                    {errors['endereco.numero'] && (
                        <p className="text-sm text-destructive">{errors['endereco.numero']}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                        id="complemento"
                        value={data.endereco?.complemento || ''}
                        onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
                        placeholder="Apto, Sala..."
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                        id="bairro"
                        value={data.endereco?.bairro || ''}
                        onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
                        placeholder="Nome do bairro"
                        className={errors['endereco.bairro'] ? 'border-destructive' : ''}
                    />
                    {errors['endereco.bairro'] && (
                        <p className="text-sm text-destructive">{errors['endereco.bairro']}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                        id="cidade"
                        value={data.endereco?.cidade || ''}
                        onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
                        placeholder="Nome da cidade"
                        className={errors['endereco.cidade'] ? 'border-destructive' : ''}
                    />
                    {errors['endereco.cidade'] && (
                        <p className="text-sm text-destructive">{errors['endereco.cidade']}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="estado">Estado *</Label>
                    <select
                        id="estado"
                        value={data.endereco?.estado || ''}
                        onChange={(e) => handleEnderecoChange('estado', e.target.value)}
                        className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                            errors['endereco.estado'] ? 'border-destructive' : ''
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
                    {errors['endereco.estado'] && (
                        <p className="text-sm text-destructive">{errors['endereco.estado']}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
