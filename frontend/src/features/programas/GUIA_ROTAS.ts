/**
 * GUIA DE USO - Sistema de Rotas para Variantes
 * 
 * Este arquivo documenta como configurar rotas para as variantes de Programas
 */

// ============================================================================
// EXEMPLO 1: Rotas de Fonoaudiologia (já existentes, mantidas)
// ============================================================================

/*
No seu arquivo de rotas (ex: App.tsx ou routes.tsx):

import { FonoCadastroProgramaPage, FonoConsultaProgramasPage } from '@/features/programas/variants/fono';

<Route path="/app/programas">
  <Route path="novo" element={<FonoCadastroProgramaPage />} />
  <Route path="consultar" element={<FonoConsultaProgramasPage />} />
  <Route path=":programaId" element={<DetalheProgramaPage />} />
  <Route path=":programaId/editar" element={<EditarProgramaPage />} />
  <Route path="sessoes/nova" element={<RegistrarSessaoPage />} />
  <Route path="sessoes" element={<ConsultaSessao />} />
</Route>
*/

// ============================================================================
// EXEMPLO 2: Rotas de Terapia Ocupacional (nova)
// ============================================================================

/*
import { ToCadastroProgramaPage, ToConsultaProgramasPage } from '@/features/programas/variants/terapia-ocupacional';

<Route path="/app/programas/terapia-ocupacional">
  <Route path="ocp/novo" element={<ToCadastroProgramaPage />} />
  <Route path="consultar" element={<ToConsultaProgramasPage />} />
  <Route path="programa/:programaId" element={<ToDetalheProgramaPage />} />
  <Route path="ocp/:programaId/editar" element={<ToEditarProgramaPage />} />
  <Route path="sessoes/registrar" element={<ToRegistrarSessaoPage />} />
  <Route path="sessoes" element={<ToConsultaSessaoPage />} />
</Route>
*/

// ============================================================================
// EXEMPLO 3: Adicionando Nova Especialidade (Musicoterapia)
// ============================================================================

/*
Passo 1: Criar estrutura de variante

variants/musicoterapia/
├── config.ts
├── services.ts
└── pages/
    ├── MusicoCadastroProgramaPage.tsx
    ├── MusicoConsultaProgramasPage.tsx
    └── index.ts

Passo 2: Configurar textos e rotas (config.ts)

export const musicoProgramConfig: BaseProgramPageConfig = {
    pageTitle: 'Novo Programa - Musicoterapia',
    labels: {
        stimuli: 'Exercícios Musicais',
        therapist: 'Musicoterapeuta',
        // ...
    },
    // ...
};

export const musicoRoutes = {
    create: '/app/programas/musicoterapia/novo',
    list: '/app/programas/musicoterapia/consultar',
    // ...
};

Passo 3: Criar serviços (services.ts)

export async function createMusicoProgram(input: CreateProgramInput) {
    return fetch(`${API_URL}/ocp/programs`, {
        body: JSON.stringify({
            ...input,
            area: 'musicoterapia',
        }),
    });
}

Passo 4: Criar páginas (pages/MusicoCadastroProgramaPage.tsx)

export function MusicoCadastroProgramaPage() {
    return (
        <BaseCadastroProgramaPage
            config={musicoProgramConfig}
            onCreateProgram={createMusicoProgram}
            detailRoute={musicoRoutes.detail}
            // ...
        />
    );
}

Passo 5: Adicionar rotas

<Route path="/app/programas/musicoterapia">
  <Route path="novo" element={<MusicoCadastroProgramaPage />} />
  <Route path="consultar" element={<MusicoConsultaProgramasPage />} />
  // ...
</Route>
*/

// ============================================================================
// NAVEGAÇÃO ENTRE VARIANTES
// ============================================================================

/*
Para navegar entre páginas dentro de uma variante, use as rotas do config:

// Em um componente de Fono
import { fonoRoutes } from '@/features/programas/variants/fono';
navigate(fonoRoutes.detail(programId));

// Em um componente de TO
import { toRoutes } from '@/features/programas/variants/terapia-ocupacional';
navigate(toRoutes.detail(programId));
*/

// ============================================================================
// RETROCOMPATIBILIDADE
// ============================================================================

/*
As rotas antigas de Fono continuam funcionando porque os arquivos em pages/
foram transformados em wrappers:

pages/CadastroOcpPage.tsx → FonoCadastroProgramaPage
pages/ConsultaOcpPage.tsx → FonoConsultaProgramasPage

Assim, código antigo que importa de pages/ continua funcionando sem mudanças.
*/

export {};
