import type { SavedReport, Paciente, Terapeuta } from '../types';

// Mock de pacientes - estrutura completa como no sistema real
export const mockPatients: Paciente[] = [
  {
    id: 'pac_001',
    nome: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    telefone: '(11) 9876-5432',
    dataNascimento: '1993-03-15', // 32 anos
    cpf: '123.456.789-01',
    endereco: {
      cep: '01310-100',
      rua: 'Av. Paulista',
      numero: '1000',
      complemento: 'Apto 101',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'José Silva',
      telefone: '(11) 9876-5432',
      email: 'jose.silva@email.com',
      parentesco: 'Pai'
    },
    observacoes: 'Cliente assíduo e participativo'
  },
  {
    id: 'pac_002',
    nome: 'João Pedro Oliveira',
    email: 'joao.pedro@email.com',
    telefone: '(11) 8765-4321',
    dataNascimento: '2008-07-22', // 17 anos
    cpf: '987.654.321-09',
    endereco: {
      cep: '04567-890',
      rua: 'Rua das Flores',
      numero: '250',
      bairro: 'Vila Madalena',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'Ana Oliveira',
      telefone: '(11) 8765-4321',
      email: 'ana.oliveira@email.com',
      parentesco: 'Mãe'
    },
    observacoes: 'Acompanhamento semanal'
  },
  {
    id: 'pac_003',
    nome: 'Ana Carolina Souza',
    email: 'ana.souza@email.com',
    telefone: '(11) 7654-3210',
    dataNascimento: '2012-11-08', // 13 anos
    cpf: '456.789.123-45',
    endereco: {
      cep: '02345-678',
      rua: 'Rua do Sol',
      numero: '180',
      bairro: 'Santana',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    responsavel: {
      nome: 'Carlos Souza',
      telefone: '(11) 7654-3210',
      email: 'carlos.souza@email.com',
      parentesco: 'Pai'
    }
  },
];

// Mock de terapeutas - estrutura completa como no sistema real
export const mockTherapists: Terapeuta[] = [
  {
    id: 'ter_001',
    nome: 'Dra. Ana Costa',
    email: 'ana.costa@indigo.com.br',
    emailIndigo: 'ana.costa@indigo.com.br',
    telefone: '(11) 9999-1111',
    celular: '(11) 9999-1111',
    cpf: '111.222.333-44',
    dataNascimento: '1985-04-12',
    possuiVeiculo: 'sim',
    banco: 'Banco do Brasil',
    agencia: '1234-5',
    conta: '67890-1',
    chavePix: 'ana.costa@indigo.com.br',
    valorHoraAcordado: 120,
    professorUnindigo: 'nao',
    endereco: {
      cep: '01234-567',
      rua: 'Rua dos Terapeutas',
      numero: '100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Análise do Comportamento',
      cargo: 'Psicóloga',
      numeroConselho: 'CRP 06/123456'
    }],
    dataInicio: '2022-01-15',
    formacao: {
      graduacao: 'Psicologia',
      instituicaoGraduacao: 'USP',
      anoFormatura: '2008'
    },
    arquivos: {}
  },
  {
    id: 'ter_002',
    nome: 'Dr. João Santos',
    email: 'joao.santos@indigo.com.br',
    emailIndigo: 'joao.santos@indigo.com.br',
    telefone: '(11) 8888-2222',
    celular: '(11) 8888-2222',
    cpf: '222.333.444-55',
    dataNascimento: '1980-08-25',
    possuiVeiculo: 'sim',
    banco: 'Itaú',
    agencia: '5678-9',
    conta: '12345-6',
    chavePix: '(11) 8888-2222',
    valorHoraAcordado: 110,
    professorUnindigo: 'sim',
    endereco: {
      cep: '02345-678',
      rua: 'Av. dos Profissionais',
      numero: '200',
      bairro: 'Vila Nova',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Terapia Ocupacional',
      cargo: 'Terapeuta Ocupacional',
      numeroConselho: 'CREFITO 3/123456'
    }],
    dataInicio: '2021-03-10',
    formacao: {
      graduacao: 'Terapia Ocupacional',
      instituicaoGraduacao: 'UNIFESP',
      anoFormatura: '2005'
    },
    arquivos: {}
  },
  {
    id: 'ter_003',
    nome: 'Dra. Carla Mendes',
    email: 'carla.mendes@indigo.com.br',
    emailIndigo: 'carla.mendes@indigo.com.br',
    telefone: '(11) 7777-3333',
    celular: '(11) 7777-3333',
    cpf: '333.444.555-66',
    dataNascimento: '1990-12-05',
    possuiVeiculo: 'nao',
    banco: 'Santander',
    agencia: '9012-3',
    conta: '45678-9',
    chavePix: 'carla.mendes@indigo.com.br',
    valorHoraAcordado: 115,
    professorUnindigo: 'nao',
    endereco: {
      cep: '03456-789',
      rua: 'Rua das Palmeiras',
      numero: '300',
      bairro: 'Mooca',
      cidade: 'São Paulo',
      estado: 'SP'
    },
    dadosProfissionais: [{
      areaAtuacao: 'Fonoaudiologia',
      cargo: 'Fonoaudióloga',
      numeroConselho: 'CRFa 2/123456'
    }],
    dataInicio: '2023-06-01',
    formacao: {
      graduacao: 'Fonoaudiologia',
      instituicaoGraduacao: 'PUC-SP',
      anoFormatura: '2013'
    },
    arquivos: {}
  },
];

