import { InputField } from '@/ui/input-field';
import { Label } from '@/ui/label';
import type { Cliente } from '../../types/cadastros.types';
import * as mask from '@/common/utils/mask';
import { toTitleCaseSimple } from '@/common/utils/mask';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputFieldWithAddButtonProps {
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAddClick: () => void;
    placeholder?: string;
    error?: string;
    type?: string;
    onBlur?: () => void;
}

interface InputFieldWithRemoveButtonProps {
    label: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveClick: () => void;
    onAddClick?: () => void;
    showAddButton?: boolean;
    placeholder?: string;
    error?: string;
    type?: string;
    onBlur?: () => void;
}

const InputFieldWithAddButton = ({
    label,
    id,
    value,
    onChange,
    onAddClick,
    placeholder,
    error,
    type,
    onBlur,
}: InputFieldWithAddButtonProps) => {
    const labelParts = label.split('*');
    const hasAsterisk = labelParts.length > 1;

    return (
        <div className="relative w-full">
            <div className="flex items-stretch gap-2">
                {/* Campo de input - flex */}
                <div className="flex-1">
                    <div
                        className={cn(
                            'flex flex-col h-full w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-colors',
                            'focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
                            error && 'border-destructive'
                        )}
                    >
                        <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                            {labelParts[0]}
                            {hasAsterisk && <span className="text-destructive">*</span>}
                            {labelParts[1]}
                        </label>
                        <input
                            id={id}
                            type={type}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            className="text-sm font-normal text-foreground bg-card border-0 outline-none p-0 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground/60 autofill:bg-card autofill:text-foreground"
                            style={{
                                WebkitTextFillColor: 'inherit',
                            }}
                        />
                    </div>
                </div>

                {/* Botão de adicionar - 60px fixo */}
                <div className="w-[60px] flex-shrink-0">
                    <button
                        type="button"
                        onClick={onAddClick}
                        className="w-full h-full flex items-center justify-center rounded-lg border border-input bg-card shadow-sm hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Adicionar outro campo"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
};

const InputFieldWithRemoveButton = ({
    label,
    id,
    value,
    onChange,
    onAddClick,
    showAddButton = false,
    placeholder,
    error,
    type,
    onBlur,
}: InputFieldWithRemoveButtonProps) => {
    const labelParts = label.split('*');
    const hasAsterisk = labelParts.length > 1;

    return (
        <div className="relative w-full">
            <div className="flex items-stretch gap-2">
                {/* Campo de input - igual ao original */}
                <div className="flex-1">
                    <div
                        className={cn(
                            'flex flex-col h-full w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-colors',
                            'focus-within:outline-none focus-within:ring-1 focus-within:ring-ring',
                            error && 'border-destructive'
                        )}
                    >
                        <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                            {labelParts[0]}
                            {hasAsterisk && <span className="text-destructive">*</span>}
                            {labelParts[1]}
                        </label>
                        <input
                            id={id}
                            type={type}
                            value={value}
                            onChange={onChange}
                            onBlur={onBlur}
                            placeholder={placeholder}
                            className="text-sm font-normal text-foreground bg-card border-0 outline-none p-0 disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-muted-foreground/60 autofill:bg-card autofill:text-foreground"
                            style={{
                                WebkitTextFillColor: 'inherit',
                            }}
                        />
                    </div>
                </div>

                {/* Botão de adicionar - 60px fixo (opcional) */}
                {showAddButton && onAddClick && (
                    <div className="w-[60px] flex-shrink-0">
                        <button
                            type="button"
                            onClick={onAddClick}
                            className="w-full h-full flex items-center justify-center rounded-lg border border-input bg-card shadow-sm hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Adicionar outro campo"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
    );
};

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
            

            {/* Dados básicos do plano */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Nome do titular *"
                    id="nomeTitular"
                    name="nomeTitular"
                    autoComplete="name"
                    value={dadosPagamento.nomeTitular || ''}
                    onChange={(e) =>
                        updateDadosPagamento('nomeTitular', toTitleCaseSimple(e.target.value))
                    }
                    placeholder="Nome completo do titular"
                    error={errors['dadosPagamento.nomeTitular']}
                />

                <InputField
                    label="Número da carteirinha"
                    id="numeroCarteirinha"
                    name="numeroCarteirinha"
                    value={dadosPagamento.numeroCarteirinha || ''}
                    onChange={(e) => updateDadosPagamento('numeroCarteirinha', e.target.value)}
                    placeholder="000000000000"
                    error={errors['dadosPagamento.numeroCarteirinha']}
                />
            </div>

            {/* Seções de Telefones e E-mails */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Telefone - 4/12 */}
                <div className="space-y-3 md:col-span-4">
                    <InputFieldWithAddButton
                        label="Telefone *"
                        id="telefone1"
                        value={dadosPagamento.telefone1 || ''}
                        onChange={(e) =>
                            updateDadosPagamento('telefone1', mask.maskBRPhone(e.target.value))
                        }
                        onBlur={() => onBlur('dadosPagamento.telefone1')}
                        onAddClick={() => updateDadosPagamento('mostrarTelefone2', true)}
                        placeholder="(11) 99999-9999"
                        error={errors['dadosPagamento.telefone1']}
                    />

                    {dadosPagamento.mostrarTelefone2 && (
                        <>
                            <InputFieldWithRemoveButton
                                label="Telefone 2"
                                id="telefone2"
                                value={dadosPagamento.telefone2 || ''}
                                onChange={(e) =>
                                    updateDadosPagamento('telefone2', mask.maskBRPhone(e.target.value))
                                }
                                onRemoveClick={() => {
                                    updateDadosPagamento('mostrarTelefone2', false);
                                    updateDadosPagamento('telefone2', '');
                                    updateDadosPagamento('mostrarTelefone3', false);
                                    updateDadosPagamento('telefone3', '');
                                }}
                                onAddClick={() => updateDadosPagamento('mostrarTelefone3', true)}
                                showAddButton={!dadosPagamento.mostrarTelefone3}
                                placeholder="(11) 99999-9999"
                            />

                            {dadosPagamento.mostrarTelefone3 && (
                                <InputFieldWithRemoveButton
                                    label="Telefone 3"
                                    id="telefone3"
                                    value={dadosPagamento.telefone3 || ''}
                                    onChange={(e) =>
                                        updateDadosPagamento('telefone3', mask.maskBRPhone(e.target.value))
                                    }
                                    onRemoveClick={() => {
                                        updateDadosPagamento('mostrarTelefone3', false);
                                        updateDadosPagamento('telefone3', '');
                                    }}
                                    placeholder="(11) 99999-9999"
                                />
                            )}
                        </>
                    )}
                </div>

                {/* E-mail - 8/12 */}
                <div className="space-y-3 md:col-span-8">
                    <InputFieldWithAddButton
                        label="E-mail *"
                        id="email1"
                        type="email"
                        value={dadosPagamento.email1 || ''}
                        onChange={(e) =>
                            updateDadosPagamento('email1', mask.normalizeEmail(e.target.value))
                        }
                        onBlur={() => onBlur('dadosPagamento.email1')}
                        onAddClick={() => updateDadosPagamento('mostrarEmail2', true)}
                        placeholder="exemplo@email.com"
                        error={errors['dadosPagamento.email1']}
                    />

                    {dadosPagamento.mostrarEmail2 && (
                        <>
                            <InputFieldWithRemoveButton
                                label="E-mail 2"
                                id="email2"
                                type="email"
                                value={dadosPagamento.email2 || ''}
                                onChange={(e) => updateDadosPagamento('email2', mask.normalizeEmail(e.target.value))}
                                onRemoveClick={() => {
                                    updateDadosPagamento('mostrarEmail2', false);
                                    updateDadosPagamento('email2', '');
                                    updateDadosPagamento('mostrarEmail3', false);
                                    updateDadosPagamento('email3', '');
                                }}
                                onAddClick={() => updateDadosPagamento('mostrarEmail3', true)}
                                showAddButton={!dadosPagamento.mostrarEmail3}
                                placeholder="exemplo@email.com"
                            />

                            {dadosPagamento.mostrarEmail3 && (
                                <InputFieldWithRemoveButton
                                    label="E-mail 3"
                                    id="email3"
                                    type="email"
                                    value={dadosPagamento.email3 || ''}
                                    onChange={(e) =>
                                        updateDadosPagamento('email3', mask.normalizeEmail(e.target.value))
                                    }
                                    onRemoveClick={() => {
                                        updateDadosPagamento('mostrarEmail3', false);
                                        updateDadosPagamento('email3', '');
                                    }}
                                    placeholder="exemplo@email.com"
                                />
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Sistema de Pagamento */}
            <div className="space-y-4">
                <h4 
                    style={{ 
                        fontFamily: "var(--hub-card-title-font-family)",
                        fontWeight: "var(--hub-card-title-font-weight)",
                        color: "var(--hub-card-title-color)"
                    }}
                    className="text-sm leading-none tracking-tight"
                >
                    Sistema de Pagamento *
                </h4>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-border">
                    <button
                        type="button"
                        onClick={() => updateDadosPagamento('sistemaPagamento', 'reembolso')}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            dadosPagamento.sistemaPagamento === 'reembolso'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Reembolso
                        {dadosPagamento.sistemaPagamento === 'reembolso' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => updateDadosPagamento('sistemaPagamento', 'liminar')}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            dadosPagamento.sistemaPagamento === 'liminar'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Liminar
                        {dadosPagamento.sistemaPagamento === 'liminar' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => updateDadosPagamento('sistemaPagamento', 'particular')}
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            dadosPagamento.sistemaPagamento === 'particular'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        Particular
                        {dadosPagamento.sistemaPagamento === 'particular' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                        )}
                    </button>
                </div>

                {errors['dadosPagamento.sistemaPagamento'] && (
                    <p className="text-sm text-destructive">
                        {errors['dadosPagamento.sistemaPagamento']}
                    </p>
                )}
            </div>

            {/* Campos específicos para Reembolso */}
            {dadosPagamento.sistemaPagamento === 'reembolso' && (
                <div className="space-y-4">
                    <InputField
                        label="Prazo reembolso (dias)"
                        id="prazoReembolso"
                        type="number"
                        value={dadosPagamento.prazoReembolso || ''}
                        onChange={(e) => updateDadosPagamento('prazoReembolso', e.target.value)}
                        placeholder="30"
                    />
                </div>
            )}

            {/* Campos específicos para Liminar */}
            {dadosPagamento.sistemaPagamento === 'liminar' && (
                <div className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            label="Número do processo"
                            id="numeroProcesso"
                            value={dadosPagamento.numeroProcesso || ''}
                            onChange={(e) =>
                                updateDadosPagamento('numeroProcesso', e.target.value)
                            }
                            placeholder="0000000-00.0000.0.00.0000"
                        />

                        <InputField
                            label="Nome advogado"
                            id="nomeAdvogado"
                            value={dadosPagamento.nomeAdvogado || ''}
                            onChange={(e) =>
                                updateDadosPagamento('nomeAdvogado', e.target.value)
                            }
                            placeholder="Nome do advogado"
                        />
                    </div>

                    {/* Telefones e E-mails do Advogado */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Telefones do Advogado - 4/12 */}
                        <div className="space-y-3 md:col-span-4">
                            <InputFieldWithAddButton
                                label="Telefone advogado *"
                                id="telefoneAdvogado1"
                                value={dadosPagamento.telefoneAdvogado1 || ''}
                                onChange={(e) =>
                                    updateDadosPagamento('telefoneAdvogado1', mask.maskBRPhone(e.target.value))
                                }
                                onAddClick={() => updateDadosPagamento('mostrarTelefoneAdvogado2', true)}
                                placeholder="(11) 99999-9999"
                                error={errors['dadosPagamento.telefoneAdvogado1']}
                            />

                            {dadosPagamento.mostrarTelefoneAdvogado2 && (
                                <>
                                    <InputFieldWithRemoveButton
                                        label="Telefone advogado 2"
                                        id="telefoneAdvogado2"
                                        value={dadosPagamento.telefoneAdvogado2 || ''}
                                        onChange={(e) =>
                                            updateDadosPagamento(
                                                'telefoneAdvogado2',
                                                mask.maskBRPhone(e.target.value),
                                            )
                                        }
                                        onRemoveClick={() => {
                                            updateDadosPagamento('mostrarTelefoneAdvogado2', false);
                                            updateDadosPagamento('telefoneAdvogado2', '');
                                            updateDadosPagamento('mostrarTelefoneAdvogado3', false);
                                            updateDadosPagamento('telefoneAdvogado3', '');
                                        }}
                                        onAddClick={() => updateDadosPagamento('mostrarTelefoneAdvogado3', true)}
                                        showAddButton={!dadosPagamento.mostrarTelefoneAdvogado3}
                                        placeholder="(11) 99999-9999"
                                    />

                                    {dadosPagamento.mostrarTelefoneAdvogado3 && (
                                        <InputFieldWithRemoveButton
                                            label="Telefone advogado 3"
                                            id="telefoneAdvogado3"
                                            value={dadosPagamento.telefoneAdvogado3 || ''}
                                            onChange={(e) =>
                                                updateDadosPagamento(
                                                    'telefoneAdvogado3',
                                                    mask.maskBRPhone(e.target.value),
                                                )
                                            }
                                            onRemoveClick={() => {
                                                updateDadosPagamento('mostrarTelefoneAdvogado3', false);
                                                updateDadosPagamento('telefoneAdvogado3', '');
                                            }}
                                            placeholder="(11) 99999-9999"
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        {/* E-mails do Advogado - 8/12 */}
                        <div className="space-y-3 md:col-span-8">
                            <InputFieldWithAddButton
                                label="E-mail advogado *"
                                id="emailAdvogado1"
                                type="email"
                                value={dadosPagamento.emailAdvogado1 || ''}
                                onChange={(e) =>
                                    updateDadosPagamento('emailAdvogado1', mask.normalizeEmail(e.target.value))
                                }
                                onAddClick={() => updateDadosPagamento('mostrarEmailAdvogado2', true)}
                                placeholder="advogado@email.com"
                                error={errors['dadosPagamento.emailAdvogado1']}
                            />

                            {dadosPagamento.mostrarEmailAdvogado2 && (
                                <>
                                    <InputFieldWithRemoveButton
                                        label="E-mail advogado 2"
                                        id="emailAdvogado2"
                                        type="email"
                                        value={dadosPagamento.emailAdvogado2 || ''}
                                        onChange={(e) =>
                                            updateDadosPagamento('emailAdvogado2', mask.normalizeEmail(e.target.value))
                                        }
                                        onRemoveClick={() => {
                                            updateDadosPagamento('mostrarEmailAdvogado2', false);
                                            updateDadosPagamento('emailAdvogado2', '');
                                            updateDadosPagamento('mostrarEmailAdvogado3', false);
                                            updateDadosPagamento('emailAdvogado3', '');
                                        }}
                                        onAddClick={() => updateDadosPagamento('mostrarEmailAdvogado3', true)}
                                        showAddButton={!dadosPagamento.mostrarEmailAdvogado3}
                                        placeholder="advogado@email.com"
                                    />

                                    {dadosPagamento.mostrarEmailAdvogado3 && (
                                        <InputFieldWithRemoveButton
                                            label="E-mail advogado 3"
                                            id="emailAdvogado3"
                                            type="email"
                                            value={dadosPagamento.emailAdvogado3 || ''}
                                            onChange={(e) =>
                                                updateDadosPagamento(
                                                    'emailAdvogado3',
                                                    mask.normalizeEmail(e.target.value),
                                                )
                                            }
                                            onRemoveClick={() => {
                                                updateDadosPagamento('mostrarEmailAdvogado3', false);
                                                updateDadosPagamento('emailAdvogado3', '');
                                            }}
                                            placeholder="advogado@email.com"
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Campos específicos para Particular */}
            {dadosPagamento.sistemaPagamento === 'particular' && (
                <div className="space-y-4">

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
                    <InputField
                        label={`Valor acordado ${dadosPagamento.houveNegociacao === 'sim' ? '*' : ''}`}
                        id="valorAcordado"
                        value={dadosPagamento.valorAcordado || ''}
                        onChange={(e) =>
                            updateDadosPagamento('valorAcordado', mask.maskBRL(e.target.value))
                        }
                        placeholder="R$ 0,00"
                        error={errors['dadosPagamento.valorAcordado']}
                    />
                </div>
            )}
        </div>
    );
}
