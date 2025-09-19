import { useState } from 'react';
import { CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Terapeuta } from '../types/cadastros.types';
import { maskCPF, isValidCPF, onlyDigits, isValidEmail, normalizeEmail } from '@/common/utils/mask';

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
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Partial<Terapeuta> & any>({
    // Dados pessoais
    nome: '',
    email: '',
    emailIndigo: '',
    telefone: '',
    celular: '',
    cpf: '',
    dataNascimento: '',
    possuiVeiculo: 'nao' as 'sim' | 'nao',
    placaVeiculo: '',
    modeloVeiculo: '',

    // Dados bancários
    banco: '',
    agencia: '',
    conta: '',
    chavePix: '',
    valorHoraAcordado: null,
    professorUnindigo: 'nao' as 'sim' | 'nao',
    disciplinaUniindigo: '',

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

    numeroConvenio: '',
    dataEntrada: '',
    dataSaida: '',
    crp: '',
    especialidades: [],
    dataInicio: '',
    dataFim: '',
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
      // novos (FRONT only)
      posGraduacoes: [],
      participacaoCongressosDescricao: '',
      publicacoesLivrosDescricao: '',
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

  const handleInputChange = (field: string, value: any) => {
    // [CPF] máscara + validação em tempo real
    if (field === 'cpf') {
      const masked = maskCPF(String(value ?? ''));
      setFormData((prev: any) => ({ ...prev, cpf: masked }));

      // mostra erro quando tiver 11 dígitos (14 chars com máscara) e for inválido
      const showError = masked.replace(/\D/g, '').length === 11 && !isValidCPF(masked);
      setErrors((prev) => ({ ...prev, cpf: showError ? 'CPF inválido' : '' }));
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
        setErrors((prev) => ({ ...prev, [field]: isValidEmail(v) ? '' : 'E-mail inválido' }));
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
          if (!formData.placaVeiculo?.trim()) newErrors.placaVeiculo = 'Campo obrigatório';
          if (!formData.modeloVeiculo?.trim()) newErrors.modeloVeiculo = 'Campo obrigatório';
        }

        if (!formData.banco?.trim()) newErrors.banco = 'Campo obrigatório';
        if (!formData.agencia?.trim()) newErrors.agencia = 'Campo obrigatório';
        if (!formData.conta?.trim()) newErrors.conta = 'Campo obrigatório';
        if (!formData.chavePix?.trim()) newErrors.chavePix = 'Campo obrigatório';
        break;

      case 2: // Endereço
        if (!formData.endereco?.cep?.trim()) newErrors['endereco.cep'] = 'Campo obrigatório';
        if (!formData.endereco?.rua?.trim()) newErrors['endereco.rua'] = 'Campo obrigatório';
        if (!formData.endereco?.numero?.trim()) newErrors['endereco.numero'] = 'Campo obrigatório';
        if (!formData.endereco?.bairro?.trim()) newErrors['endereco.bairro'] = 'Campo obrigatório';
        if (!formData.endereco?.cidade?.trim()) newErrors['endereco.cidade'] = 'Campo obrigatório';
        if (!formData.endereco?.estado?.trim()) newErrors['endereco.estado'] = 'Campo obrigatório';
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
          if (!pg?.tipo) newErrors[`formacao.posGraduacoes.${idx}.tipo`] = 'Campo obrigatório';
          if (!pg?.curso?.trim()) newErrors[`formacao.posGraduacoes.${idx}.curso`] = 'Campo obrigatório';
          if (!pg?.instituicao?.trim())
            newErrors[`formacao.posGraduacoes.${idx}.instituicao`] = 'Campo obrigatório';
          if (!pg?.conclusao?.trim())
            newErrors[`formacao.posGraduacoes.${idx}.conclusao`] = 'Campo obrigatório';
        });
        break;
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
      const { valorHoraAcordado, professorUnindigo, disciplinaUniindigo, ...rest } = formData;
      const payload = { ...rest } as typeof formData;

      // FRONT-only: não enviar campos novos de formação até o back aceitar
      if (payload.formacao) {
        const f: any = { ...payload.formacao };
        delete f.posGraduacoes;
        delete f.participacaoCongressosDescricao;
        delete f.publicacoesLivrosDescricao;
        payload.formacao = f; // TODO: enviar posGraduacoes/participacaoCongressosDescricao/publicacoesLivrosDescricao quando endpoint aceitar.
      }

      // limpar campos numéricos para a API
      if (payload.cpf) payload.cpf = onlyDigits(payload.cpf);
      if (payload.celular) payload.celular = String(payload.celular).replace(/\D/g, '');
      if (payload.telefone) payload.telefone = String(payload.telefone).replace(/\D/g, '');

      await cadastrarTerapeuta(payload);
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
    <div className="container mx-auto p-8">
      <CardHeader>
        <CardTitle className="text-2xl mb-8 text-primary">Cadastro de Terapeuta</CardTitle>
        <MultiStepProgress
          currentStep={currentStep}
          totalSteps={STEPS.length}
          steps={STEPS}
        />
      </CardHeader>
      <div>{renderCurrentStep()}</div>
      <div className="flex justify-between mt-8 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </Button>
        {currentStep === STEPS.length ? (
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2"
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
          <Button onClick={nextStep} className="flex items-center gap-2">
            Próximo <ChevronRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
