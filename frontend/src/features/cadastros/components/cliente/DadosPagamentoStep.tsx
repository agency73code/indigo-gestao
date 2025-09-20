import { Input } from '@/ui/input';
import { Label } from '@/ui/label';
import type { Cliente } from '../../types/cadastros.types';
import * as mask from '@/common/utils/mask';
import { toTitleCaseSimple } from '@/common/utils/mask';

interface DadosPagamentoStepProps {
    data: Partial<Cliente>;
    onUpdate: (field: string, value: unknown) => void;
    errors: Record<string, string>;
    onBlur: (field: string) => void;
}

export default function DadosPagamentoStep({
    data,
    onUpdate,
    errors,
    onBlur,
}: DadosPagamentoStepProps) {
    const updateDadosPagamento = (field: string, value: unknown) => {
        onUpdate(`dadosPagamento.${field}`, value);
    };

    const dadosPagamento = (data.dadosPagamento || {}) as any;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold">Dados Pagamento</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Informe os dados de pagamento do cliente.
                </p>
            </div>

            {/* Dados básicos do plano */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nomeTitular">Nome do titular *</Label>
                    <Input
                        id="nomeTitular"
                        name="nomeTitular"
                        autoComplete="name"
                        value={dadosPagamento.nomeTitular || ''}
                        onChange={(e) =>
                            updateDadosPagamento('nomeTitular', toTitleCaseSimple(e.target.value))
                        }
                        className={errors['dadosPagamento.nomeTitular'] ? 'border-destructive' : ''}
                        placeholder="Nome completo do titular"
                    />
                    {errors['dadosPagamento.nomeTitular'] && (
                        <p className="text-sm text-destructive">
                            {errors['dadosPagamento.nomeTitular']}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="numeroCarteirinha">Número da carteirinha</Label>
                    <Input
                        id="numeroCarteirinha"
                        name="numeroCarteirinha"
                        value={dadosPagamento.numeroCarteirinha || ''}
                        onChange={(e) => updateDadosPagamento('numeroCarteirinha', e.target.value)}
                        className={
                            errors['dadosPagamento.numeroCarteirinha'] ? 'border-destructive' : ''
                        }
                        placeholder="000000000000"
                    />
                    {errors['dadosPagamento.numeroCarteirinha'] && (
                        <p className="text-sm text-destructive">
                            {errors['dadosPagamento.numeroCarteirinha']}
                        </p>
                    )}
                </div>
            </div>

            {/* Seções de Telefones e E-mails */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Seção de Telefones */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium">Telefones</h4>

                    <div className="space-y-2">
                        <Label htmlFor="telefone1">Telefone *</Label>
                        <Input
                            id="telefone1"
                            value={dadosPagamento.telefone1 || ''}
                            onChange={(e) =>
                                updateDadosPagamento('telefone1', mask.maskBRPhone(e.target.value))
                            }
                            onBlur={() => onBlur('dadosPagamento.telefone1')}
                            className={
                                errors['dadosPagamento.telefone1'] ? 'border-destructive' : ''
                            }
                            placeholder="(11) 99999-9999"
                        />
                        {errors['dadosPagamento.telefone1'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosPagamento.telefone1']}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="mostrarTelefone2"
                            checked={dadosPagamento.mostrarTelefone2 || false}
                            onChange={(e) =>
                                updateDadosPagamento('mostrarTelefone2', e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="mostrarTelefone2">Adicionar mais um telefone?</Label>
                    </div>

                    {dadosPagamento.mostrarTelefone2 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="telefone2">Telefone 2</Label>
                                <Input
                                    id="telefone2"
                                    value={dadosPagamento.telefone2 || ''}
                                    onChange={(e) =>
                                        updateDadosPagamento('telefone2', e.target.value)
                                    }
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="mostrarTelefone3"
                                    checked={dadosPagamento.mostrarTelefone3 || false}
                                    onChange={(e) =>
                                        updateDadosPagamento('mostrarTelefone3', e.target.checked)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="mostrarTelefone3">
                                    Adicionar mais um telefone?
                                </Label>
                            </div>

                            {dadosPagamento.mostrarTelefone3 && (
                                <div className="space-y-2">
                                    <Label htmlFor="telefone3">Telefone 3</Label>
                                    <Input
                                        id="telefone3"
                                        value={dadosPagamento.telefone3 || ''}
                                        onChange={(e) =>
                                            updateDadosPagamento('telefone3', e.target.value)
                                        }
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Seção de E-mails */}
                <div className="space-y-4">
                    <h4 className="text-md font-medium">E-mails</h4>

                    <div className="space-y-2">
                        <Label htmlFor="email1">E-mail *</Label>
                        <Input
                            id="email1"
                            type="email"
                            value={dadosPagamento.email1 || ''}
                            onChange={(e) =>
                                updateDadosPagamento('email1', mask.normalizeEmail(e.target.value))
                            }
                            onBlur={() => onBlur('dadosPagamento.email1')}
                            className={errors['dadosPagamento.email1'] ? 'border-destructive' : ''}
                            placeholder="exemplo@email.com"
                        />
                        {errors['dadosPagamento.email1'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosPagamento.email1']}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="mostrarEmail2"
                            checked={dadosPagamento.mostrarEmail2 || false}
                            onChange={(e) =>
                                updateDadosPagamento('mostrarEmail2', e.target.checked)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="mostrarEmail2">Adicionar mais um e-mail?</Label>
                    </div>

                    {dadosPagamento.mostrarEmail2 && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="email2">E-mail 2</Label>
                                <Input
                                    id="email2"
                                    type="email"
                                    value={dadosPagamento.email2 || ''}
                                    onChange={(e) => updateDadosPagamento('email2', e.target.value)}
                                    placeholder="exemplo@email.com"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="mostrarEmail3"
                                    checked={dadosPagamento.mostrarEmail3 || false}
                                    onChange={(e) =>
                                        updateDadosPagamento('mostrarEmail3', e.target.checked)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="mostrarEmail3">Adicionar mais um e-mail?</Label>
                            </div>

                            {dadosPagamento.mostrarEmail3 && (
                                <div className="space-y-2">
                                    <Label htmlFor="email3">E-mail 3</Label>
                                    <Input
                                        id="email3"
                                        type="email"
                                        value={dadosPagamento.email3 || ''}
                                        onChange={(e) =>
                                            updateDadosPagamento('email3', e.target.value)
                                        }
                                        placeholder="exemplo@email.com"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Sistema de Pagamento */}
            <div className="space-y-4">
                <h4 className="text-md font-medium">Sistema de Pagamento *</h4>

                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="reembolso"
                            name="sistemaPagamento"
                            value="reembolso"
                            checked={dadosPagamento.sistemaPagamento === 'reembolso'}
                            onChange={(e) =>
                                updateDadosPagamento('sistemaPagamento', e.target.value)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <Label htmlFor="reembolso">Reembolso</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="liminar"
                            name="sistemaPagamento"
                            value="liminar"
                            checked={dadosPagamento.sistemaPagamento === 'liminar'}
                            onChange={(e) =>
                                updateDadosPagamento('sistemaPagamento', e.target.value)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <Label htmlFor="liminar">Liminar</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="radio"
                            id="particular"
                            name="sistemaPagamento"
                            value="particular"
                            checked={dadosPagamento.sistemaPagamento === 'particular'}
                            onChange={(e) =>
                                updateDadosPagamento('sistemaPagamento', e.target.value)
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <Label htmlFor="particular">Particular</Label>
                    </div>
                </div>

                {errors['dadosPagamento.sistemaPagamento'] && (
                    <p className="text-sm text-destructive">
                        {errors['dadosPagamento.sistemaPagamento']}
                    </p>
                )}
            </div>

            {/* Campos específicos para Reembolso */}
            {dadosPagamento.sistemaPagamento === 'reembolso' && (
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <h5 className="text-sm font-medium text-slate-700">Dados do Reembolso</h5>
                    <div className="space-y-2">
                        <Label htmlFor="prazoReembolso">Prazo reembolso (dias)</Label>
                        <Input
                            id="prazoReembolso"
                            type="number"
                            value={dadosPagamento.prazoReembolso || ''}
                            onChange={(e) => updateDadosPagamento('prazoReembolso', e.target.value)}
                            placeholder="30"
                        />
                    </div>
                </div>
            )}

            {/* Campos específicos para Liminar */}
            {dadosPagamento.sistemaPagamento === 'liminar' && (
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <h5 className="text-sm font-medium text-slate-700">Dados da Liminar</h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="numeroProcesso">Número do processo</Label>
                            <Input
                                id="numeroProcesso"
                                value={dadosPagamento.numeroProcesso || ''}
                                onChange={(e) =>
                                    updateDadosPagamento('numeroProcesso', e.target.value)
                                }
                                placeholder="0000000-00.0000.0.00.0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nomeAdvogado">Nome advogado</Label>
                            <Input
                                id="nomeAdvogado"
                                value={dadosPagamento.nomeAdvogado || ''}
                                onChange={(e) =>
                                    updateDadosPagamento('nomeAdvogado', e.target.value)
                                }
                                placeholder="Nome do advogado"
                            />
                        </div>
                    </div>

                    {/* Telefones do Advogado */}
                    <div className="space-y-3">
                        <h6 className="text-sm font-medium">Telefones do Advogado</h6>

                        <div className="space-y-2">
                            <Label htmlFor="telefoneAdvogado1">Telefone advogado *</Label>
                            <Input
                                id="telefoneAdvogado1"
                                value={dadosPagamento.telefoneAdvogado1 || ''}
                                onChange={(e) =>
                                    updateDadosPagamento('telefoneAdvogado1', e.target.value)
                                }
                                className={
                                    errors['dadosPagamento.telefoneAdvogado1']
                                        ? 'border-destructive'
                                        : ''
                                }
                                placeholder="(11) 99999-9999"
                            />
                            {errors['dadosPagamento.telefoneAdvogado1'] && (
                                <p className="text-sm text-destructive">
                                    {errors['dadosPagamento.telefoneAdvogado1']}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="mostrarTelefoneAdvogado2"
                                checked={dadosPagamento.mostrarTelefoneAdvogado2 || false}
                                onChange={(e) =>
                                    updateDadosPagamento(
                                        'mostrarTelefoneAdvogado2',
                                        e.target.checked,
                                    )
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Label htmlFor="mostrarTelefoneAdvogado2">
                                Adicionar mais um telefone?
                            </Label>
                        </div>

                        {dadosPagamento.mostrarTelefoneAdvogado2 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="telefoneAdvogado2">Telefone advogado 2</Label>
                                    <Input
                                        id="telefoneAdvogado2"
                                        value={dadosPagamento.telefoneAdvogado2 || ''}
                                        onChange={(e) =>
                                            updateDadosPagamento(
                                                'telefoneAdvogado2',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="(11) 99999-9999"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="mostrarTelefoneAdvogado3"
                                        checked={dadosPagamento.mostrarTelefoneAdvogado3 || false}
                                        onChange={(e) =>
                                            updateDadosPagamento(
                                                'mostrarTelefoneAdvogado3',
                                                e.target.checked,
                                            )
                                        }
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <Label htmlFor="mostrarTelefoneAdvogado3">
                                        Adicionar mais um telefone?
                                    </Label>
                                </div>

                                {dadosPagamento.mostrarTelefoneAdvogado3 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="telefoneAdvogado3">
                                            Telefone advogado 3
                                        </Label>
                                        <Input
                                            id="telefoneAdvogado3"
                                            value={dadosPagamento.telefoneAdvogado3 || ''}
                                            onChange={(e) =>
                                                updateDadosPagamento(
                                                    'telefoneAdvogado3',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="(11) 99999-9999"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* E-mails do Advogado */}
                    <div className="space-y-3">
                        <h6 className="text-sm font-medium">E-mails do Advogado</h6>

                        <div className="space-y-2">
                            <Label htmlFor="emailAdvogado1">E-mail advogado *</Label>
                            <Input
                                id="emailAdvogado1"
                                type="email"
                                value={dadosPagamento.emailAdvogado1 || ''}
                                onChange={(e) =>
                                    updateDadosPagamento('emailAdvogado1', e.target.value)
                                }
                                className={
                                    errors['dadosPagamento.emailAdvogado1']
                                        ? 'border-destructive'
                                        : ''
                                }
                                placeholder="advogado@email.com"
                            />
                            {errors['dadosPagamento.emailAdvogado1'] && (
                                <p className="text-sm text-destructive">
                                    {errors['dadosPagamento.emailAdvogado1']}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="mostrarEmailAdvogado2"
                                checked={dadosPagamento.mostrarEmailAdvogado2 || false}
                                onChange={(e) =>
                                    updateDadosPagamento('mostrarEmailAdvogado2', e.target.checked)
                                }
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Label htmlFor="mostrarEmailAdvogado2">Adicionar mais um e-mail?</Label>
                        </div>

                        {dadosPagamento.mostrarEmailAdvogado2 && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="emailAdvogado2">E-mail advogado 2</Label>
                                    <Input
                                        id="emailAdvogado2"
                                        type="email"
                                        value={dadosPagamento.emailAdvogado2 || ''}
                                        onChange={(e) =>
                                            updateDadosPagamento('emailAdvogado2', e.target.value)
                                        }
                                        placeholder="advogado@email.com"
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="mostrarEmailAdvogado3"
                                        checked={dadosPagamento.mostrarEmailAdvogado3 || false}
                                        onChange={(e) =>
                                            updateDadosPagamento(
                                                'mostrarEmailAdvogado3',
                                                e.target.checked,
                                            )
                                        }
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <Label htmlFor="mostrarEmailAdvogado3">
                                        Adicionar mais um e-mail?
                                    </Label>
                                </div>

                                {dadosPagamento.mostrarEmailAdvogado3 && (
                                    <div className="space-y-2">
                                        <Label htmlFor="emailAdvogado3">E-mail advogado 3</Label>
                                        <Input
                                            id="emailAdvogado3"
                                            type="email"
                                            value={dadosPagamento.emailAdvogado3 || ''}
                                            onChange={(e) =>
                                                updateDadosPagamento(
                                                    'emailAdvogado3',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="advogado@email.com"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Campos específicos para Particular */}
            {dadosPagamento.sistemaPagamento === 'particular' && (
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                    <h5 className="text-sm font-medium text-slate-700">Dados do Particular</h5>

                    <div className="space-y-3">
                        <Label>Houve negociação?</Label>
                        <div className="flex space-x-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="negociacao-sim"
                                    name="houveNegociacao"
                                    value="sim"
                                    checked={dadosPagamento.houveNegociacao === 'sim'}
                                    onChange={(e) =>
                                        updateDadosPagamento('houveNegociacao', e.target.value)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <Label htmlFor="negociacao-sim">Sim</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id="negociacao-nao"
                                    name="houveNegociacao"
                                    value="nao"
                                    checked={dadosPagamento.houveNegociacao === 'nao'}
                                    onChange={(e) =>
                                        updateDadosPagamento('houveNegociacao', e.target.value)
                                    }
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                                />
                                <Label htmlFor="negociacao-nao">Não</Label>
                            </div>
                        </div>
                    </div>

                    {/* Valor acordado */}
                    <div className="space-y-2">
                        <Label htmlFor="valorAcordado">
                            Valor acordado {dadosPagamento.houveNegociacao === 'sim' ? '*' : ''}
                        </Label>
                        <Input
                            id="valorAcordado"
                            value={dadosPagamento.valorAcordado || ''}
                            onChange={(e) =>
                                updateDadosPagamento('valorAcordado', mask.maskBRL(e.target.value))
                            }
                            className={
                                errors['dadosPagamento.valorAcordado'] ? 'border-destructive' : ''
                            }
                            placeholder="R$ 0,00"
                        />
                        {errors['dadosPagamento.valorAcordado'] && (
                            <p className="text-sm text-destructive">
                                {errors['dadosPagamento.valorAcordado']}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
