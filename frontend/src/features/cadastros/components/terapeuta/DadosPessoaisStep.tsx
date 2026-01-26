import { useEffect, useMemo, useState } from 'react';
import { InputField } from '@/ui/input-field';
import { DateFieldWithLabel } from '@/ui/date-field-with-label';
import { SelectFieldRadix, SelectItem } from '@/ui/select-field-radix';
import { Combobox } from '@/ui/combobox';
import type { Terapeuta } from '../../types/cadastros.types';
import { FALLBACK_BRAZILIAN_BANKS, formatBankLabel, type Bank } from '@/common/constants/banks';
import { fetchBrazilianBanks } from '@/lib/api';
import { cn } from '@/lib/utils';

import {
    maskCPF,
    maskBRPhone,
    onlyDigits,
    maskPlate,
    maskPersonName,
    maskBRL,
    maskPixKey,
    validatePixKey,
} from '@/common/utils/mask';

interface DadosPessoaisStepProps {
    data: Partial<Terapeuta> & { pixTipo?: string };
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
    const [banks, setBanks] = useState<Bank[]>([]);
    const [banksLoading, setBanksLoading] = useState(true);
    const [banksMessage, setBanksMessage] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        setBanksLoading(true);

        fetchBrazilianBanks()
            .then((response) => {
                if (!isMounted) return;
                if (response.length === 0) {
                    setBanks(FALLBACK_BRAZILIAN_BANKS);
                    setBanksMessage('Lista atualizada indisponível. Exibindo opções padrão.');
                } else {
                    setBanks(response);
                    setBanksMessage(null);
                }
            })
            .catch((error) => {
                console.error('Erro ao carregar bancos da Brasil API:', error);
                if (!isMounted) return;
                setBanks(FALLBACK_BRAZILIAN_BANKS);
                setBanksMessage('Não foi possível atualizar a lista de bancos. Exibindo opções padrão.');
            })
            .finally(() => {
                if (isMounted) {
                    setBanksLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const bankOptions = useMemo(() => {
        const options = banks
            .filter((bank) => Boolean(bank.code))
            .map((bank) => ({
                value: bank.code,
                label: formatBankLabel(bank),
                searchValue: `${bank.name} ${bank.code}`.toLowerCase(), // Permite buscar por nome ou código
            }));

        if (data.banco && !options.some((option) => option.value === data.banco)) {
            options.push({
                value: data.banco,
                label: data.banco,
                searchValue: data.banco.toLowerCase(),
            });
        }

        return options.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
    }, [banks, data.banco]);

    const bankPlaceholder = useMemo(() => {
        if (banksLoading) return 'Carregando bancos...';
        if (!bankOptions.length) return 'Nenhum banco disponível';
        return 'Selecione um banco';
    }, [banksLoading, bankOptions.length]);

    const bankEmptyMessage = useMemo(() => {
        if (banksLoading) return 'Carregando bancos...';
        if (banksMessage) return banksMessage;
        return 'Nenhum banco encontrado.';
    }, [banksLoading, banksMessage]);

    // Placeholders dinâmicos para Chave Pix
    const getPixPlaceholder = (tipo: string | undefined): string => {
        switch (tipo) {
            case 'email':
                return 'terapeuta@dominio.com';
            case 'telefone':
                return '(11) 98888-7777';
            case 'cpf':
                return '123.456.789-09';
            case 'cnpj':
                return '12.345.678/0001-95';
            case 'aleatoria':
                return '123e4567-e89b-12d3-a456-426614174000';
            default:
                return 'Selecione o tipo primeiro';
        }
    };

    return (
        <div className="space-y-4 md:space-y-6">
            

            {/* Primeira linha: Nome (2/4) | CPF (1/4) | Data de Nascimento (1/4) */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                <div className="md:col-span-2">
                    <InputField
                        label="Nome Completo *"
                        id="nome"
                        value={data.nome || ''}
                        onChange={(e) => onUpdate('nome', maskPersonName(e.target.value))}
                        onBlur={(e) => onUpdate('nome', maskPersonName(e.target.value).trim())}
                        placeholder="Digite o nome completo"
                        error={errors.nome}
                    />
                </div>

                <div>
                    <InputField
                        label="CPF *"
                        id="cpf"
                        value={data.cpf || ''}
                        onChange={(e) => onUpdate('cpf', maskCPF(e.target.value))}
                        placeholder="000.000.000-00"
                        error={errors.cpf}
                    />
                </div>

                <div>
                    <DateFieldWithLabel
                        label="Data de nascimento *"
                        value={data.dataNascimento || ''}
                        onChange={(iso) => onUpdate('dataNascimento', iso)}
                        placeholder="dd/mm/aaaa"
                        error={errors.dataNascimento}
                    />
                </div>
            </div>

            {/* Segunda linha: Email | Celular */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
                <div className="md:col-span-3">
                    <InputField
                        label="E-mail *"
                        id="email"
                        type="email"
                        value={data.email || ''}
                        onChange={(e) => onUpdate('email', e.target.value)}
                        onBlur={() => onBlurField?.('email')}
                        placeholder="email@exemplo.com"
                        error={errors.email}
                    />
                </div>

                <div>
                    <InputField
                        label="Celular *"
                        id="celular"
                        value={data.celular || ''}
                        onChange={(e) => onUpdate('celular', maskBRPhone(e.target.value))}
                        placeholder="(11) 99999-9999"
                        error={errors.celular}
                    />
                </div>
            </div>

            {/* Terceira linha: Email Índigo | Telefone */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:gap-4">
                <div className="md:col-span-3">
                    <InputField
                        label="E-mail Índigo *"
                        id="emailIndigo"
                        type="email"
                        value={data.emailIndigo || ''}
                        onChange={(e) => onUpdate('emailIndigo', e.target.value)}
                        onBlur={() => onBlurField?.('emailIndigo')}
                        placeholder="email@indigo.com"
                        error={errors.emailIndigo}
                    />
                </div>

                <div>
                    <InputField
                        label="Telefone"
                        id="telefone"
                        value={data.telefone || ''}
                        onChange={(e) => onUpdate('telefone', maskBRPhone(e.target.value))}
                        placeholder="(11) 3333-4444"
                        error={errors.telefone}
                    />
                </div>
            </div>

            {/* Seção Veículo */}
            <div className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
                    <div>
                        <SelectFieldRadix
                            label="Possui Veículo? *"
                            value={data.possuiVeiculo || ''}
                            onValueChange={(value) => onUpdate('possuiVeiculo', value)}
                            placeholder="Selecione"
                            error={errors.possuiVeiculo}
                        >
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                        </SelectFieldRadix>
                    </div>

                    {/* Campos condicionais do veículo na mesma linha */}
                    {data.possuiVeiculo === 'sim' && (
                        <>
                            <div>
                                <InputField
                                    label="Placa do Veículo *"
                                    id="placaVeiculo"
                                    value={data.placaVeiculo || ''}
                                    onChange={(e) =>
                                        onUpdate('placaVeiculo', maskPlate(e.target.value))
                                    }
                                    placeholder="ABC-1234"
                                    error={errors.placaVeiculo}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <InputField
                                    label="Modelo do Veículo *"
                                    id="modeloVeiculo"
                                    value={data.modeloVeiculo || ''}
                                    onChange={(e) => onUpdate('modeloVeiculo', e.target.value)}
                                    placeholder="Ex: Honda Civic"
                                    error={errors.modeloVeiculo}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div>
                <h3 
                    style={{ 
                        fontFamily: "var(--hub-card-title-font-family)",
                        fontWeight: "var(--hub-card-title-font-weight)",
                        color: "var(--hub-card-title-color)"
                    }}
                    className="text-base sm:text-lg leading-none tracking-tight"
                >
                    Dados para pagamento
                </h3>
                
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                <div className="relative w-full">
                    <div
                        className={cn(
                            'flex flex-col h-full w-full rounded-lg border border-input bg-card px-4 pt-2 pb-3 shadow-sm transition-all overflow-visible',
                            'focus-within:outline-none focus-within:border-ring focus-within:shadow-[0_0_0_1px_hsl(var(--ring))]',
                            errors.banco && 'border-destructive'
                        )}
                    >
                        <label className="text-xs font-medium text-muted-foreground mb-1 pointer-events-none">
                            Banco <span className="text-destructive">*</span>
                        </label>
                        <Combobox
                            options={bankOptions}
                            value={data.banco || ''}
                            onValueChange={(value) => onUpdate('banco', value)}
                            placeholder={bankPlaceholder}
                            searchPlaceholder="Buscar banco..."
                            emptyMessage={bankEmptyMessage}
                            error={!!errors.banco}
                            disabled={banksLoading || bankOptions.length === 0}
                            aria-label="Banco"
                            aria-required="true"
                            data-testid="field-banco"
                            className="border-0 shadow-none p-0 h-auto bg-transparent"
                        />
                    </div>
                    {banksMessage && !errors.banco && (
                        <p className="text-xs text-muted-foreground mt-1">{banksMessage}</p>
                    )}
                    {errors.banco && <p className="text-xs text-destructive mt-1">{errors.banco}</p>}
                </div>

                <div>
                    <InputField
                        label="Agência *"
                        id="agencia"
                        value={data.agencia || ''}
                        onChange={(e) => onUpdate('agencia', onlyDigits(e.target.value))}
                        placeholder="Digite o número da agência"
                        error={errors.agencia}
                    />
                </div>

                <div>
                    <InputField
                        label="Conta *"
                        id="conta"
                        value={data.conta || ''}
                        onChange={(e) => onUpdate('conta', onlyDigits(e.target.value))}
                        placeholder="Digite o número da conta"
                        error={errors.conta}
                    />
                </div>
            </div>

            {/* Linha de Tipo de Chave Pix e Chave Pix */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-12 md:gap-4">
                <div className="md:col-span-3">
                    <SelectFieldRadix
                        label="Tipo de Chave Pix *"
                        value={data.pixTipo || ''}
                        onValueChange={(value) => {
                            onUpdate('pixTipo', value);
                            // Limpa a chave ao trocar de tipo
                            onUpdate('chavePix', '');
                        }}
                        placeholder="Selecione o tipo"
                        error={errors.pixTipo}
                    >
                        <SelectItem value="email">E-mail</SelectItem>
                        <SelectItem value="telefone">Telefone</SelectItem>
                        <SelectItem value="cpf">CPF</SelectItem>
                        <SelectItem value="aleatoria">Chave aleatória</SelectItem>
                        <SelectItem value="cnpj">CNPJ</SelectItem>
                    </SelectFieldRadix>
                </div>

                <div className="md:col-span-9">
                    <InputField
                        label="Chave Pix *"
                        id="chavePix"
                        type="text"
                        value={data.chavePix || ''}
                        onChange={(e) => {
                            const masked = maskPixKey(data.pixTipo || '', e.target.value);
                            onUpdate('chavePix', masked);
                        }}
                        onBlur={() => {
                            if (data.pixTipo && data.chavePix) {
                                const validation = validatePixKey(data.pixTipo, data.chavePix);
                                if (!validation.valid) {
                                    onBlurField?.('chavePix');
                                }
                            }
                        }}
                        placeholder={getPixPlaceholder(data.pixTipo)}
                        disabled={!data.pixTipo}
                        error={errors.chavePix}
                    />
                    
                </div>
            </div>

            {/* Seção: Valores por Tipo de Atividade */}
            <div className="pt-2">
                <h4 className="text-sm font-normal text-muted-foreground mb-3" style={{fontFamily: "Sora"}}>Valores por Tipo de Atividade</h4>
                
                {/* Linha 1: 3 campos */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 mb-3">
                    <InputField
                        label="Sessão em Consultório *"
                        id="valorSessaoConsultorio"
                        type="text"
                        value={data.valorSessaoConsultorio ?? ''}
                        onChange={(e) => onUpdate('valorSessaoConsultorio', maskBRL(e.target.value))}
                        placeholder="R$ 0,00"
                        error={errors.valorSessaoConsultorio}
                    />
                    
                    <InputField
                        label="Sessão em Homecare *"
                        id="valorSessaoHomecare"
                        type="text"
                        value={data.valorSessaoHomecare ?? ''}
                        onChange={(e) => onUpdate('valorSessaoHomecare', maskBRL(e.target.value))}
                        placeholder="R$ 0,00"
                        error={errors.valorSessaoHomecare}
                    />
                    
                    <InputField
                        label="Hora Desenvolvimento Materiais *"
                        id="valorHoraDesenvolvimentoMateriais"
                        type="text"
                        value={data.valorHoraDesenvolvimentoMateriais ?? ''}
                        onChange={(e) => onUpdate('valorHoraDesenvolvimentoMateriais', maskBRL(e.target.value))}
                        placeholder="R$ 0,00"
                        error={errors.valorHoraDesenvolvimentoMateriais}
                    />
                </div>
                
                {/* Linha 2: 3 campos */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
                    <InputField
                        label="Hora Supervisão Recebida *"
                        id="valorHoraSupervisaoRecebida"
                        type="text"
                        value={data.valorHoraSupervisaoRecebida ?? ''}
                        onChange={(e) => onUpdate('valorHoraSupervisaoRecebida', maskBRL(e.target.value))}
                        placeholder="R$ 0,00"
                        error={errors.valorHoraSupervisaoRecebida}
                    />
                    
                    <InputField
                        label="Hora Supervisão Dada *"
                        id="valorHoraSupervisaoDada"
                        type="text"
                        value={data.valorHoraSupervisaoDada ?? ''}
                        onChange={(e) => onUpdate('valorHoraSupervisaoDada', maskBRL(e.target.value))}
                        placeholder="R$ 0,00"
                        error={errors.valorHoraSupervisaoDada}
                    />
                    
                    <InputField
                        label="Hora de Reuniões *"
                        id="valorHoraReuniao"
                        type="text"
                        value={data.valorHoraReuniao ?? ''}
                        onChange={(e) => onUpdate('valorHoraReuniao', maskBRL(e.target.value))}
                        placeholder="R$ 0,00"
                        error={errors.valorHoraReuniao}
                    />
                </div>
            </div>
        </div>
    );
}
