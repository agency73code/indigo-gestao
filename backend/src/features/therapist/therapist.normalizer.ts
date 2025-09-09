import {
  TerapeutaAtividade,
  TerapeutaPossuiVeiculo,
  type TerapeutaAreaAtuacao,
  type TerapeutaCargo,
  type TerapeutaEndereco,
  type Terapeuta,
  type Endereco,
  type TipoEndereco,
} from './therapist.types.js';

const TIPO_ENDERECO_MAP = {
  residencial: 1,
  institucional: 2,
  empresarial: 3,
} as const;

const AREA_MAP = {
  'Fonoaudiologia': 1,
  'Psicomotricidade': 2,
  'Fisioterapia': 3,
  'Terapia Ocupacional': 4,
  'Psicopedagogia': 5,
  'Educador Físico': 6,
  'Terapia ABA': 7,
  'Musicoterapia': 8,
  'Pedagogia': 9,
  'Neuropsicologia': 10,
} as const;

const CARGO_MAP = {
  'Acompanhante Terapeutico': 1,
  'Coordenador ABA': 2,
  'Supervisor ABA': 3,
  'Mediador de Conflitos': 4,
  'Coordenador Executivo': 5,
  'Professor UniIndigo': 6,
  'Terapeuta clinico': 7,
  'Terapeuta Supervisor': 8,
  'Gerente': 9,
} as const;

type AreaKey  = keyof typeof AREA_MAP;
type CargoKey = keyof typeof CARGO_MAP;

export interface FrontTerapeuta {
    nome: string;
    email: string;
    emailIndigo: string;
    telefone: string;
    celular: string;
    cpf: string;
    dataNascimento: string;
    possuiVeiculo: 'sim' | 'nao';
    placaVeiculo?: string;
    modeloVeiculo?: string;

    // Dados bancários
    banco: string;
    agencia: string;
    conta: string;
    chavePix: string;

    // Endereço pessoal
    endereco: {
        cep: string;
        rua: string;
        numero: string;
        complemento?: string;
        bairro: string;
        cidade: string;
        estado: string;
    };

    // Dados profissionais
    dadosProfissionais: Array<{
        areaAtuacao: AreaKey;
        cargo: CargoKey;
        numeroConselho?: string;
    }>;
    numeroConvenio?: string;
    dataEntrada: string;
    dataSaida?: string;
    crp: string;
    especialidades: string[];
    dataInicio: string;
    dataFim?: string;
    valorConsulta: string;
    formasAtendimento: string[];

    // Formação
    formacao: {
        graduacao: string;
        instituicaoGraduacao: string;
        anoFormatura: string;
        posGraduacao?: string;
        instituicaoPosGraduacao?: string;
        anoPosGraduacao?: string;
        cursos?: string;
    };

    // Arquivos
    arquivos: {
        fotoPerfil?: File | string;
        diplomaGraduacao?: File | string;
        diplomaPosGraduacao?: File | string;
        registroCRP?: File | string;
        comprovanteEndereco?: File | string;
    };

    // Dados CNPJ (opcional)
    cnpj?: {
        numero: string;
        razaoSocial: string;
        nomeFantasia: string;
        endereco: {
            cep: string;
            rua: string;
            numero: string;
            complemento?: string;
            bairro: string;
            cidade: string;
            estado: string;
        };
    };
}

export interface TherapistCreateData extends Omit<
  Terapeuta,
  'id' | 'documentos_terapeuta' | 'terapeuta_area_atuacao' |
  'terapeuta_cargo' | 'terapeuta_endereco' | 'criado_em' | 'atualizado_em'
> {
  documentos_terapeuta: never[];
  terapeuta_area_atuacao: TerapeutaAreaAtuacao[];
  terapeuta_cargo: TerapeutaCargo[];
  terapeuta_endereco: TerapeutaEndereco[];
}

