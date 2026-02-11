import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/ui/button';
import { ArrowLeft, ArrowRight, Check, CheckCircle, XCircle, X, User, MapPin, Briefcase, GraduationCap, FileText, Building2 } from 'lucide-react';
import type { Terapeuta } from '../types/cadastros.types';
import { usePageTitle } from '@/features/shell/layouts/AppLayout';
import {
    maskCPF,
    isValidCPF,
    onlyDigits,
    isValidEmail,
    normalizeEmail,
    maskCNPJ,
    isValidCNPJ,
    toTitleCaseSimple,
    validatePixKey,
    maskPixKey,
    parseCurrencyBR,
} from '@/common/utils/mask';
// Componentes dos steps
import VerticalStepSidebar from '../components/VerticalStepSidebar';
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

const STEP_ICONS = [
    User,          // 1. Dados Pessoais
    MapPin,        // 2. Endereço
    Briefcase,     // 3. Dados Profissionais
    GraduationCap, // 4. Formação
    FileText,      // 5. Arquivos
    Building2,     // 6. Dados CNPJ
];

export default function CadastroTerapeutaPage() {
    // ✅ Definir título da página
    const { setPageTitle, setNoMainContainer, setShowBackButton } = usePageTitle();
    
    useEffect(() => {
        setPageTitle('Cadastro de Terapeuta');
        setNoMainContainer(true); // Remove o container main para essa página
        setShowBackButton(true); // Mostra o botão de voltar
        
        // Cleanup: restaura o container quando sair da página
        return () => {
            setNoMainContainer(false);
            setShowBackButton(false);
        };
    }, [setPageTitle, setNoMainContainer, setShowBackButton]);
    
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
        pixTipo: 'email',
        chavePix: null,
        
        // Valores por tipo de atividade
        valorSessaoConsultorio: null,
        valorSessaoHomecare: null,
        valorHoraDesenvolvimentoMateriais: null,
        valorHoraSupervisaoRecebida: null,
        valorHoraSupervisaoDada: null,
        valorHoraReuniao: null,
        
        professorUnindigo: 'nao' as 'sim' | 'nao',
        disciplinaUniindigo: null,

        // Endereço
        endereco: {
            cep: null,
            rua: null,
            numero: null,
            complemento: '',
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
            outros: null,
            descricaoOutros: null,
        },

        // CNPJ
        cnpj: {
            numero: null,
            razaoSocial: null,
            endereco: {
                cep: null,
                rua: null,
                numero: null,
                complemento: '',
                bairro: null,
                cidade: null,
                estado: null,
            },
        },
    });

    const handleInputChange = (field: string, value: any) => {
        // [CPF] máscara + validação em tempo real
        if (field === 'cpf') {
            const masked = maskCPF(String(value ?? ''));
            setFormData((prev: any) => ({ ...prev, cpf: masked }));

            // Limpa erro se CPF válido ou se ainda não tem 11 dígitos
            const digits = masked.replace(/\D/g, '');
            const hasFullLength = digits.length === 11;
            const isValid = isValidCPF(masked);

            if (!hasFullLength || isValid) {
                setErrors((prev) => ({ ...prev, cpf: '' }));
            } else if (hasFullLength && !isValid) {
                setErrors((prev) => ({ ...prev, cpf: 'CPF inválido' }));
            }
            return;
        }

        // [CNPJ] máscara em tempo real
        if (field === 'cnpj.numero') {
            const masked = maskCNPJ(String(value ?? ''));
            setFormData((prev: any) => ({
                ...prev,
                cnpj: { ...(prev.cnpj || {}), numero: masked },
            }));

            // Limpa erro se CNPJ válido ou se ainda não tem 14 dígitos
            const digits = masked.replace(/\D/g, '');
            const hasFullLength = digits.length === 14;
            const isValid = isValidCNPJ(masked);

            if (!hasFullLength || isValid) {
                setErrors((prev) => ({ ...prev, ['cnpj.numero']: '' }));
            } else if (hasFullLength && !isValid) {
                setErrors((prev) => ({ ...prev, ['cnpj.numero']: 'CNPJ inválido' }));
            }
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

        // [E-MAIL] normaliza em tempo real e valida para limpar erro quando válido
        if (field === 'email') {
            const norm = normalizeEmail(value);
            setFormData((prev: any) => ({ ...prev, email: norm }));

            // Limpa erro se email válido ou vazio (validação obrigatória fica pro blur)
            if (!norm.trim() || isValidEmail(norm)) {
                setErrors((prev) => ({ ...prev, email: '' }));
            }
            return;
        }

        if (field === 'emailIndigo') {
            const norm = normalizeEmail(value);
            setFormData((prev: any) => ({ ...prev, emailIndigo: norm }));

            // Limpa erro se email válido ou vazio (validação obrigatória fica pro blur)
            if (!norm.trim() || isValidEmail(norm)) {
                setErrors((prev) => ({ ...prev, emailIndigo: '' }));
            }
            return;
        }

        // [PIX TIPO] - quando muda o tipo, limpa erro da chave e aplica máscara
        if (field === 'pixTipo') {
            setFormData((prev: any) => ({ ...prev, pixTipo: value, chavePix: '' }));
            // Limpa erros relacionados ao Pix quando troca o tipo
            setErrors((prev) => ({ ...prev, pixTipo: '', chavePix: '' }));
            return;
        }

        // [CHAVE PIX] - aplica máscara e valida em tempo real
        if (field === 'chavePix') {
            const tipo = formData.pixTipo;
            let maskedValue = value;

            // Aplica máscara baseada no tipo selecionado
            if (tipo) {
                maskedValue = maskPixKey(tipo, String(value ?? ''));
            }

            setFormData((prev: any) => ({ ...prev, chavePix: maskedValue }));

            // Validação em tempo real
            if (!tipo) {
                setErrors((prev) => ({ ...prev, chavePix: 'Selecione o tipo de chave primeiro' }));
            } else if (!maskedValue?.trim()) {
                setErrors((prev) => ({ ...prev, chavePix: '' })); // Limpa erro se campo vazio
            } else {
                const validation = validatePixKey(tipo, maskedValue);
                setErrors((prev) => ({
                    ...prev,
                    chavePix: validation.valid ? '' : validation.message || 'Chave inválida',
                }));
            }
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

        // Validação da chave Pix no blur
        if (field === 'chavePix') {
            const tipo = formData.pixTipo;
            const chave = formData.chavePix;

            if (!tipo) {
                setErrors((prev) => ({ ...prev, chavePix: 'Selecione o tipo de chave primeiro' }));
            } else if (!chave?.trim()) {
                setErrors((prev) => ({ ...prev, chavePix: 'Campo obrigatório' }));
            } else {
                const validation = validatePixKey(tipo, chave);
                setErrors((prev) => ({
                    ...prev,
                    chavePix: validation.valid ? '' : validation.message || 'Chave inválida',
                }));
            }
        }
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

                // Validação Pix: tipo e chave
                if (!formData.pixTipo?.trim()) {
                    newErrors.pixTipo = 'Selecione o tipo de chave Pix';
                } else if (!formData.chavePix?.trim()) {
                    newErrors.chavePix = 'Campo obrigatório';
                } else {
                    const pixValidation = validatePixKey(formData.pixTipo, formData.chavePix);
                    if (!pixValidation.valid) {
                        newErrors.chavePix = pixValidation.message || 'Chave Pix inválida';
                    }
                }

                // Validação dos valores por tipo de atividade
                if (!formData.valorSessaoConsultorio?.trim())
                    newErrors.valorSessaoConsultorio = 'Campo obrigatório';
                if (!formData.valorSessaoHomecare?.trim())
                    newErrors.valorSessaoHomecare = 'Campo obrigatório';
                if (!formData.valorHoraDesenvolvimentoMateriais?.trim())
                    newErrors.valorHoraDesenvolvimentoMateriais = 'Campo obrigatório';
                if (!formData.valorHoraSupervisaoRecebida?.trim())
                    newErrors.valorHoraSupervisaoRecebida = 'Campo obrigatório';
                if (!formData.valorHoraSupervisaoDada?.trim())
                    newErrors.valorHoraSupervisaoDada = 'Campo obrigatório';
                if (!formData.valorHoraReuniao?.trim())
                    newErrors.valorHoraReuniao = 'Campo obrigatório';
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
                        newErrors[`formacao.posGraduacoes.${idx}.instituicao`] = 'Campo obrigatório';
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

            if (payload.cpf) payload.cpf = onlyDigits(payload.cpf);
            if (payload.celular) payload.celular = String(payload.celular).replace(/\D/g, '');
            if (payload.telefone) payload.telefone = String(payload.telefone).replace(/\D/g, '');
            if (payload.cnpj?.numero) payload.cnpj.numero = onlyDigits(payload.cnpj.numero);
            if (payload.cnpj?.razaoSocial)
                payload.cnpj.razaoSocial = toTitleCaseSimple(payload.cnpj.razaoSocial);

            // Converter valores de moeda de string formatada para número
            if (payload.valorSessaoConsultorio)
                payload.valorSessaoConsultorio = parseCurrencyBR(payload.valorSessaoConsultorio).toString();
            if (payload.valorSessaoHomecare)
                payload.valorSessaoHomecare = parseCurrencyBR(payload.valorSessaoHomecare).toString();
            if (payload.valorHoraDesenvolvimentoMateriais)
                payload.valorHoraDesenvolvimentoMateriais = parseCurrencyBR(payload.valorHoraDesenvolvimentoMateriais).toString();
            if (payload.valorHoraSupervisaoRecebida)
                payload.valorHoraSupervisaoRecebida = parseCurrencyBR(payload.valorHoraSupervisaoRecebida).toString();
            if (payload.valorHoraSupervisaoDada)
                payload.valorHoraSupervisaoDada = parseCurrencyBR(payload.valorHoraSupervisaoDada).toString();
            if (payload.valorHoraReuniao)
                payload.valorHoraReuniao = parseCurrencyBR(payload.valorHoraReuniao).toString();

            const formDataUpload = new FormData();

            if (payload.arquivos?.fotoPerfil)
                formDataUpload.append('fotoPerfil', payload.arquivos?.fotoPerfil);
            if (payload.arquivos?.diplomaGraduacao)
                formDataUpload.append('diplomaGraduacao', payload.arquivos?.diplomaGraduacao);
            if (payload.arquivos?.diplomaPosGraduacao)
                formDataUpload.append('diplomaPosGraduacao', payload.arquivos?.diplomaPosGraduacao);
            if (payload.arquivos?.registroCRP)
                formDataUpload.append('registroCRP', payload.arquivos?.registroCRP);
            if (payload.arquivos?.comprovanteEndereco)
                formDataUpload.append('comprovanteEndereco', payload.arquivos?.comprovanteEndereco);

            // Guardar referências do arquivo "outros" antes de limpar
            const outrosFile = payload.arquivos?.outros;
            const outrosDescricao = payload.arquivos?.descricaoOutros;

            payload.arquivos = [];

            if(payload.cnpj.numero === null) delete payload.cnpj; 

            const result = await cadastrarTerapeuta(payload);

            if (!result.ok) {
                if (result.errors?.length) {
                    result.errors.forEach((e: any) =>
                        toast.error(`${e.path}: ${e.message}`)
                    );
                } else {
                    toast.error(result.message ?? 'Erro inesperado');
                }
                return;
            }

            formDataUpload.append('ownerType', 'terapeuta');
            formDataUpload.append('ownerId', result.id);
            formDataUpload.append('fullName', payload.nome);
            formDataUpload.append('birthDate', payload.dataNascimento);
            formDataUpload.append('cpf', payload.cpf);

            await fetch('/api/arquivos', {
                method: 'POST',
                body: formDataUpload,
            }).then((r) => r.json());

            // Upload separado para "outros" com descrição
            if (outrosFile && outrosFile instanceof File) {
                const outrosFormData = new FormData();
                outrosFormData.append('file', outrosFile);
                outrosFormData.append('documentType', 'outros');
                outrosFormData.append('ownerType', 'terapeuta');
                outrosFormData.append('ownerId', result.id);
                outrosFormData.append('fullName', payload.nome);
                outrosFormData.append('birthDate', payload.dataNascimento);
                if (outrosDescricao && typeof outrosDescricao === 'string') {
                    outrosFormData.append('descricao_documento', outrosDescricao);
                }
                await fetch('/api/arquivos', {
                    method: 'POST',
                    body: outrosFormData,
                }).then((r) => r.json());
            }

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

            console.log(payload);

            setTimeout(() => {
                navigate('/app/consultar/terapeutas');
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
        <div className="flex h-full gap-1">
            {/* Sidebar Vertical com Steps - Card Separado */}
            <div className="w-64 shrink-0" style={{ 
                backgroundColor: 'var(--header-bg)',
                borderRadius: '16px'
            }}>
                <VerticalStepSidebar
                    currentStep={currentStep}
                    totalSteps={STEPS.length}
                    steps={STEPS}
                    stepIcons={STEP_ICONS}
                    onStepClick={(step) => setCurrentStep(step)}
                />
            </div>

            {/* Card Principal com Formulário */}
            <div 
                className="flex-1 flex flex-col min-w-0 p-4"
                style={{ 
                    backgroundColor: 'var(--header-bg)',
                    borderRadius: '16px'
                }}
            >
                {/* Form Content */}
                <div className="flex-1 overflow-auto">
                    {renderCurrentStep()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4 border-t border-border">
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
        </div>
    );
}
