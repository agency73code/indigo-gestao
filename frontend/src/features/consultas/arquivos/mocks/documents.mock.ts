// Configuração do mock - altere para false quando quiser usar a API real
export const MOCK_ENABLED = false;

// Tipos para mock
export interface MockDocument {
  id: string;
  tipo_documento: string;
  nome: string;
  tamanho: number;
  tipo_conteudo: string;
  data_envio: string;
  descricao_documento?: string;
}

// Mock de documentos para visualização
export const MOCK_DOCUMENTS: Record<string, Record<string, MockDocument[]>> = {
  cliente: {
    '1': [
      {
        id: 'doc-cliente-1',
        tipo_documento: 'fotoPerfil',
        nome: 'foto_perfil_joao.jpg',
        tamanho: 2048576, // 2MB
        tipo_conteudo: 'image/jpeg',
        data_envio: '2024-10-01T10:30:00Z'
      },
      {
        id: 'doc-cliente-2',
        tipo_documento: 'documentoIdentidade',
        nome: 'rg_joao_silva.pdf',
        tamanho: 1024768, // 1MB
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-10-02T14:15:00Z'
      },
      {
        id: 'doc-cliente-3',
        tipo_documento: 'comprovanteCpf',
        nome: 'cpf_joao.pdf',
        tamanho: 512384, // 500KB
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-10-03T09:45:00Z'
      },
      {
        id: 'doc-cliente-4',
        tipo_documento: 'comprovanteResidencia',
        nome: 'conta_luz_outubro.pdf',
        tamanho: 768512, // 750KB
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-10-04T16:20:00Z'
      },
      {
        id: 'doc-cliente-5',
        tipo_documento: 'carterinhaPlano',
        nome: 'carteirinha_unimed.jpg',
        tamanho: 1536000, // 1.5MB
        tipo_conteudo: 'image/jpeg',
        data_envio: '2024-10-05T11:10:00Z'
      }
    ],
    '2': [
      {
        id: 'doc-cliente2-1',
        tipo_documento: 'fotoPerfil',
        nome: 'foto_perfil_maria.jpg',
        tamanho: 1024000,
        tipo_conteudo: 'image/jpeg',
        data_envio: '2024-09-28T08:15:00Z'
      },
      {
        id: 'doc-cliente2-2',
        tipo_documento: 'relatoriosMedicos',
        nome: 'relatorio_pediatra.pdf',
        tamanho: 2048000,
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-09-29T10:30:00Z'
      }
    ],
    // ID genérico para capturar outros clientes
    'default': [
      {
        id: 'doc-cliente-default-1',
        tipo_documento: 'fotoPerfil',
        nome: 'foto_perfil_cliente.jpg',
        tamanho: 1100000,
        tipo_conteudo: 'image/jpeg',
        data_envio: '2024-10-01T09:00:00Z'
      },
      {
        id: 'doc-cliente-default-2',
        tipo_documento: 'documentoIdentidade',
        nome: 'documento_identidade.pdf',
        tamanho: 900000,
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-10-02T10:00:00Z'
      }
    ]
  },
  terapeuta: {
    '1': [
      {
        id: 'doc-terapeuta-1',
        tipo_documento: 'fotoPerfil',
        nome: 'foto_perfil_maria.jpg',
        tamanho: 1872896, // 1.8MB
        tipo_conteudo: 'image/jpeg',
        data_envio: '2024-09-15T08:30:00Z'
      },
      {
        id: 'doc-terapeuta-2',
        tipo_documento: 'diplomaGraduacao',
        nome: 'diploma_psicologia_ufpe.pdf',
        tamanho: 3145728, // 3MB
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-09-16T14:45:00Z'
      },
      {
        id: 'doc-terapeuta-3',
        tipo_documento: 'diplomaPosGraduacao',
        nome: 'pos_graduacao_terapia_cognitiva.pdf',
        tamanho: 2621440, // 2.5MB
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-09-17T10:15:00Z'
      },
      {
        id: 'doc-terapeuta-4',
        tipo_documento: 'registroCRP',
        nome: 'registro_crp_maria_santos.pdf',
        tamanho: 1048576, // 1MB
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-09-18T16:30:00Z'
      },
      {
        id: 'doc-terapeuta-5',
        tipo_documento: 'comprovanteEndereco',
        nome: 'conta_energia_setembro.pdf',
        tamanho: 692736, // 676KB
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-09-19T12:00:00Z'
      }
    ],
    '2': [
      {
        id: 'doc-terapeuta2-1',
        tipo_documento: 'fotoPerfil',
        nome: 'foto_perfil_carlos.jpg',
        tamanho: 1500000,
        tipo_conteudo: 'image/jpeg',
        data_envio: '2024-08-20T09:00:00Z'
      },
      {
        id: 'doc-terapeuta2-2',
        tipo_documento: 'diplomaGraduacao',
        nome: 'diploma_fisioterapia_usp.pdf',
        tamanho: 2800000,
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-08-21T14:30:00Z'
      }
    ],
    // ID genérico para capturar outros terapeutas
    'default': [
      {
        id: 'doc-terapeuta-default-1',
        tipo_documento: 'fotoPerfil',
        nome: 'foto_perfil_generico.jpg',
        tamanho: 1200000,
        tipo_conteudo: 'image/jpeg',
        data_envio: '2024-10-01T10:00:00Z'
      },
      {
        id: 'doc-terapeuta-default-2',
        tipo_documento: 'diplomaGraduacao',
        nome: 'diploma_generico.pdf',
        tamanho: 2000000,
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-10-02T11:00:00Z'
      },
      {
        id: 'doc-terapeuta-default-3',
        tipo_documento: 'registroCRP',
        nome: 'crp_generico.pdf',
        tamanho: 800000,
        tipo_conteudo: 'application/pdf',
        data_envio: '2024-10-03T12:00:00Z'
      }
    ]
  }
};

