# 🧩 Feature Programas - Sistema Base + Variantes

Sistema modular de gerenciamento de programas terapêuticos com suporte a múltiplas especialidades (Fonoaudiologia, Terapia Ocupacional, Musicoterapia, etc.).

## 📐 Arquitetura

Este sistema foi refatorado para seguir o padrão **Base + Variantes**, permitindo reutilização completa de UI/UX entre especialidades, mantendo flexibilidade para customizações específicas.

```
┌─────────────────────────────────────────────────────────┐
│                    CAMADA BASE (core/)                  │
│                                                         │
│  • Tipos compartilhados                                │
│  • Páginas genéricas (recebem config via props)       │
│  • Componentes reutilizáveis                           │
│  • Hooks comuns                                        │
└─────────────────────────────────────────────────────────┘
                           ▲
                           │ usa
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│  FONO         │  │  TO           │  │  MUSICO       │
│               │  │               │  │               │
│ config.ts     │  │ config.ts     │  │ config.ts     │
│ services.ts   │  │ services.ts   │  │ services.ts   │
│ pages/        │  │ pages/        │  │ pages/        │
└───────────────┘  └───────────────┘  └───────────────┘
  "Estímulos"        "Atividades"      "Exercícios"
```

## 📚 Documentação

- **[ARQUITETURA.md](./ARQUITETURA.md)** - Arquitetura completa e explicação do padrão
- **[RESUMO_REFATORACAO.md](./RESUMO_REFATORACAO.md)** - Resumo das mudanças feitas
- **[GUIA_ROTAS.ts](./GUIA_ROTAS.ts)** - Exemplos de configuração de rotas
- **[CHECKLIST_IMPLEMENTACAO.md](./CHECKLIST_IMPLEMENTACAO.md)** - O que foi feito e o que falta
- **[EXEMPLO_TESTES.test.tsx.example](./EXEMPLO_TESTES.test.tsx.example)** - Exemplos de testes

## 🚀 Quick Start

### Para usar Fonoaudiologia (já funciona)

```typescript
import { FonoCadastroProgramaPage } from '@/features/programas/variants/fono';

<Route path="/app/programas/novo" element={<FonoCadastroProgramaPage />} />
```

### Para usar Terapia Ocupacional (parcialmente implementado)

```typescript
import { ToCadastroProgramaPage } from '@/features/programas/variants/terapia-ocupacional';

<Route path="/app/programas/terapia-ocupacional/ocp/novo" element={<ToCadastroProgramaPage />} />
```

## 🏗️ Estrutura

```
programas/
├── core/                          # Camada base (genérica)
│   ├── types/                    # Tipos compartilhados
│   │   └── program.ts
│   ├── pages/                    # Páginas base
│   │   ├── BaseCadastroProgramaPage.tsx
│   │   └── BaseConsultaProgramasPage.tsx
│   ├── config/                   # Configs gerais
│   └── hooks/                    # Hooks compartilhados
│
├── variants/                      # Variantes por especialidade
│   ├── fono/
│   │   ├── config.ts            # Textos e rotas de Fono
│   │   ├── services.ts          # APIs de Fono
│   │   └── pages/               # Wrappers Fono
│   │       ├── FonoCadastroProgramaPage.tsx
│   │       └── FonoConsultaProgramasPage.tsx
│   │
│   ├── terapia-ocupacional/
│   │   ├── config.ts            # Textos e rotas de TO
│   │   ├── services/            # APIs de TO
│   │   └── pages/               # Wrappers TO
│   │       ├── ToCadastroProgramaPage.tsx
│   │       └── ToConsultaProgramasPage.tsx
│   │
│   ├── movimento/               # (futuramente)
│   └── musicoterapia/           # (futuramente)
│
├── cadastro-ocp/                 # Componentes de cadastro
├── consultar-programas/          # Componentes de consulta
├── detalhe-ocp/                  # Componentes de detalhe
├── editar-ocp/                   # Componentes de edição
├── consulta-sessao/              # Componentes de sessões
├── nova-sessao/                  # Componentes de nova sessão
│
└── pages/                        # Wrappers para compatibilidade
    ├── CadastroOcpPage.tsx      # → FonoCadastroProgramaPage
    └── ConsultaOcpPage.tsx      # → FonoConsultaProgramasPage
```

## 🎯 Como Funciona

### 1. Página Base (Genérica)

```typescript
// core/pages/BaseCadastroProgramaPage.tsx
export function BaseCadastroProgramaPage({
    config,              // Configuração de textos
    onFetchPatient,      // Callback para buscar paciente
    onCreateProgram,     // Callback para criar programa
    detailRoute,         // Rota para detalhes
    // ...
}: BaseCadastroProgramaPageProps) {
    // Lógica genérica que funciona para QUALQUER especialidade
}
```

### 2. Config da Variante

```typescript
// variants/fono/config.ts
export const fonoProgramConfig = {
    labels: {
        stimuli: 'Estímulos',           // ← Específico de Fono
        therapist: 'Terapeuta',
    },
    // ...
};

// variants/terapia-ocupacional/config.ts
export const toProgramConfig = {
    labels: {
        stimuli: 'Atividades',          // ← Específico de TO
        therapist: 'Terapeuta Ocupacional',
    },
    // ...
};
```

