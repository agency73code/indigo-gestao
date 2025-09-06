import { useState } from 'react';
import { Button } from '@/ui/button';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
    DadosPessoaisStep,
    EnderecoStep,
    DadosPagamentoStep,
    DadosEscolaStep,
} from '../components/cliente';
import MultiStepProgress from '../components/MultiStepProgress';
import type { Cliente } from '../types/cadastros.types';
import { Card, CardTitle } from '@/ui/card';
import { CardHeader } from '@/shared/components/ui/card';

const STEPS = ['Dados Pessoais', 'Endereço', 'Dados Pagamento', 'Dados Escola'];

export default function CadastroClientePage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState<Partial<Cliente>>({
        // Dados pessoais
        nome: '',
        dataNascimento: '',
        nomeMae: '',
        cpfMae: '',
        nomePai: '',
        cpfPai: '',
        telefonePai: '',
        emailContato: '',
        dataEntrada: '',
        dataSaida: '',
        maisDeUmPai: 'nao',
        nomePai2: '',
        cpfPai2: '',
        telefonePai2: '',

        // Endereços
        enderecos: [
            {
                cep: '',
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                uf: '',
            },
        ],
        maisDeUmEndereco: 'nao',

        // Dados pagamento
        dadosPagamento: {
            nomeTitular: '',
            numeroCarteirinha: '',
            telefone1: '',
            mostrarTelefone2: false,
            telefone2: '',
            mostrarTelefone3: false,
            telefone3: '',
            email1: '',
            mostrarEmail2: false,
            email2: '',
            mostrarEmail3: false,
            email3: '',
            sistemaPagamento: 'particular' as 'reembolso' | 'liminar' | 'particular',
            prazoReembolso: '',
            numeroProcesso: '',
            nomeAdvogado: '',
            telefoneAdvogado1: '',
            mostrarTelefoneAdvogado2: false,
            telefoneAdvogado2: '',
            mostrarTelefoneAdvogado3: false,
            telefoneAdvogado3: '',
            emailAdvogado1: '',
            mostrarEmailAdvogado2: false,
            emailAdvogado2: '',
            mostrarEmailAdvogado3: false,
            emailAdvogado3: '',
            houveNegociacao: 'nao' as 'sim' | 'nao',
            valorSessao: '',
        },

        // Dados escola
        dadosEscola: {
            tipoEscola: 'particular',
            nome: '',
            telefone: '',
            email: '',
            endereco: {
                cep: '',
                logradouro: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                uf: '',
            },
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
    };

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        switch (currentStep) {
            case 1: // Dados Pessoais
                if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
                if (!formData.dataNascimento?.trim())
                    newErrors.dataNascimento = 'Data de nascimento é obrigatória';
                if (!formData.nomeMae?.trim()) newErrors.nomeMae = 'Nome da mãe é obrigatório';
                if (!formData.cpfMae?.trim()) newErrors.cpfMae = 'CPF da mãe é obrigatório';
                if (!formData.emailContato?.trim())
                    newErrors.emailContato = 'E-mail de contato é obrigatório';
                if (!formData.dataEntrada?.trim())
                    newErrors.dataEntrada = 'Data de entrada é obrigatória';
                if (!formData.maisDeUmPai)
                    newErrors.maisDeUmPai = 'Campo "Mais de um Pai?" é obrigatório';
                break;

            case 2: // Endereço
                if (!formData.enderecos?.length || !formData.enderecos[0]?.cep?.trim())
                    newErrors['enderecos.0.cep'] = 'CEP é obrigatório';
                if (!formData.enderecos?.[0]?.logradouro?.trim())
                    newErrors['enderecos.0.logradouro'] = 'Logradouro é obrigatório';
                if (!formData.enderecos?.[0]?.numero?.trim())
                    newErrors['enderecos.0.numero'] = 'Número é obrigatório';
                if (!formData.enderecos?.[0]?.complemento?.trim())
                    newErrors['enderecos.0.complemento'] = 'Complemento é obrigatório';
                if (!formData.enderecos?.[0]?.bairro?.trim())
                    newErrors['enderecos.0.bairro'] = 'Bairro é obrigatório';
                if (!formData.enderecos?.[0]?.cidade?.trim())
                    newErrors['enderecos.0.cidade'] = 'Cidade é obrigatória';
                if (!formData.enderecos?.[0]?.uf?.trim())
                    newErrors['enderecos.0.uf'] = 'UF é obrigatório';
                if (!formData.maisDeUmEndereco)
                    newErrors.maisDeUmEndereco = 'Campo "Mais de um Endereço?" é obrigatório';
                break;

            case 3: // Dados Pagamento
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
                    if (!formData.dadosPagamento?.valorSessao?.trim())
                        newErrors['dadosPagamento.valorSessao'] = 'Valor da sessão é obrigatório';
                }
                break;

            case 4: // Dados Escola
                if (!formData.dadosEscola?.tipoEscola)
                    newErrors['dadosEscola.tipoEscola'] = 'Tipo da escola é obrigatório';
                if (!formData.dadosEscola?.nome?.trim())
                    newErrors['dadosEscola.nome'] = 'Nome da escola é obrigatório';
                if (!formData.dadosEscola?.telefone?.trim())
                    newErrors['dadosEscola.telefone'] = 'Telefone da escola é obrigatório';
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateCurrentStep() && currentStep < STEPS.length) {
            setCurrentStep((prev) => prev + 1);
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
            console.log('Dados completos do cliente:', formData);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulação

            alert('Cliente cadastrado com sucesso!');
        } catch (error) {
            console.error('Erro ao cadastrar cliente:', error);
            alert('Erro ao cadastrar cliente. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderCurrentStep = () => {
        const commonProps = {
            data: formData,
            onUpdate: updateField,
            errors,
        };

        switch (currentStep) {
            case 1:
                return <DadosPessoaisStep {...commonProps} />;
            case 2:
                return <EnderecoStep {...commonProps} />;
            case 3:
                return <DadosPagamentoStep {...commonProps} />;
            case 4:
                return <DadosEscolaStep {...commonProps} />;
            default:
                return null;
        }
    };

    return (
        <div className="">
            {/* Header */}
            <Card className="max-w-full mx-auto ml0">
                <CardHeader>
                    <CardTitle className="text-2xl mb-8 text-primary">
                        Cadastro de Terapeuta
                    </CardTitle>
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
                                'Cadastrando...'
                            ) : (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Finalizar Cadastro
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}
