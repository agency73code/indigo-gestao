import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { ArrowLeft, ArrowRight, Check, CheckCircle, XCircle, X } from 'lucide-react';
import {
    DadosPessoaisStep,
    EnderecoStep,
    DadosPagamentoStep,
    DadosEscolaStep,
    ArquivosStep,
} from '../components/cliente';
import MultiStepProgress from '../components/MultiStepProgress';
import type { Cliente } from '../types/cadastros.types';
import { CardTitle } from '@/ui/card';
import { CardHeader } from '@/components/ui/card';
import { cadastrarCliente } from '@/lib/api';
import { isValidCPF, onlyDigits, isValidEmail, isValidCEP } from '@/common/utils/mask';

const STEPS = ['Dados Pessoais', 'Endereço', 'Arquivos', 'Dados Pagamento', 'Dados Escola'];

export default function CadastroClientePage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<Partial<Cliente>>({
        // Dados pessoais
        nome: null,
        cpf: null,
        dataNascimento: null,
        emailContato: null,
        dataEntrada: null,
        dataSaida: null,

        // Cuidadores - inicializado vazio, será preenchido pelo useEffect do DadosPessoaisStep
        cuidadores: [],

        // Endereços
        enderecos: [
            {
                cep: null,
                logradouro: null,
                numero: null,
                complemento: null,
                bairro: null,
                cidade: null,
                uf: null,
            },
        ],
        maisDeUmEndereco: 'nao',

        // Dados pagamento
        dadosPagamento: {
            nomeTitular: null,
            numeroCarteirinha: null,
            telefone1: null,
            mostrarTelefone2: false,
            telefone2: null,
            mostrarTelefone3: false,
            telefone3: null,
            email1: null,
            mostrarEmail2: false,
            email2: null,
            mostrarEmail3: false,
            email3: null,
            sistemaPagamento: 'particular' as 'reembolso' | 'liminar' | 'particular',
            prazoReembolso: null,
            numeroProcesso: null,
            nomeAdvogado: null,
            telefoneAdvogado1: null,
            mostrarTelefoneAdvogado2: false,
            telefoneAdvogado2: null,
            mostrarTelefoneAdvogado3: false,
            telefoneAdvogado3: null,
            emailAdvogado1: null,
            mostrarEmailAdvogado2: false,
            emailAdvogado2: null,
            mostrarEmailAdvogado3: false,
            emailAdvogado3: null,
            houveNegociacao: 'nao' as 'sim' | 'nao',
            valorAcordado: null,
        },

        // Dados escola
        dadosEscola: {
            tipoEscola: 'particular',
            nome: null,
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
            contatos: [],
        },

        // Arquivos
        arquivos: {
            fotoPerfil: null,
            documentoIdentidade: null,
            comprovanteCpf: null,
            comprovanteResidencia: null,
            carterinhaPlano: null,
            relatoriosMedicos: null,
            prescricaoMedica: null,
        },
    });

    const updateField = (field: string, value: any) => {
        setFormData((prev) => {
            if (field.includes('.')) {
                const keys = field.split('.');
                const newData = { ...prev };
                let current: any = newData;

                for (let i = 0; i < keys.length - 1; i++) {
                    if (!current[keys[i]]) {
                        current[keys[i]] = {};
                    }
                    current = current[keys[i]];
                }

                current[keys[keys.length - 1]] = value;
                return newData;
            }

            return { ...prev, [field]: value };
        });

        // Validação em tempo real para limpar erros quando input é corrigido
        const valueStr = String(value ?? '');

        // Validação de CPF do cliente
        if (field === 'cpf') {
            const digits = onlyDigits(valueStr);
            if (digits.length !== 11 || isValidCPF(valueStr)) {
                setErrors((prev) => ({ ...prev, [field]: '' }));
            }
            return;
        }

        // Validação de CPF dos cuidadores
        if (field.startsWith('cuidadores.') && field.endsWith('.cpf')) {
            const digits = onlyDigits(valueStr);
            if (digits.length !== 11 || isValidCPF(valueStr)) {
                setErrors((prev) => ({ ...prev, [field]: '' }));
            }
            return;
        }

        // Validação de email dos cuidadores e cliente
        if (
            field === 'emailContato' ||
            (field.startsWith('cuidadores.') && field.endsWith('.email'))
        ) {
            if (!valueStr.trim() || isValidEmail(valueStr)) {
                setErrors((prev) => ({ ...prev, [field]: '' }));
            }
            return;
        }

        // Validação de telefone dos cuidadores
        if (field.startsWith('cuidadores.') && field.endsWith('.telefone')) {
            if (!valueStr.trim()) {
                setErrors((prev) => ({ ...prev, [field]: '' }));
                return;
            }
            const digits = onlyDigits(valueStr);
            if (digits.length >= 10 && digits.length <= 11) {
                setErrors((prev) => ({ ...prev, [field]: '' }));
            }
            return;
        }

        // Validação de CEP dos endereços
        if (field.startsWith('enderecos.') && field.endsWith('.cep')) {
            if (!valueStr.trim() || isValidCEP(valueStr)) {
                setErrors((prev) => ({ ...prev, [field]: '' }));
            }
            return;
        }
    };

    const handleBlurField = (field: string) => {
        setErrors((prev) => ({ ...prev, [field]: '' })); // Limpa erro anterior

        // Validação de CPF do cliente
        if (field === 'cpf') {
            const value = formData?.cpf ?? '';

            if (!String(value).trim()) {
                setErrors((prev) => ({ ...prev, [field]: 'CPF é obrigatório' }));
                return;
            }

            const has11 = onlyDigits(value).length === 11;
            const valid = isValidCPF(value);

            if (has11 && !valid) {
                setErrors((prev) => ({ ...prev, [field]: 'CPF inválido' }));
            }
            return;
        }

        // Validação de CPF dos cuidadores
        if (field.startsWith('cuidadores.') && field.endsWith('.cpf')) {
            const parts = field.split('.');
            const idx = Number(parts[1] ?? -1);
            const value = formData?.cuidadores?.[idx]?.cpf ?? '';

            if (!String(value).trim()) {
                setErrors((prev) => ({ ...prev, [field]: 'CPF é obrigatório' }));
                return;
            }

            const has11 = onlyDigits(value).length === 11;
            const valid = isValidCPF(value);

            if (has11 && !valid) {
                setErrors((prev) => ({ ...prev, [field]: 'CPF inválido' }));
            }
            return;
        }

        // Validação de email dos cuidadores
        if (field.startsWith('cuidadores.') && field.endsWith('.email')) {
            const parts = field.split('.');
            const idx = Number(parts[1] ?? -1);
            const value = formData?.cuidadores?.[idx]?.email ?? '';

            if (value.trim() && !isValidEmail(value)) {
                setErrors((prev) => ({ ...prev, [field]: 'E-mail inválido' }));
            }
            return;
        }

        // Validação de telefone dos cuidadores
        if (field.startsWith('cuidadores.') && field.endsWith('.telefone')) {
            const parts = field.split('.');
            const idx = Number(parts[1] ?? -1);
            const value = formData?.cuidadores?.[idx]?.telefone ?? '';

            if (value.trim()) {
                const digits = onlyDigits(value);
                if (digits.length < 10 || digits.length > 11) {
                    setErrors((prev) => ({
                        ...prev,
                        [field]: 'Telefone deve ter 10 ou 11 dígitos',
                    }));
                }
            }
            return;
        }

        // Validação de CEP dos endereços
        if (field.startsWith('enderecos.') && field.endsWith('.cep')) {
            const parts = field.split('.');
            const idx = Number(parts[1] ?? -1);
            const value = formData?.enderecos?.[idx]?.cep ?? '';

            if (value.trim() && !isValidCEP(value)) {
                setErrors((prev) => ({ ...prev, [field]: 'CEP inválido' }));
            }
            return;
        }

        // Validação de emails dos dados de pagamento
        if (field.startsWith('dadosPagamento.') && field.includes('email')) {
            const value = getNestedValue(formData, field) as string;
            if (value?.trim() && !isValidEmail(value)) {
                setErrors((prev) => ({ ...prev, [field]: 'E-mail inválido' }));
            }
            return;
        }

        // Validação de telefones dos dados de pagamento
        if (field.startsWith('dadosPagamento.') && field.includes('telefone')) {
            const value = getNestedValue(formData, field) as string;
            if (value?.trim()) {
                const digits = onlyDigits(value);
                if (digits.length < 10 || digits.length > 11) {
                    setErrors((prev) => ({
                        ...prev,
                        [field]: 'Telefone deve ter 10 ou 11 dígitos',
                    }));
                }
            }
            return;
        }

        // Validação de email da escola
        if (field === 'dadosEscola.email') {
            const value = formData?.dadosEscola?.email ?? '';
            if (value.trim() && !isValidEmail(value)) {
                setErrors((prev) => ({ ...prev, [field]: 'E-mail inválido' }));
            }
            return;
        }

        // Validação de telefone da escola
        if (field === 'dadosEscola.telefone') {
            const value = formData?.dadosEscola?.telefone ?? '';
            if (value.trim()) {
                const digits = onlyDigits(value);
                if (digits.length < 10 || digits.length > 11) {
                    setErrors((prev) => ({
                        ...prev,
                        [field]: 'Telefone deve ter 10 ou 11 dígitos',
                    }));
                }
            }
            return;
        }

        // Validação de contatos da escola
        if (field.startsWith('dadosEscola.contatos.')) {
            const parts = field.split('.');
            const idx = Number(parts[2] ?? -1);
            const fieldType = parts[3];
            const contato = formData?.dadosEscola?.contatos?.[idx];

            if (fieldType === 'email' && contato?.email?.trim()) {
                if (!isValidEmail(contato.email)) {
                    setErrors((prev) => ({ ...prev, [field]: 'E-mail inválido' }));
                }
            } else if (fieldType === 'telefone' && contato?.telefone?.trim()) {
                const digits = onlyDigits(contato.telefone);
                if (digits.length < 10 || digits.length > 11) {
                    setErrors((prev) => ({
                        ...prev,
                        [field]: 'Telefone deve ter 10 ou 11 dígitos',
                    }));
                }
            }
            return;
        }

        // Validação de CEP da escola
        if (field === 'dadosEscola.endereco.cep') {
            const value = formData?.dadosEscola?.endereco?.cep ?? '';
            if (value.trim() && !isValidCEP(value)) {
                setErrors((prev) => ({ ...prev, [field]: 'CEP inválido' }));
            }
            return;
        }
    };

    // Função auxiliar para acessar valores aninhados
    const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        switch (currentStep) {
            case 1: // Dados Pessoais
                if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
                if (!formData.cpf?.trim()) {
                    newErrors.cpf = 'CPF é obrigatório';
                } else if (!isValidCPF(formData.cpf)) {
                    newErrors.cpf = 'CPF inválido';
                }
                if (!formData.dataNascimento?.trim())
                    newErrors.dataNascimento = 'Data de nascimento é obrigatória';
                if (!formData.emailContato?.trim())
                    newErrors.emailContato = 'E-mail de contato é obrigatório';
                if (!formData.dataEntrada?.trim())
                    newErrors.dataEntrada = 'Data de entrada é obrigatória';

                // Validação dos cuidadores

                if (!formData.cuidadores?.length) {
                    newErrors.cuidadores = 'Pelo menos um cuidador é obrigatório';
                } else {
                    formData.cuidadores.forEach((cuidador, index) => {
                        if (!cuidador.relacao?.trim()) {
                            newErrors[`cuidadores.${index}.relacao`] = 'Relação é obrigatória';
                        }
                        if (cuidador.relacao === 'outro' && !cuidador.descricaoRelacao?.trim()) {
                            newErrors[`cuidadores.${index}.descricaoRelacao`] =
                                'Descrição é obrigatória quando "Outro" é selecionado';
                        }
                        if (!cuidador.nome?.trim()) {
                            newErrors[`cuidadores.${index}.nome`] = 'Nome é obrigatório';
                        }
                        if (!cuidador.telefone?.trim()) {
                            newErrors[`cuidadores.${index}.telefone`] = 'Telefone é obrigatório';
                        }
                        if (!cuidador.email?.trim()) {
                            newErrors[`cuidadores.${index}.email`] = 'E-mail é obrigatório';
                        }
                        if (!cuidador.cpf?.trim()) {
                            newErrors[`cuidadores.${index}.cpf`] = 'CPF é obrigatório';
                        } else if (!isValidCPF(cuidador.cpf)) {
                            newErrors[`cuidadores.${index}.cpf`] = 'CPF inválido';
                        }
                        if (!cuidador.escolaridade?.trim()) {
                            newErrors[`cuidadores.${index}.escolaridade`] = 'Escolaridade é obrigatória';
                        }
                    });
                }
                break;

            case 2: // Endereço
                if (!formData.enderecos?.length) {
                    newErrors.enderecos = 'Pelo menos um endereço é obrigatório';
                } else {
                    formData.enderecos.forEach((endereco, index) => {
                        if (!endereco.residenciaDe?.trim()) {
                            newErrors[`enderecos.${index}.residenciaDe`] =
                                'Residência de é obrigatório';
                        }
                        if (
                            endereco.residenciaDe === 'outro' &&
                            !endereco.outroResidencia?.trim()
                        ) {
                            newErrors[`enderecos.${index}.outroResidencia`] =
                                'Especificação é obrigatória quando "Outro" é selecionado';
                        }
                        // CEP obrigatório apenas para endereço principal (index 0)
                        if (index === 0 && !endereco.cep?.trim()) {
                            newErrors[`enderecos.${index}.cep`] = 'CEP é obrigatório';
                        }
                        if (index === 0 && !endereco.logradouro?.trim()) {
                            newErrors[`enderecos.${index}.logradouro`] = 'Logradouro é obrigatório';
                        }
                        if (index === 0 && !endereco.numero?.trim()) {
                            newErrors[`enderecos.${index}.numero`] = 'Número é obrigatório';
                        }
                        if (index === 0 && !endereco.bairro?.trim()) {
                            newErrors[`enderecos.${index}.bairro`] = 'Bairro é obrigatório';
                        }
                        if (index === 0 && !endereco.cidade?.trim()) {
                            newErrors[`enderecos.${index}.cidade`] = 'Cidade é obrigatória';
                        }
                        if (index === 0 && !endereco.uf?.trim()) {
                            newErrors[`enderecos.${index}.uf`] = 'UF é obrigatório';
                        }
                    });
                }
                break;

            case 3: // Arquivos
                // Validação opcional - apenas a foto de perfil pode ter validação se necessário
                // Por enquanto, não há campos obrigatórios no step de arquivos
                break;

            case 4: // Dados Pagamento
                // Campos obrigatórios básicos
                if (!formData.dadosPagamento?.nomeTitular?.trim())
                    newErrors['dadosPagamento.nomeTitular'] = 'Nome do titular é obrigatório';
                if (!formData.dadosPagamento?.telefone1?.trim())
                    newErrors['dadosPagamento.telefone1'] = 'Telefone é obrigatório';
                if (!formData.dadosPagamento?.email1?.trim())
                    newErrors['dadosPagamento.email1'] = 'E-mail é obrigatório';
                if (!formData.dadosPagamento?.sistemaPagamento?.trim())
                    newErrors['dadosPagamento.sistemaPagamento'] =
                        'Sistema de pagamento é obrigatório';

                // Validações condicionais baseadas no sistema de pagamento
                if (formData.dadosPagamento?.sistemaPagamento === 'liminar') {
                    if (!formData.dadosPagamento?.telefoneAdvogado1?.trim())
                        newErrors['dadosPagamento.telefoneAdvogado1'] =
                            'Telefone do advogado é obrigatório';
                    if (!formData.dadosPagamento?.emailAdvogado1?.trim())
                        newErrors['dadosPagamento.emailAdvogado1'] =
                            'E-mail do advogado é obrigatório';
                }

                if (
                    formData.dadosPagamento?.sistemaPagamento === 'particular' &&
                    formData.dadosPagamento?.houveNegociacao === 'sim'
                ) {
                    if (!formData.dadosPagamento?.valorAcordado?.trim())
                        newErrors['dadosPagamento.valorAcordado'] = 'Valor acordado é obrigatório';
                }
                break;

            case 5: {
                // Dados Escola
                const tipo = formData.dadosEscola?.tipoEscola;
                if (!tipo) newErrors['dadosEscola.tipoEscola'] = 'Tipo da escola é obrigatório';

                const isAfastado = tipo === 'afastado';
                if (!isAfastado) {
                    if (!formData.dadosEscola?.nome?.trim())
                        newErrors['dadosEscola.nome'] = 'Nome da escola é obrigatório';
                    if (!formData.dadosEscola?.telefone?.trim())
                        newErrors['dadosEscola.telefone'] = 'Telefone da escola é obrigatório';
                    if (!formData.dadosEscola?.email?.trim())
                        newErrors['dadosEscola.email'] = 'E-mail é obrigatório';
                    if (formData.dadosEscola?.email && !isValidEmail(formData.dadosEscola.email))
                        newErrors['dadosEscola.email'] = 'E-mail inválido';
                }

                // Contatos da escola (mantém como está)
                if (formData.dadosEscola?.contatos?.length) {
                    formData.dadosEscola.contatos.forEach((contato, index) => {
                        if (!contato.nome?.trim())
                            newErrors[`dadosEscola.contatos.${index}.nome`] = 'Nome é obrigatório';
                        if (!contato.telefone?.trim())
                            newErrors[`dadosEscola.contatos.${index}.telefone`] =
                                'Telefone é obrigatório';
                        if (!contato.funcao?.trim())
                            newErrors[`dadosEscola.contatos.${index}.funcao`] =
                                'Função é obrigatória';
                        if (!contato.email?.trim())
                            newErrors[`dadosEscola.contatos.${index}.email`] =
                                'E-mail é obrigatório';
                        if (contato.email && !isValidEmail(contato.email))
                            newErrors[`dadosEscola.contatos.${index}.email`] = 'E-mail inválido';
                    });
                }
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        console.log('Tentando avançar para próximo passo. Passo atual:', currentStep);
        console.log('Dados do formulário:', formData);

        const isValid = validateCurrentStep();
        console.log('Validação passou?', isValid);
        console.log('Erros encontrados:', errors);

        if (isValid && currentStep < STEPS.length) {
            setCurrentStep((prev) => prev + 1);
        } else {
            console.log('Não foi possível avançar. Validação falhou ou chegou ao último passo.');
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;

        setIsLoading(true);

        try {
            const payload = formData;

            const formDataUpload = new FormData();

            if (payload.arquivos?.fotoPerfil)
                formDataUpload.append('fotoPerfil', payload.arquivos.fotoPerfil);
            if (payload.arquivos?.carterinhaPlano)
                formDataUpload.append('carterinhaPlano', payload.arquivos.carterinhaPlano);
            if (payload.arquivos?.comprovanteCpf)
                formDataUpload.append('comprovanteCpf', payload.arquivos.comprovanteCpf);
            if (payload.arquivos?.comprovanteResidencia)
                formDataUpload.append('comprovanteResidencia', payload.arquivos.comprovanteResidencia);
            if (payload.arquivos?.documentoIdentidade)
                formDataUpload.append('documentoIdentidade', payload.arquivos.documentoIdentidade);
            if (payload.arquivos?.prescricaoMedica)
                formDataUpload.append('prescricaoMedica', payload.arquivos.prescricaoMedica);
            if (payload.arquivos?.relatoriosMedicos)
                formDataUpload.append('relatoriosMedicos', payload.arquivos.relatoriosMedicos);

            delete payload.arquivos;

            const result = await cadastrarCliente(payload);

            if (!result.ok) {
                if (result.code === 'VALIDATION_ERROR') {
                    result.errors.forEach((e: any) => toast.error(`${e.path}: ${e.message}`));
                } else if (result.code === 'CPF_DUPLICADO') {
                    toast.error('CPF já cadastrado!');
                } else if (result.code === 'EMAIL_DUPLICADO') {
                    toast.error('E-mail já cadastrado!');
                } else {
                    toast.error(result.message ?? 'Erro inesperado');
                }
                return;
            }

            formDataUpload.append('ownerType', 'cliente');
            formDataUpload.append('ownerId', result.id);
            formDataUpload.append('fullName', payload.nome!);
            formDataUpload.append('birthDate', payload.dataNascimento!);
            formDataUpload.append('cpf', payload.cpf!);

            await fetch('/api/arquivos', {
                method: 'POST',
                body: formDataUpload,
            }).then((r) => r.json());

            toast.success('Cliente cadastrado com sucesso!', {
                description: 'O cadastro foi realizado e o cliente foi adicionado ao sistema.',
                duration: 3000,
                icon: <CheckCircle className="h-4 w-4" />,
                action: {
                    label: <X className="h-4 w-4" />,
                    onClick: () => {},
                },
                cancel: {
                    label: 'Fechar',
                    onClick: () => {},
                },
            });

            // Redireciona para a página de cadastros (hub) após um breve delay
            setTimeout(() => {
                navigate('/app/cadastros');
            }, 1000);
        } catch (error) {
            console.error('Erro ao cadastrar cliente:', error);
            toast.error('Erro ao cadastrar cliente', {
                description: 'Ocorreu um erro durante o cadastro. Tente novamente.',
                duration: 4000,
                icon: <XCircle className="h-4 w-4" />,
                action: {
                    label: <X className="h-4 w-4" />,
                    onClick: () => {},
                },
                cancel: {
                    label: 'Fechar',
                    onClick: () => {},
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderCurrentStep = () => {
        const commonProps = {
            data: formData,
            onUpdate: updateField,
            errors,
            onBlur: handleBlurField,
        };

        switch (currentStep) {
            case 1:
                return <DadosPessoaisStep {...commonProps} />;
            case 2:
                return <EnderecoStep {...commonProps} />;
            case 3:
                return <ArquivosStep {...commonProps} />;
            case 4:
                return <DadosPagamentoStep {...commonProps} />;
            case 5:
                return <DadosEscolaStep {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <CardHeader className="p-0">
                <CardTitle className="text-2xl mb-8 text-primary font-medium">Cadastro de Cliente</CardTitle>
                <MultiStepProgress
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    steps={STEPS}
                />
            </CardHeader>

            {/* Form Content */}
            <div className="">{renderCurrentStep()}</div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
                <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isLoading}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                </Button>

                {currentStep < STEPS.length ? (
                    <Button onClick={nextStep} disabled={isLoading}>
                        Próximo
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Cadastrando...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Finalizar Cadastro
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}
