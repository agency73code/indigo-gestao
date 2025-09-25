/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, X } from 'lucide-react';
import type { Terapeuta } from '../types/cadastros.types';
import {
    maskCPF,
    isValidCPF,
    onlyDigits,
    isValidEmail,
    normalizeEmail,
    maskCNPJ,
    isValidCNPJ,
    toTitleCaseSimple,
} from '@/common/utils/mask';
// Componentes dos steps
import MultiStepProgress from '../components/MultiStepProgress';
import DadosPessoaisStep from '../components/terapeuta/DadosPessoaisStep';
import EnderecoStep from '../components/terapeuta/EnderecoStep';
import DadosProfissionaisStep from '../components/terapeuta/DadosProfissionaisStep';
import FormacaoStep from '../components/terapeuta/FormacaoStep';
import ArquivosStep from '../components/terapeuta/ArquivosStep';
import DadosCNPJStep from '../components/terapeuta/DadosCNPJStep';
import { cadastrarTerapeuta } from '@/lib/api';

const STEPS = [
    'Dados Pessoais',
    'Endereço',
    'Dados Profissionais',
    'Formação',
    'Arquivos',
    'Dados CNPJ',
];

export default function CadastroTerapeutaPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Partial<Terapeuta> & any>({
        // Dados pessoais
        nome: null,
        email: null,
        emailIndigo: null,
        telefone: null,
        celular: null,
        cpf: null,
        dataNascimento: null,
        possuiVeiculo: 'nao' as 'sim' | 'nao',
        placaVeiculo: null,
        modeloVeiculo: null,

        // Dados bancários
        banco: null,
        agencia: null,
        conta: null,
        chavePix: null,
        valorHoraAcordado: null,
        professorUnindigo: 'nao' as 'sim' | 'nao',
        disciplinaUniindigo: null,

        // Endereço
        endereco: {
            cep: null,
            rua: null,
            numero: null,
            complemento: null,
            bairro: null,
            cidade: null,
            estado: null,
        },

        dataInicio: null,
        dataFim: null,

        // Formação
        formacao: {
            graduacao: null,
            instituicaoGraduacao: null,
            anoFormatura: null,
            posGraduacoes: [],
            participacaoCongressosDescricao: null,
            publicacoesLivrosDescricao: null,
        },

        // Arquivos
        arquivos: {
            fotoPerfil: null,
            diplomaGraduacao: null,
            diplomaPosGraduacao: null,
            registroCRP: null,
            comprovanteEndereco: null,
        },

        // CNPJ
        cnpj: {
            numero: null,
            razaoSocial: null,
            endereco: {
                cep: null,
                rua: null,
                numero: null,
                complemento: null,
                bairro: null,
                cidade: null,
                estado: null,
            },
        },
    });

    const handleInputChange = (field: string, value: any) => {
        console.log('CadastroTerapeutaPage - handleInputChange called:', field, value);

        // [CPF] máscara + validação em tempo real
        if (field === 'cpf') {
            const masked = maskCPF(String(value ?? ''));
            setFormData((prev: any) => ({ ...prev, cpf: masked }));

            // mostra erro quando tiver 11 dígitos (14 chars com máscara) e for inválido
            const showError = masked.replace(/\D/g, '').length === 11 && !isValidCPF(masked);
            setErrors((prev) => ({ ...prev, cpf: showError ? 'CPF inválido' : '' }));
            return;
        }

        // [CNPJ] máscara em tempo real
        if (field === 'cnpj.numero') {
            const masked = maskCNPJ(String(value ?? ''));
            setFormData((prev: any) => ({
                ...prev,
                cnpj: { ...(prev.cnpj || {}), numero: masked },
            }));
            // mostra erro quando tiver 14 dígitos e for inválido
            const showError = masked.replace(/\D/g, '').length === 14 && !isValidCNPJ(masked);
            setErrors((prev) => ({ ...prev, ['cnpj.numero']: showError ? 'CNPJ inválido' : '' }));
            return;
        }

        // [Razão Social] — NÃO normaliza aqui (permite digitar espaços normalmente)
        if (field === 'cnpj.razaoSocial') {
            setFormData((prev: any) => ({
                ...prev,
                cnpj: { ...(prev.cnpj || {}), razaoSocial: String(value ?? '') },
            }));
            return;
        }

        // [E-MAIL] normaliza em tempo real, mas NÃO valida aqui (valida no onBlur)
        if (field === 'email') {
            const norm = normalizeEmail(value);
            setFormData((prev: any) => ({ ...prev, email: norm }));
            return;
        }

        if (field === 'emailIndigo') {
            const norm = normalizeEmail(value);
            setFormData((prev: any) => ({ ...prev, emailIndigo: norm }));
            return;
        }

        // [restante] mantém sua lógica original para campos com dot-notation
        const keys = field.split('.');
        setFormData((prev: any) => {
            const newData = { ...prev };
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (current[key] === undefined || current[key] === null) current[key] = {};
                current = current[key];
            }
            current[keys[keys.length - 1]] = value;
            return newData;
        });
    };

    // valida e-mail SOMENTE no blur (UX melhor)
    const handleBlurField = (field: string) => {
        if (field === 'email' || field === 'emailIndigo') {
            const v = String(formData[field] ?? '');
            if (!v.trim()) {
                setErrors((prev) => ({ ...prev, [field]: 'Campo obrigatório' }));
            } else {
                setErrors((prev) => ({
                    ...prev,
                    [field]: isValidEmail(v) ? '' : 'E-mail inválido',
                }));
            }
        }
        // (sem alteração nos demais campos)
    };

    const validateCurrentStep = () => {
        const newErrors: Record<string, string> = {};
        switch (currentStep) {
            case 1: // Dados Pessoais
                if (!formData.nome?.trim()) newErrors.nome = 'Campo obrigatório';

                if (!formData.cpf?.trim()) {
                    newErrors.cpf = 'Campo obrigatório';
                } else if (!isValidCPF(formData.cpf)) {
                    newErrors.cpf = 'CPF inválido';
                }

                if (!formData.dataNascimento?.trim()) {
                    newErrors.dataNascimento = 'Data de nascimento é obrigatória';
                }

                if (!formData.email?.trim()) {
                    newErrors.email = 'Campo obrigatório';
                } else if (!isValidEmail(formData.email)) {
                    newErrors.email = 'E-mail inválido';
                }

                if (!formData.emailIndigo?.trim()) {
                    newErrors.emailIndigo = 'Campo obrigatório';
                } else if (!isValidEmail(formData.emailIndigo)) {
                    newErrors.emailIndigo = 'E-mail inválido';
                }

                if (!formData.celular?.trim()) newErrors.celular = 'Campo obrigatório';
                if (!formData.possuiVeiculo?.trim()) newErrors.possuiVeiculo = 'Campo obrigatório';

                if (formData.possuiVeiculo === 'sim') {
                    if (!formData.placaVeiculo?.trim())
                        newErrors.placaVeiculo = 'Campo obrigatório';
                    if (!formData.modeloVeiculo?.trim())
                        newErrors.modeloVeiculo = 'Campo obrigatório';
                }

                if (!formData.banco?.trim()) newErrors.banco = 'Campo obrigatório';
                if (!formData.agencia?.trim()) newErrors.agencia = 'Campo obrigatório';
                if (!formData.conta?.trim()) newErrors.conta = 'Campo obrigatório';
                if (!formData.chavePix?.trim()) newErrors.chavePix = 'Campo obrigatório';
                break;

            case 2: // Endereço
                if (!formData.endereco?.cep?.trim())
                    newErrors['endereco.cep'] = 'Campo obrigatório';
                if (!formData.endereco?.rua?.trim())
                    newErrors['endereco.rua'] = 'Campo obrigatório';
                if (!formData.endereco?.numero?.trim())
                    newErrors['endereco.numero'] = 'Campo obrigatório';
                if (!formData.endereco?.bairro?.trim())
                    newErrors['endereco.bairro'] = 'Campo obrigatório';
                if (!formData.endereco?.cidade?.trim())
                    newErrors['endereco.cidade'] = 'Campo obrigatório';
                if (!formData.endereco?.estado?.trim())
                    newErrors['endereco.estado'] = 'Campo obrigatório';
                break;

            case 3: // Dados Profissionais
                if (
                    !formData.dadosProfissionais?.length ||
                    !formData.dadosProfissionais[0]?.areaAtuacao?.trim()
                )
                    newErrors['dadosProfissionais.0.areaAtuacao'] = 'Campo obrigatório';
                if (!formData.dadosProfissionais?.[0]?.cargo?.trim())
                    newErrors['dadosProfissionais.0.cargo'] = 'Campo obrigatório';
                if (formData.professorUnindigo === 'sim' && !formData.disciplinaUniindigo?.trim())
                    newErrors['disciplinaUniindigo'] = 'Campo obrigatório';
                if (!formData.dataInicio?.trim()) newErrors.dataInicio = 'Campo obrigatório';
                break;

            case 4: // Formação
                if (!formData.formacao?.graduacao?.trim())
                    newErrors['formacao.graduacao'] = 'Campo obrigatório';
                if (!formData.formacao?.instituicaoGraduacao?.trim())
                    newErrors['formacao.instituicaoGraduacao'] = 'Campo obrigatório';
                if (!formData.formacao?.anoFormatura?.trim())
                    newErrors['formacao.anoFormatura'] = 'Campo obrigatório';
                (formData.formacao?.posGraduacoes || []).forEach((pg: any, idx: number) => {
                    if (!pg?.tipo)
                        newErrors[`formacao.posGraduacoes.${idx}.tipo`] = 'Campo obrigatório';
                    if (!pg?.curso?.trim())
                        newErrors[`formacao.posGraduacoes.${idx}.curso`] = 'Campo obrigatório';
                    if (!pg?.instituicao?.trim())
                        newErrors[`formacao.posGraduacoes.${idx}.instituicao`] =
                            'Campo obrigatório';
                    if (!pg?.conclusao?.trim())
                        newErrors[`formacao.posGraduacoes.${idx}.conclusao`] = 'Campo obrigatório';
                });
                break;

            case 6: {
                // Dados CNPJ (opcional)
                const num = formData.cnpj?.numero?.trim();
                // Só valida se o usuário preencheu o CNPJ
                if (num) {
                    if (!isValidCNPJ(num)) newErrors['cnpj.numero'] = 'CNPJ inválido';
                    if (!formData.cnpj?.razaoSocial?.trim())
                        newErrors['cnpj.razaoSocial'] = 'Campo obrigatório';
                }
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateCurrentStep() && currentStep < STEPS.length) setCurrentStep((s) => s + 1);
    };
    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) return;
        setIsLoading(true);
        try {
            const payload = { ...formData };
            // limpar campos numéricos para a API + normalizar razão social
            if (payload.cpf) payload.cpf = onlyDigits(payload.cpf);
            if (payload.celular) payload.celular = String(payload.celular).replace(/\D/g, '');
            if (payload.telefone) payload.telefone = String(payload.telefone).replace(/\D/g, '');
            if (payload.cnpj?.numero) payload.cnpj.numero = onlyDigits(payload.cnpj.numero);
            if (payload.cnpj?.razaoSocial)
                payload.cnpj.razaoSocial = toTitleCaseSimple(payload.cnpj.razaoSocial);

            const formDataUpload = new FormData();
            formDataUpload.append("cpf", payload.cpf);
            if (payload.arquivos?.fotoPerfil) formDataUpload.append("fotoPerfil", payload.arquivos?.fotoPerfil);
            if (payload.arquivos?.diplomaGraduacao) formDataUpload.append("diplomaGraduacao", payload.arquivos?.diplomaGraduacao);
            if (payload.arquivos?.diplomaPosGraduacao) formDataUpload.append("diplomaPosGraduacao", payload.arquivos?.diplomaPosGraduacao);
            if (payload.arquivos?.registroCRP) formDataUpload.append("registroCRP", payload.arquivos?.registroCRP);
            if (payload.arquivos?.comprovanteEndereco) formDataUpload.append("comprovanteEndereco", payload.arquivos?.comprovanteEndereco);

            const uploadResp = await fetch("/api/arquivos/upload", {
                method: "POST",
                body: formDataUpload,
            }).then(r => r.json());

            payload.documentos = uploadResp.documentos;
            delete payload.arquivos;
            console.log(payload);
            await cadastrarTerapeuta(payload);
            toast.success('Terapeuta cadastrado com sucesso!', {
                description: 'O cadastro foi realizado e o terapeuta foi adicionado ao sistema.',
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
            console.error('Erro ao cadastrar terapeuta:', error);
            toast.error('Erro ao cadastrar terapeuta', {
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
        switch (currentStep) {
            case 1:
                return (
                    <DadosPessoaisStep
                        data={formData}
                        onUpdate={handleInputChange}
                        onBlurField={handleBlurField}
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
        <div className="container mx-auto px-1 sm:px-6 md:px-8 py-6 md:py-8">
            <CardHeader className="p-0">
                <CardTitle className="text-xl sm:text-2xl mb-6 md:mb-8 text-primary">
                    Cadastro de Terapeuta
                </CardTitle>
                <MultiStepProgress
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    steps={STEPS}
                />
            </CardHeader>
            <div>{renderCurrentStep()}</div>
            <div className="flex justify-between items-center gap-3 flex-nowrap w-full mt-8 pt-6 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 whitespace-nowrap"
                >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                </Button>
                {currentStep === STEPS.length ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        {isLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>{' '}
                                Cadastrando...
                            </>
                        ) : (
                            'Finalizar Cadastro'
                        )}
                    </Button>
                ) : (
                    <Button
                        onClick={nextStep}
                        className="flex items-center gap-2 whitespace-nowrap"
                    >
                        Próximo <ChevronRight className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