### 3. Wrapper da Variante

```typescript
// variants/fono/pages/FonoCadastroProgramaPage.tsx
export function FonoCadastroProgramaPage() {
    return (
        <BaseCadastroProgramaPage
            config={fonoProgramConfig}      // ← Config de Fono
            onCreateProgram={createFonoProgram}  // ← API de Fono
            // ...
        />
    );
}
```

**Resultado:** Mesma UI/UX, textos e endpoints diferentes!

## ✨ Vantagens

| Antes | Depois |
|-------|--------|
| ❌ Código duplicado entre especialidades | ✅ Código 100% reutilizado |
| ❌ Mudanças precisam ser replicadas | ✅ Mudança em um lugar beneficia todos |
| ❌ Difícil adicionar nova especialidade | ✅ Adicionar = criar config + services + wrappers |
| ❌ Inconsistências de UX entre áreas | ✅ UX consistente garantida |
| ❌ Manutenção cara | ✅ Manutenção centralizada |

## 📦 O Que Já Está Pronto

### ✅ Fono (100%)
- Cadastro de Programa
- Consulta/Lista de Programas
- Detalhe de Programa (via página legada)
- Edição de Programa (via página legada)
- Sessões (via páginas legadas)

### ✅ TO (40%)
- Cadastro de Programa ✅
- Consulta/Lista de Programas ✅
- Detalhe de Programa ⏳ (pendente)
- Edição de Programa ⏳ (pendente)
- Sessões ⏳ (pendente)

## 🚧 Próximos Passos

Ver [CHECKLIST_IMPLEMENTACAO.md](./CHECKLIST_IMPLEMENTACAO.md) para lista completa.

**Prioridade 1:** Completar TO
1. Criar `BaseDetalheProgramaPage`
2. Criar `BaseEditarProgramaPage`
3. Criar wrappers TO para detalhe e edição

**Prioridade 2:** Sessões
1. Criar `BaseConsultaSessaoPage`
2. Criar `BaseRegistrarSessaoPage`
3. Criar wrappers TO para sessões

**Prioridade 3:** Outras Especialidades
1. Replicar estrutura para Musicoterapia
2. Replicar estrutura para Movimento

## 🧪 Como Testar

### Testar Fono (já funciona)
1. Acesse: `http://localhost:5173/app/programas/novo`
2. Crie um programa
3. Observe labels: "Estímulos", "Terapeuta"

### Testar TO (parcialmente funcional)
1. Configure rotas de TO no router (ver [GUIA_ROTAS.ts](./GUIA_ROTAS.ts))
2. Acesse: `http://localhost:5173/app/programas/terapia-ocupacional/ocp/novo`
3. Crie um programa
4. Observe labels: "Atividades", "Terapeuta Ocupacional"

## 🤝 Como Contribuir

### Adicionando Nova Página Base

1. Extrair lógica da página existente
2. Parametrizar textos/rotas via config
3. Criar interface de props
4. Criar wrappers para cada variante

Ver exemplo em `BaseCadastroProgramaPage.tsx`.

### Adicionando Nova Variante

1. Criar pasta `variants/<especialidade>/`
2. Criar `config.ts` com textos e rotas
3. Criar `services.ts` com APIs específicas
4. Criar `pages/` com wrappers
5. Adicionar rotas no router

Ver exemplo em `variants/terapia-ocupacional/`.

## 📝 Convenções

### Nomenclatura
- Base: `Base<Nome>Page` (ex: `BaseCadastroProgramaPage`)
- Fono: `Fono<Nome>Page` (ex: `FonoCadastroProgramaPage`)
- TO: `To<Nome>Page` (ex: `ToCadastroProgramaPage`)

### Organização
- Config e services no nível da variante
- Páginas em `pages/`
- Sempre exportar via `index.ts`

### Props
- Páginas base recebem `config` e callbacks
- Callbacks começam com `on` (ex: `onCreateProgram`)
- Rotas são funções (ex: `detailRoute: (id) => string`)

## 🐛 Troubleshooting

### Erro: "Cannot find module"
- Verifique se todos os `index.ts` estão exportando corretamente
- Confirme caminhos relativos de imports

### Labels não aparecem corretos
- Verifique se o `config` está sendo passado corretamente
- Confirme se o wrapper está usando o config correto da variante

### API chamando endpoint errado
- Verifique se o wrapper está passando o `onCreateProgram` correto
- Confirme se o serviço da variante está chamando endpoint certo

## 📞 Suporte

- Documentação: Ver arquivos `.md` nesta pasta
- Exemplos: Ver `variants/fono/` e `variants/terapia-ocupacional/`
- Testes: Ver `EXEMPLO_TESTES.test.tsx.example`

---

**Versão:** 1.0.0  
**Última Atualização:** 2025-01-20  
**Status:** ✅ Fono Funcional | 🟡 TO Parcial
