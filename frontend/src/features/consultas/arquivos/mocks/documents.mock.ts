// Configuração do mock - altere para false quando quiser usar a API real
export const MOCK_ENABLED = true;

// Tipos para mock
export interface MockDocument {
  id: string;
  tipo_documento: string;
  name: string;
  size: number;
  contentType: string;
  uploadedAt: string;
}

// Mock de documentos para visualização
export const MOCK_DOCUMENTS: Record<string, Record<string, MockDocument[]>> = {
  cliente: {
    '1': [
      {
        id: 'doc-cliente-1',
        tipo_documento: 'fotoPerfil',
        name: 'foto_perfil_joao.jpg',
        size: 2048576, // 2MB
        contentType: 'image/jpeg',
        uploadedAt: '2024-10-01T10:30:00Z'
      },
      {
        id: 'doc-cliente-2',
        tipo_documento: 'documentoIdentidade',
        name: 'rg_joao_silva.pdf',
        size: 1024768, // 1MB
        contentType: 'application/pdf',
        uploadedAt: '2024-10-02T14:15:00Z'
      },
      {
        id: 'doc-cliente-3',
        tipo_documento: 'comprovanteCpf',
        name: 'cpf_joao.pdf',
        size: 512384, // 500KB
        contentType: 'application/pdf',
        uploadedAt: '2024-10-03T09:45:00Z'
      },
      {
        id: 'doc-cliente-4',
        tipo_documento: 'comprovanteResidencia',
        name: 'conta_luz_outubro.pdf',
        size: 768512, // 750KB
        contentType: 'application/pdf',
        uploadedAt: '2024-10-04T16:20:00Z'
      },
      {
        id: 'doc-cliente-5',
        tipo_documento: 'carterinhaPlano',
        name: 'carteirinha_unimed.jpg',
        size: 1536000, // 1.5MB
        contentType: 'image/jpeg',
        uploadedAt: '2024-10-05T11:10:00Z'
      }
    ],
    '2': [
      {
        id: 'doc-cliente2-1',
        tipo_documento: 'fotoPerfil',
        name: 'foto_perfil_maria.jpg',
        size: 1024000,
        contentType: 'image/jpeg',
        uploadedAt: '2024-09-28T08:15:00Z'
      },
      {
        id: 'doc-cliente2-2',
        tipo_documento: 'relatoriosMedicos',
        name: 'relatorio_pediatra.pdf',
        size: 2048000,
        contentType: 'application/pdf',
        uploadedAt: '2024-09-29T10:30:00Z'
      }
    ],
    // ID genérico para capturar outros clientes
    'default': [
      {
        id: 'doc-cliente-default-1',
        tipo_documento: 'fotoPerfil',
        name: 'foto_perfil_cliente.jpg',
        size: 1100000,
        contentType: 'image/jpeg',
        uploadedAt: '2024-10-01T09:00:00Z'
      },
      {
        id: 'doc-cliente-default-2',
        tipo_documento: 'documentoIdentidade',
        name: 'documento_identidade.pdf',
        size: 900000,
        contentType: 'application/pdf',
        uploadedAt: '2024-10-02T10:00:00Z'
      }
    ]
  },
  terapeuta: {
    '1': [
      {
        id: 'doc-terapeuta-1',
        tipo_documento: 'fotoPerfil',
        name: 'foto_perfil_maria.jpg',
        size: 1872896, // 1.8MB
        contentType: 'image/jpeg',
        uploadedAt: '2024-09-15T08:30:00Z'
      },
      {
        id: 'doc-terapeuta-2',
        tipo_documento: 'diplomaGraduacao',
        name: 'diploma_psicologia_ufpe.pdf',
        size: 3145728, // 3MB
        contentType: 'application/pdf',
        uploadedAt: '2024-09-16T14:45:00Z'
      },
      {
        id: 'doc-terapeuta-3',
        tipo_documento: 'diplomaPosGraduacao',
        name: 'pos_graduacao_terapia_cognitiva.pdf',
        size: 2621440, // 2.5MB
        contentType: 'application/pdf',
        uploadedAt: '2024-09-17T10:15:00Z'
      },
      {
        id: 'doc-terapeuta-4',
        tipo_documento: 'registroCRP',
        name: 'registro_crp_maria_santos.pdf',
        size: 1048576, // 1MB
        contentType: 'application/pdf',
        uploadedAt: '2024-09-18T16:30:00Z'
      },
      {
        id: 'doc-terapeuta-5',
        tipo_documento: 'comprovanteEndereco',
        name: 'conta_energia_setembro.pdf',
        size: 692736, // 676KB
        contentType: 'application/pdf',
        uploadedAt: '2024-09-19T12:00:00Z'
      }
    ],
    '2': [
      {
        id: 'doc-terapeuta2-1',
        tipo_documento: 'fotoPerfil',
        name: 'foto_perfil_carlos.jpg',
        size: 1500000,
        contentType: 'image/jpeg',
        uploadedAt: '2024-08-20T09:00:00Z'
      },
      {
        id: 'doc-terapeuta2-2',
        tipo_documento: 'diplomaGraduacao',
        name: 'diploma_fisioterapia_usp.pdf',
        size: 2800000,
        contentType: 'application/pdf',
        uploadedAt: '2024-08-21T14:30:00Z'
      }
    ],
    // ID genérico para capturar outros terapeutas
    'default': [
      {
        id: 'doc-terapeuta-default-1',
        tipo_documento: 'fotoPerfil',
        name: 'foto_perfil_generico.jpg',
        size: 1200000,
        contentType: 'image/jpeg',
        uploadedAt: '2024-10-01T10:00:00Z'
      },
      {
        id: 'doc-terapeuta-default-2',
        tipo_documento: 'diplomaGraduacao',
        name: 'diploma_generico.pdf',
        size: 2000000,
        contentType: 'application/pdf',
        uploadedAt: '2024-10-02T11:00:00Z'
      },
      {
        id: 'doc-terapeuta-default-3',
        tipo_documento: 'registroCRP',
        name: 'crp_generico.pdf',
        size: 800000,
        contentType: 'application/pdf',
        uploadedAt: '2024-10-03T12:00:00Z'
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