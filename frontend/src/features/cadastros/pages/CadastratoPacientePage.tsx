import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { motion } from 'framer-motion';
import type { Paciente } from '../types/cadastros.types';

export default function CadastratoPacientePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Paciente>>({
        nome: '',
        email: '',
        telefone: '',
        dataNascimento: '',
        cpf: '',
        endereco: {
            cep: '',
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
        },
        responsavel: {
            nome: '',
            telefone: '',
            email: '',
            parentesco: '',
        },
        observacoes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Aqui você fará a chamada para a API
            console.log('Dados do paciente:', formData);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulação

            // Reset form após sucesso
            setFormData({
                nome: '',
                email: '',
                telefone: '',
                dataNascimento: '',
                cpf: '',
                endereco: {
                    cep: '',
                    rua: '',
                    numero: '',
                    complemento: '',
                    bairro: '',
                    cidade: '',
                    estado: '',
                },
                responsavel: {
                    nome: '',
                    telefone: '',
                    email: '',
                    parentesco: '',
                },
                observacoes: '',
            });
        } catch (error) {
            console.error('Erro ao cadastrar paciente:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        if (field.includes('endereco.')) {
            const enderecoField = field.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                endereco: {
                    ...prev.endereco!,
                    [enderecoField]: value,
                },
            }));
        } else if (field.includes('responsavel.')) {
            const responsavelField = field.split('.')[1];
            setFormData((prev) => ({
                ...prev,
                responsavel: {
                    ...prev.responsavel!,
                    [responsavelField]: value,
                },
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [field]: value,
            }));
        }
    };

    return (
        <div className="container mx-auto py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl text-primary">Cadastro dhgjfjhgfjhgfe Paciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Dados Pessoais */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Dados Pessoais</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nome">Nome Completo</Label>
                                        <Input
                                            id="nome"
                                            value={formData.nome}
                                            onChange={(e) =>
                                                handleInputChange('nome', e.target.value)
                                            }
                                            placeholder="Digite o nome completo"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">E-mail</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) =>
                                                handleInputChange('email', e.target.value)
                                            }
                                            placeholder="Digite o e-mail"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="telefone">Telefone</Label>
                                        <Input
                                            id="telefone"
                                            value={formData.telefone}
                                            onChange={(e) =>
                                                handleInputChange('telefone', e.target.value)
                                            }
                                            placeholder="(11) 99999-9999"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                                        <Input
                                            id="dataNascimento"
                                            type="date"
                                            value={formData.dataNascimento}
                                            onChange={(e) =>
                                                handleInputChange('dataNascimento', e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cpf">CPF</Label>
                                        <Input
                                            id="cpf"
                                            value={formData.cpf}
                                            onChange={(e) =>
                                                handleInputChange('cpf', e.target.value)
                                            }
                                            placeholder="000.000.000-00"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Endereço */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Endereço</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cep">CEP</Label>
                                        <Input
                                            id="cep"
                                            value={formData.endereco?.cep}
                                            onChange={(e) =>
                                                handleInputChange('endereco.cep', e.target.value)
                                            }
                                            placeholder="00000-000"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="rua">Rua</Label>
                                        <Input
                                            id="rua"
                                            value={formData.endereco?.rua}
                                            onChange={(e) =>
                                                handleInputChange('endereco.rua', e.target.value)
                                            }
                                            placeholder="Nome da rua"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numero">Número</Label>
                                        <Input
                                            id="numero"
                                            value={formData.endereco?.numero}
                                            onChange={(e) =>
                                                handleInputChange('endereco.numero', e.target.value)
                                            }
                                            placeholder="123"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="complemento">Complemento</Label>
                                        <Input
                                            id="complemento"
                                            value={formData.endereco?.complemento}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'endereco.complemento',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Apto, Sala..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bairro">Bairro</Label>
                                        <Input
                                            id="bairro"
                                            value={formData.endereco?.bairro}
                                            onChange={(e) =>
                                                handleInputChange('endereco.bairro', e.target.value)
                                            }
                                            placeholder="Nome do bairro"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="cidade">Cidade</Label>
                                        <Input
                                            id="cidade"
                                            value={formData.endereco?.cidade}
                                            onChange={(e) =>
                                                handleInputChange('endereco.cidade', e.target.value)
                                            }
                                            placeholder="Nome da cidade"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="estado">Estado</Label>
                                        <Input
                                            id="estado"
                                            value={formData.endereco?.estado}
                                            onChange={(e) =>
                                                handleInputChange('endereco.estado', e.target.value)
                                            }
                                            placeholder="SP"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Responsável (para menores de idade) */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Responsável (opcional)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="responsavelNome">Nome do Responsável</Label>
                                        <Input
                                            id="responsavelNome"
                                            value={formData.responsavel?.nome}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'responsavel.nome',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Nome do responsável"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="responsavelTelefone">
                                            Telefone do Responsável
                                        </Label>
                                        <Input
                                            id="responsavelTelefone"
                                            value={formData.responsavel?.telefone}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'responsavel.telefone',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="responsavelEmail">
                                            E-mail do Responsável
                                        </Label>
                                        <Input
                                            id="responsavelEmail"
                                            type="email"
                                            value={formData.responsavel?.email}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'responsavel.email',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="email@exemplo.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="parentesco">Parentesco</Label>
                                        <Input
                                            id="parentesco"
                                            value={formData.responsavel?.parentesco}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'responsavel.parentesco',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ex: Pai, Mãe, Tutor"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Observações */}
                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações</Label>
                                <textarea
                                    id="observacoes"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.observacoes}
                                    onChange={(e) =>
                                        handleInputChange('observacoes', e.target.value)
                                    }
                                    placeholder="Observações adicionais sobre o paciente..."
                                />
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Cadastrando...
                                        </div>
                                    ) : (
                                        'Cadastrar Paciente'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
