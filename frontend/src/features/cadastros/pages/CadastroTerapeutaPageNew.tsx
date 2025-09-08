import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Terapeuta } from '../types/cadastros.types';

// Componentes dos steps
import MultiStepProgress from '../components/MultiStepProgress';
import DadosPessoaisStep from '../components/terapeuta/DadosPessoaisStep';
import EnderecoStep from '../components/terapeuta/EnderecoStep';
import DadosProfissionaisStep from '../components/terapeuta/DadosProfissionaisStep';
import FormacaoStep from '../components/terapeuta/FormacaoStep';
import ArquivosStep from '../components/terapeuta/ArquivosStep';
import DadosCNPJStep from '../components/terapeuta/DadosCNPJStep';

const STEPS = [
    'Dados Pessoais',
    'Endereço',
    'Dados Profissionais',
    'Formação',
    'Arquivos',
    'Dados CNPJ',
];

export default function CadastroTerapeutaPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Partial<Terapeuta>>({
        // Dados pessoais
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        dataNascimento: '',

        // Endereço
        endereco: {
            cep: '',
            rua: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
        },

        // Dados profissionais
        crp: '',
        especialidades: [],
        dataInicio: '',
        valorConsulta: '',
        formasAtendimento: [],

        // Formação
        formacao: {
            graduacao: '',
            instituicaoGraduacao: '',
            anoFormatura: '',
            posGraduacao: '',
            instituicaoPosGraduacao: '',
            anoPosGraduacao: '',
            cursos: '',
        },

        // Arquivos
        arquivos: {
            fotoPerfil: undefined,
            diplomaGraduacao: undefined,
            diplomaPosGraduacao: undefined,
            registroCRP: undefined,
            comprovanteEndereco: undefined,
        },

        // CNPJ
        cnpj: {
            numero: '',
            razaoSocial: '',
            nomeFantasia: '',
            endereco: {
                cep: '',
                rua: '',
                numero: '',
                complemento: '',
                bairro: '',
                cidade: '',
                estado: '',
            },
        },
    });

    const handleInputChange = (field: string, value: string | string[] | File | null) => {
        const keys = field.split('.');

        setFormData((prev) => {
            const newData = { ...prev };
            let current: any = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });

        // Limpar erro do campo quando alterado
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        switch (currentStep) {
            case 1: // Dados Pessoais
                if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório';
                if (!formData.email?.trim()) newErrors.email = 'E-mail é obrigatório';
                if (!formData.telefone?.trim()) newErrors.telefone = 'Telefone é obrigatório';
                if (!formData.cpf?.trim()) newErrors.cpf = 'CPF é obrigatório';
                if (!formData.dataNascimento?.trim())
                    newErrors.dataNascimento = 'Data de nascimento é obrigatória';
                
                break;

            case 2: // Endereço
                if (!formData.endereco?.cep?.trim())
                    newErrors['endereco.cep'] = 'CEP é obrigatório';
                if (!formData.endereco?.rua?.trim())
                    newErrors['endereco.rua'] = 'Rua é obrigatória';
                if (!formData.endereco?.numero?.trim())
                    newErrors['endereco.numero'] = 'Número é obrigatório';
                if (!formData.endereco?.bairro?.trim())
                    newErrors['endereco.bairro'] = 'Bairro é obrigatório';
                if (!formData.endereco?.cidade?.trim())
                    newErrors['endereco.cidade'] = 'Cidade é obrigatória';
                if (!formData.endereco?.estado?.trim())
                    newErrors['endereco.estado'] = 'Estado é obrigatório';
                break;

            case 3: // Dados Profissionais
                if (!formData.crp?.trim()) newErrors.crp = 'CRP é obrigatório';
                if (!formData.dataInicio?.trim())
                    newErrors.dataInicio = 'Data de início é obrigatória';
                if (!formData.valorConsulta?.trim())
                    newErrors.valorConsulta = 'Valor da consulta é obrigatório';
                if (!formData.especialidades?.length)
                    newErrors.especialidades = 'Pelo menos uma especialidade é obrigatória';
                if (!formData.formasAtendimento?.length)
                    newErrors.formasAtendimento =
                        'Pelo menos uma forma de atendimento é obrigatória';
                break;

            case 4: // Formação
                if (!formData.formacao?.graduacao?.trim())
                    newErrors['formacao.graduacao'] = 'Curso de graduação é obrigatório';
                if (!formData.formacao?.instituicaoGraduacao?.trim())
                    newErrors['formacao.instituicaoGraduacao'] = 'Instituição é obrigatória';
                if (!formData.formacao?.anoFormatura?.trim())
                    newErrors['formacao.anoFormatura'] = 'Ano de formatura é obrigatório';
                break;

            case 5: // Arquivos
                if (!formData.arquivos?.diplomaGraduacao)
                    newErrors['arquivos.diplomaGraduacao'] = 'Diploma de graduação é obrigatório';
                if (!formData.arquivos?.registroCRP)
                    newErrors['arquivos.registroCRP'] = 'Registro do CRP é obrigatório';
                if (!formData.arquivos?.comprovanteEndereco)
                    newErrors['arquivos.comprovanteEndereco'] =
                        'Comprovante de endereço é obrigatório';
                break;

            case 6: // Dados CNPJ (opcional)
                // Validação opcional - apenas se preencheu algum campo
                if (formData.cnpj?.numero?.trim()) {
                    if (!formData.cnpj?.razaoSocial?.trim())
                        newErrors['cnpj.razaoSocial'] =
                            'Razão social é obrigatória quando CNPJ é informado';
                }
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
            // Aqui você fará a chamada para a API
            console.log('Dados completos do terapeuta:', formData);
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulação

            // Redirecionar ou mostrar mensagem de sucesso
            alert('Terapeuta cadastrado com sucesso!');
        } catch (error) {
            console.error('Erro ao cadastrar terapeuta:', error);
            alert('Erro ao cadastrar terapeuta. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <DadosPessoaisStep
                        data={formData}
                        onUpdate={handleInputChange}
                        errors={errors}
                    />
                );
            case 2:
                return (
                    <EnderecoStep data={formData} onUpdate={handleInputChange} errors={errors} />
                );
            case 3:
                return (
                    <DadosProfissionaisStep
                        data={formData}
                        onUpdate={handleInputChange}
                        errors={errors}
                    />
                );
            case 4:
                return (
                    <FormacaoStep data={formData} onUpdate={handleInputChange} errors={errors} />
                );
            case 5:
                return (
                    <ArquivosStep data={formData} onUpdate={handleInputChange} errors={errors} />
                );
            case 6:
                return (
                    <DadosCNPJStep data={formData} onUpdate={handleInputChange} errors={errors} />
                );
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="max-w-5xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-2xl">Cadastro de Terapeuta</CardTitle>
                        <MultiStepProgress
                            currentStep={currentStep}
                            totalSteps={STEPS.length}
                            steps={STEPS}
                        />
                    </CardHeader>
                    <CardContent>
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderCurrentStep()}
                        </motion.div>

                        <div className="flex justify-between mt-8 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                className="flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </Button>

                            {currentStep === STEPS.length ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex items-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            Cadastrando...
                                        </>
                                    ) : (
                                        'Finalizar Cadastro'
                                    )}
                                </Button>
                            ) : (
                                <Button onClick={nextStep} className="flex items-center gap-2">
                                    Próximo
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}