// Mock de relatórios salvos
export const mockReports: SavedReport[] = [
  {
    id: 'report_001',
    title: 'Relatório Mensal - Janeiro 2025 - Maria Silva',
    type: 'mensal',
    patientId: 'pac_001',
    therapistId: 'ter_001',
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
    createdAt: '2025-01-31T14:30:00.000Z',
    updatedAt: '2025-01-31T14:30:00.000Z',
    filters: {
      pacienteId: 'pac_001',
      periodo: {
        mode: '30d',
        start: '2025-01-01',
        end: '2025-01-31',
      },
    },
    clinicalObservations: `
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Resumo do Período</h3>
        <p>Cliente apresentou <strong>evolução significativa</strong> no período de janeiro/2025. Foi observada uma redução de aproximadamente <strong>40% nos comportamentos desafiadores</strong> quando comparado ao mês anterior.</p>
        
        <h3 class="text-lg font-semibold">Desenvolvimento de Habilidades</h3>
        <p>Houve um aumento de <strong>65% na independência</strong> para tarefas de rotina diária, especialmente em:</p>
        <ul class="list-disc pl-6 space-y-1">
          <li>Higiene pessoal (escovação de dentes e lavagem de mãos)</li>
          <li>Organização de materiais escolares</li>
          <li>Seguimento de rotinas visuais</li>
        </ul>
        
        <h3 class="text-lg font-semibold">Aspectos Comportamentais</h3>
        <p>A paciente demonstrou <strong>melhora na regulação emocional</strong>, com diminuição significativa de episódios de frustração durante atividades desafiadoras. Utilização de estratégias de respiração e comunicação alternativa mostraram-se eficazes.</p>
        
        <h3 class="text-lg font-semibold">Interação Social</h3>
        <p>Progressos notáveis na <strong>interação com pares</strong> durante atividades em grupo. Maria iniciou contato visual espontâneo em 75% das oportunidades e respondeu adequadamente a comandos sociais simples.</p>
        
        <h3 class="text-lg font-semibold">Recomendações</h3>
        <ul class="list-disc pl-6 space-y-1">
          <li>Manter rotina estruturada com apoios visuais</li>
          <li>Intensificar trabalho com habilidades de autocuidado</li>
          <li>Incluir mais atividades de integração sensorial</li>
          <li>Reunião familiar agendada para 15/02 para alinhamento de estratégias no ambiente domiciliar</li>
        </ul>
        
        <h3 class="text-lg font-semibold">Observações Finais</h3>
        <p>O progresso observado está <strong>acima das expectativas iniciais</strong> para o período. A família tem se mostrado engajada e aplicando as orientações em casa, o que contribui significativamente para a generalização das habilidades adquiridas.</p>
      </div>
    `,
    generatedData: {
      kpis: {
        acerto: 78.5,
        independencia: 62.3,
        tentativas: 450,
        sessoes: 18,
        assiduidade: 94.7,
        gapIndependencia: 16.2,
      },
      graphic: [
        { x: '2025-01-01', acerto: 65, independencia: 45 },
        { x: '2025-01-05', acerto: 68, independencia: 48 },
        { x: '2025-01-08', acerto: 70, independencia: 52 },
        { x: '2025-01-12', acerto: 72, independencia: 55 },
        { x: '2025-01-15', acerto: 75, independencia: 58 },
        { x: '2025-01-19', acerto: 77, independencia: 60 },
        { x: '2025-01-22', acerto: 80, independencia: 63 },
        { x: '2025-01-26', acerto: 82, independencia: 65 },
        { x: '2025-01-29', acerto: 85, independencia: 68 },
      ],
      programDeadline: {
        percent: 65,
        label: '65% concluído',
        inicio: '2024-10-01',
        fim: '2025-03-31',
      },
    },
    status: 'final',
    pdfUrl: 'https://drive.google.com/file/d/1ABC123/view',
    pdfFilename: 'relatorio_maria_silva_jan2025.pdf',
  },
  {
    id: 'report_002',
    title: 'Relatório Trimestral - Q4 2024 - Maria Silva',
    type: 'trimestral',
    patientId: 'pac_001',
    therapistId: 'ter_001',
    periodStart: '2024-10-01',
    periodEnd: '2024-12-31',
    createdAt: '2024-12-31T10:00:00.000Z',
    updatedAt: '2024-12-31T10:00:00.000Z',
    filters: {
      pacienteId: 'pac_001',
      periodo: {
        mode: '90d',
        start: '2024-10-01',
        end: '2024-12-31',
      },
    },
    clinicalObservations: `
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Período de Adaptação</h3>
        <p>Trimestre marcado pela adaptação inicial ao programa de intervenção. Cliente demonstrou <strong>boa receptividade</strong> às atividades propostas e estabeleceu vínculo positivo com a terapeuta.</p>
        
        <h3 class="text-lg font-semibold">Marcos Alcançados</h3>
        <ul class="list-disc pl-6 space-y-1">
          <li>Estabelecimento de rotina terapêutica estruturada</li>
          <li>Identificação de reforçadores eficazes</li>
          <li>Baseline de habilidades iniciais completado</li>
          <li>Engajamento familiar alcançado</li>
        </ul>
      </div>
    `,
    generatedData: {
      kpis: {
        acerto: 72.0,
        independencia: 55.0,
        tentativas: 1250,
        sessoes: 50,
        assiduidade: 92.0,
        gapIndependencia: 17.0,
      },
      graphic: [
        { x: 'Out/24', acerto: 60, independencia: 40 },
        { x: 'Nov/24', acerto: 70, independencia: 50 },
        { x: 'Dez/24', acerto: 75, independencia: 60 },
      ],
    },
    status: 'final',
    pdfUrl: 'https://drive.google.com/file/d/1DEF456/view',
    pdfFilename: 'relatorio_maria_silva_q4_2024.pdf',
  },
  {
    id: 'report_003',
    title: 'Relatório Semanal - Semana 4 - João Santos',
    type: 'custom',
    patientId: 'pac_002',
    therapistId: 'ter_002',
    periodStart: '2025-01-20',
    periodEnd: '2025-01-26',
    createdAt: '2025-01-26T16:45:00.000Z',
    updatedAt: '2025-01-26T16:45:00.000Z',
    filters: {
      pacienteId: 'pac_002',
      periodo: {
        mode: 'custom',
        start: '2025-01-20',
        end: '2025-01-26',
      },
    },
    clinicalObservations: `
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Semana Produtiva</h3>
        <p>Cliente apresentou <strong>melhoria na concentração</strong> durante as atividades, mantendo-se engajado por períodos mais prolongados (até 15 minutos em atividades estruturadas).</p>
        
        <h3 class="text-lg font-semibold">Destaques da Semana</h3>
        <ul class="list-disc pl-6 space-y-1">
          <li>100% de presença nas sessões agendadas</li>
          <li>Resposta positiva a novos estímulos visuais</li>
          <li>Iniciativa em solicitar ajuda quando necessário</li>
        </ul>
        
        <h3 class="text-lg font-semibold">Próximos Passos</h3>
        <p>Manter intensidade das intervenções e iniciar trabalho com generalização de habilidades para ambiente escolar.</p>
      </div>
    `,
    generatedData: {
      kpis: {
        acerto: 82.0,
        independencia: 70.0,
        tentativas: 95,
        sessoes: 4,
        assiduidade: 100.0,
        gapIndependencia: 12.0,
      },
      graphic: [
        { x: '20/01', acerto: 78, independencia: 65 },
        { x: '22/01', acerto: 80, independencia: 68 },
        { x: '24/01', acerto: 83, independencia: 72 },
        { x: '26/01', acerto: 85, independencia: 75 },
      ],
    },
    status: 'final',
  },
  {
    id: 'report_004',
    title: 'Relatório Mensal - Dezembro 2024 - Pedro Oliveira',
    type: 'mensal',
    patientId: 'pac_003',
    therapistId: 'ter_003',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-31',
    createdAt: '2024-12-31T18:00:00.000Z',
    updatedAt: '2024-12-31T18:00:00.000Z',
    filters: {
      pacienteId: 'pac_003',
      periodo: {
        mode: '30d',
        start: '2024-12-01',
        end: '2024-12-31',
      },
    },
    clinicalObservations: `
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Impacto das Férias Escolares</h3>
        <p>O mês de dezembro foi marcado pelas <strong>férias escolares</strong>, o que impactou a frequência nas sessões terapêuticas. Observou-se uma taxa de assiduidade de 75%, abaixo da média habitual do cliente.</p>
        
        <h3 class="text-lg font-semibold">Desempenho nas Sessões Realizadas</h3>
        <p>Apesar da redução no número de sessões, Pedro manteve <strong>desempenho estável</strong> nas habilidades já adquiridas, demonstrando boa retenção do aprendizado.</p>
        
        <h3 class="text-lg font-semibold">Planejamento para Janeiro</h3>
        <ul class="list-disc pl-6 space-y-1">
          <li>Retomada da frequência regular (3x por semana)</li>
          <li>Intensificação do trabalho com comunicação funcional</li>
          <li>Inclusão de atividades recreativas estruturadas</li>
        </ul>
      </div>
    `,
    generatedData: {
      kpis: {
        acerto: 68.0,
        independencia: 50.0,
        tentativas: 320,
        sessoes: 12,
        assiduidade: 75.0,
        gapIndependencia: 18.0,
      },
      graphic: [
        { x: '01/12', acerto: 70, independencia: 55 },
        { x: '08/12', acerto: 68, independencia: 52 },
        { x: '15/12', acerto: 65, independencia: 48 },
        { x: '22/12', acerto: 70, independencia: 50 },
      ],
    },
    status: 'final',
    pdfUrl: 'https://drive.google.com/file/d/1GHI789/view',
    pdfFilename: 'relatorio_pedro_oliveira_dez2024.pdf',
  },
  {
    id: 'report_005',
    title: 'Relatório Mensal - Janeiro 2025 - João Santos',
    type: 'mensal',
    patientId: 'pac_002',
    therapistId: 'ter_002',
    periodStart: '2025-01-01',
    periodEnd: '2025-01-31',
    createdAt: '2025-01-31T09:15:00.000Z',
    updatedAt: '2025-01-31T09:15:00.000Z',
    filters: {
      pacienteId: 'pac_002',
      periodo: {
        mode: '30d',
        start: '2025-01-01',
        end: '2025-01-31',
      },
    },
    clinicalObservations: `
      <div class="space-y-4">
        <h3 class="text-lg font-semibold">Excelente Progresso</h3>
        <p>João apresentou um dos melhores desempenhos desde o início do programa. <strong>100% de presença</strong> em todas as sessões agendadas e demonstrou <strong>alto engajamento</strong> nas atividades propostas.</p>
        
        <h3 class="text-lg font-semibold">Habilidades Desenvolvidas</h3>
        <ul class="list-disc pl-6 space-y-1">
          <li>Melhoria significativa na comunicação verbal (aumento de 45% em vocalizações funcionais)</li>
          <li>Redução de comportamentos estereotipados em ambientes sociais</li>
          <li>Iniciativa própria para solicitar pausas quando necessário</li>
          <li>Compartilhamento espontâneo de brinquedos com pares</li>
        </ul>
        
        <h3 class="text-lg font-semibold">Feedback Familiar</h3>
        <p>A família relatou <strong>generalização das habilidades</strong> adquiridas para o ambiente domiciliar. João tem demonstrado maior autonomia em atividades como vestir-se e alimentar-se.</p>
      </div>
    `,
    generatedData: {
      kpis: {
        acerto: 85.3,
        independencia: 73.2,
        tentativas: 520,
        sessoes: 20,
        assiduidade: 100.0,
        gapIndependencia: 12.1,
      },
      graphic: [
        { x: '2025-01-03', acerto: 78, independencia: 65 },
        { x: '2025-01-07', acerto: 80, independencia: 68 },
        { x: '2025-01-10', acerto: 82, independencia: 70 },
        { x: '2025-01-14', acerto: 84, independencia: 72 },
        { x: '2025-01-17', acerto: 85, independencia: 73 },
        { x: '2025-01-21', acerto: 86, independencia: 74 },
        { x: '2025-01-24', acerto: 87, independencia: 75 },
        { x: '2025-01-28', acerto: 88, independencia: 76 },
      ],
      programDeadline: {
        percent: 72,
        label: '72% concluído',
        inicio: '2024-08-01',
        fim: '2025-04-30',
      },
    },
    status: 'final',
    pdfUrl: 'https://drive.google.com/file/d/1JKL012/view',
    pdfFilename: 'relatorio_joao_santos_jan2025.pdf',
  },
];