export async function normalizer(input: FrontTerapeuta): Promise<TherapistCreateData> {
  const enderecoPrincipal: Endereco = {
    id: 0,
    cep: input.endereco.cep,
    logradouro: input.endereco.rua,
    numero: input.endereco.numero,
    bairro: input.endereco.bairro,
    cidade: input.endereco.cidade,
    uf: input.endereco.estado,
    complemento: input.endereco.complemento ?? null,
    criado_em: new Date(),
    atualizado_em: new Date(),
  };

  const tipoEndereco: TipoEndereco = { 
    id: TIPO_ENDERECO_MAP.residencial,
    tipo: 'pessoal',
  };

  const areaAtuacao: TerapeutaAreaAtuacao[] = input.dadosProfissionais.map(
    (dp) => ({
      terapeuta_id: '',
      area_atuacao_id: AREA_MAP[dp.areaAtuacao],
      area_atuacao: {
        id: AREA_MAP[dp.areaAtuacao],
        nome: dp.areaAtuacao,
      },
    }),
  );

  const cargos: TerapeutaCargo[] = input.dadosProfissionais.map((dp) => ({
    terapeuta_id: '',
    cargo_id: CARGO_MAP[dp.cargo],
    numero_conselho: dp.numeroConselho ?? null,
    data_entrada: new Date(input.dataInicio),
    data_saida: input.dataSaida ? new Date(input.dataSaida) : null,
    cargo: { id: CARGO_MAP[dp.cargo], nome: dp.cargo },
  }));

  const enderecos: TerapeutaEndereco[] = [
    {
      id: 0,
      terapeuta_id: '',
      endereco_id: 0,
      tipo_endereco_id: tipoEndereco.id,
      principal: 1,
      criado_em: new Date(),
      atualizado_em: new Date(),
      endereco: enderecoPrincipal,
      tipo_endereco: tipoEndereco,
    },
  ];

  if (input.cnpj?.endereco) {
    const enderecoCnpj: Endereco = {
      id: 0,
      cep: input.cnpj.endereco.cep,
      logradouro: input.cnpj.endereco.rua,
      numero: input.cnpj.endereco.numero,
      bairro: input.cnpj.endereco.bairro,
      cidade: input.cnpj.endereco.cidade,
      uf: input.cnpj.endereco.estado,
      complemento: input.cnpj.endereco.complemento ?? null,
      criado_em: new Date(),
      atualizado_em: new Date(),
    };
  

    const tipoEnderecoCnpj: TipoEndereco = {
      id: TIPO_ENDERECO_MAP.empresarial,
      tipo: 'empresarial',
    };

    enderecos.push({
        id: 0,
        terapeuta_id: '',
        endereco_id: 0,
        tipo_endereco_id: tipoEnderecoCnpj.id,
        principal: 0,
        criado_em: new Date(),
        atualizado_em: new Date(),
        endereco: enderecoCnpj,
        tipo_endereco: tipoEnderecoCnpj,
    });
  }


  return {
    nome: input.nome,
    cpf: input.cpf,
    data_nascimento: new Date(input.dataNascimento),
    telefone: input.telefone || null,
    celular: input.celular,
    foto_perfil: typeof input.arquivos.fotoPerfil === 'string'
      ? input.arquivos.fotoPerfil
      : null,
    email: input.email,
    email_indigo: input.emailIndigo,
    possui_veiculo:
      input.possuiVeiculo === 'sim'
        ? TerapeutaPossuiVeiculo.Sim
        : TerapeutaPossuiVeiculo.Nao,
    placa_veiculo: input.placaVeiculo ?? null,
    modelo_veiculo: input.modeloVeiculo ?? null,

    banco: input.banco,
    agencia: input.agencia,
    conta: input.conta,
    chave_pix: input.chavePix || null,

    cnpj_empresa: input.cnpj?.numero ?? null,
    razao_social: input.cnpj?.razaoSocial ?? null,

    graduacao: input.formacao.graduacao,
    grad_instituicao: input.formacao.instituicaoGraduacao,
    ano_formatura: input.formacao.anoFormatura,
    pos_graduacao: input.formacao.posGraduacao ?? null,
    pos_grad_instituicao: input.formacao.instituicaoPosGraduacao ?? null,
    ano_pos_graduacao: input.formacao.anoPosGraduacao ?? null,
    cursos: input.formacao.cursos ?? null,

    data_entrada: new Date(input.dataInicio),
    data_saida: input.dataSaida ? new Date(input.dataSaida) : null,
    perfil_acesso: 'terapeuta',
    atividade: TerapeutaAtividade.Ativo,
    senha: null,
    token_redefinicao: null,
    validade_token: null,

    documentos_terapeuta: [],
    terapeuta_area_atuacao: areaAtuacao,
    terapeuta_cargo: cargos,
    terapeuta_endereco: enderecos,
  };
}