// URLs de exemplo para visualização (substituir por URLs reais da API)
export const MOCK_VIEW_URLS: Record<string, string> = {
  // Cliente ID 1
  'doc-cliente-1': 'https://via.placeholder.com/400x300/4CAF50/white?text=Foto+Perfil+João',
  'doc-cliente-2': 'https://via.placeholder.com/600x800/2196F3/white?text=RG+João+Silva',
  'doc-cliente-3': 'https://via.placeholder.com/600x800/FF9800/white?text=CPF+João',
  'doc-cliente-4': 'https://via.placeholder.com/600x800/9C27B0/white?text=Comprovante+Residência',
  'doc-cliente-5': 'https://via.placeholder.com/400x250/E91E63/white?text=Carteirinha+Unimed',
  
  // Cliente ID 2
  'doc-cliente2-1': 'https://via.placeholder.com/400x300/8BC34A/white?text=Foto+Perfil+Maria',
  'doc-cliente2-2': 'https://via.placeholder.com/600x800/3F51B5/white?text=Relatório+Médico',
  
  // Terapeuta ID 1
  'doc-terapeuta-1': 'https://via.placeholder.com/400x300/4CAF50/white?text=Foto+Perfil+Ana',
  'doc-terapeuta-2': 'https://via.placeholder.com/600x800/2196F3/white?text=Diploma+Psicologia',
  'doc-terapeuta-3': 'https://via.placeholder.com/600x800/FF5722/white?text=Pós+Graduação',
  'doc-terapeuta-4': 'https://via.placeholder.com/600x800/795548/white?text=Registro+CRP',
  'doc-terapeuta-5': 'https://via.placeholder.com/600x800/607D8B/white?text=Comprovante+Endereço',
  
  // Terapeuta ID 2
  'doc-terapeuta2-1': 'https://via.placeholder.com/400x300/FFC107/white?text=Foto+Perfil+Carlos',
  'doc-terapeuta2-2': 'https://via.placeholder.com/600x800/E91E63/white?text=Diploma+Fisioterapia'
};