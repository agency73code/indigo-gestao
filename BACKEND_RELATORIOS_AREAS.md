# Backend: Implementação de Áreas Terapêuticas em Relatórios

## 📋 Visão Geral

O frontend está **preparado e aguardando** a implementação backend de separação de relatórios por área terapêutica. Este documento detalha as mudanças necessárias no backend.

## 🎯 Objetivo

Separar relatórios por área terapêutica dentro de cada cliente, garantindo:
1. **Organização**: Cliente → Área → Mês → Relatórios (3 níveis de hierarquia)
2. **Isolamento**: Terapeutas de uma área não veem relatórios de outras áreas
3. **RBAC**: Aplicar controle de acesso baseado em perfil e área

## 📊 Status Atual do Frontend

### ✅ Implementado no Frontend

1. **Tipos TypeScript atualizados** (`frontend/src/features/relatorios/types.ts`):
   ```typescript
   interface SavedReport {
     // ... campos existentes
     area: AreaType; // 🆕 'fonoaudiologia' | 'terapia-ocupacional' | etc
   }
   
   interface CreateReportInput {
     // ... campos existentes
     area: AreaType; // 🆕 Obrigatório ao criar relatório
   }
   
   interface ReportListFilters {
     // ... filtros existentes
     area?: AreaType; // 🆕 Filtrar relatórios por área
   }
   ```

2. **Interface de listagem** (`RelatoriosPage.tsx`):
   - Agrupamento por cliente → área → mês (3 níveis de accordion)
   - Ícone e label de área terapêutica
   - Contador de relatórios por área
   - Fallback: relatórios sem `area` são tratados como 'fonoaudiologia'

3. **Geração de relatórios** (`GerarRelatorioPage.tsx`):
   - Validação: área obrigatória antes de salvar
   - Campo `area` incluído no payload do FormData
   - Toast de erro se área não selecionada

4. **Serviços preparados**:
   - `getAllReports()`: Envia query param `?area=` quando disponível
   - `saveReportToBackend()`: Inclui `formData.append('area', area)`
   - Filtros locais aplicam área quando backend retornar dados

### 🔧 Fallbacks Implementados

Para garantir funcionamento durante transição:
```typescript
// Frontend agrupa usando fallback
const area = report.area || 'fonoaudiologia';
```

## 🔨 Implementação Backend Necessária

### 1️⃣ Schema - Adicionar Campo `area`

**Arquivo**: `backend/prisma/schema.prisma`

```prisma
model relatorio {
  id                     String   @id @default(uuid())
  titulo                 String
  tipo                   String
  status                 String   @default("final")
  area                   String   // 🆕 ADICIONAR: 'fonoaudiologia', 'terapia-ocupacional', etc
  periodo_inicio         DateTime
  periodo_fim            DateTime
  observacoes_clinicas   String?  @db.LongText
  filtros                Json?
  dados_gerados          Json?
  pdf_arquivo_id         String?
  pdf_nome               String?
  pdf_mime               String?
  pdf_tamanho            Int?
  pdf_url                String?
  pasta_relatorios_drive String?
  clienteId              String
  terapeutaId            String
  criado_em              DateTime @default(now())
  atualizado_em          DateTime @updatedAt

  cliente   cliente   @relation(fields: [clienteId], references: [id])
  terapeuta terapeuta @relation(fields: [terapeutaId], references: [id])

  @@index([clienteId], map: "relatorio_clienteId_idx")
  @@index([terapeutaId], map: "relatorio_terapeutaId_idx")
  @@index([periodo_inicio, periodo_fim], map: "relatorio_periodo_idx")
  @@index([clienteId, area], map: "relatorio_clienteId_area_idx") // 🆕 ADICIONAR: índice composto
  @@index([area], map: "relatorio_area_idx") // 🆕 ADICIONAR: índice individual
}
```

**Migration**:
```bash
npx prisma migrate dev --name add_area_to_relatorio
```

**Migração de dados existentes** (opcional):
```sql
-- Atribuir área padrão aos relatórios existentes
UPDATE relatorio SET area = 'fonoaudiologia' WHERE area IS NULL;
```

### 2️⃣ Types - Atualizar Interfaces TypeScript

**Arquivo**: `backend/src/features/reports/report.types.ts`

```typescript
export interface SavedReport {
  // ... campos existentes
  area: string; // 🆕 ADICIONAR
  // ...
}

export interface ReportListFilters {
  patientId?: string;
  therapistId?: string;
  area?: string; // 🆕 ADICIONAR: Filtrar por área
  startDate?: Date;
  endDate?: Date;
  status?: ReportStatus;
  type?: ReportType;
  restrictToTherapistId?: string;
}
```

### 3️⃣ Service - Incluir `area` ao Salvar

**Arquivo**: `backend/src/features/reports/report.service.ts`

```typescript
interface SaveReportInput {
  title: string;
  type: ReportType;
  status: ReportStatus;
  patientId: string;
  therapistId: string;
  area: string; // 🆕 ADICIONAR
  periodStart: Date;
  periodEnd: Date;
  clinicalObservations?: string;
  data: StructuredReportData;
  pdfFile: Express.Multer.File;
}

export async function saveReport(input: SaveReportInput): Promise<SavedReport> {
  // ... validações existentes
  
  const created = await prisma.relatorio.create({
    data: {
      titulo: input.title,
      tipo: input.type,
      status: input.status,
      area: input.area, // 🆕 ADICIONAR
      periodo_inicio: input.periodStart,
      periodo_fim: input.periodEnd,
      // ... demais campos
    },
    include: reportInclude,
  });

  return mapToSavedReport(created);
}
```

### 4️⃣ Service - Filtrar por Área na Listagem

**Arquivo**: `backend/src/features/reports/report.service.ts`

```typescript
export async function listReports(filters: ReportListFilters = {}): Promise<SavedReport[]> {
  const where: Prisma.relatorioWhereInput = {};

  if (filters.patientId) {
    where.clienteId = filters.patientId;
  }

  const therapistFilter = filters.restrictToTherapistId ?? filters.therapistId;
  if (therapistFilter) {
    where.terapeutaId = therapistFilter;
  }

  // 🆕 ADICIONAR: Filtro por área
  if (filters.area) {
    where.area = filters.area;
  }

  // ... demais filtros existentes

  const records = await prisma.relatorio.findMany({
    where,
    orderBy: { criado_em: 'desc' },
    include: reportInclude,
  });

  return records.map(mapToSavedReport);
}
```

### 5️⃣ Controller - Aceitar `area` no Payload

**Arquivo**: `backend/src/features/reports/report.controller.ts`

```typescript
export async function saveReport(req: Request, res: Response, next: NextFunction) {
  try {
    const body = req.body;
    const file = req.file;

    // Validar payload
    const validated = reportPayloadSchema.parse({
      title: body.title,
      type: body.type,
      status: body.status,
      patientId: body.patientId,
      therapistId: body.therapistId,
      area: body.area, // 🆕 ADICIONAR
      periodStart: body.periodStart,
      periodEnd: body.periodEnd,
      clinicalObservations: body.clinicalObservations,
      data: JSON.parse(body.data || '{}'),
    });

    // ... restante da implementação
  } catch (error) {
    next(error);
  }
}
```

**Arquivo**: `backend/src/schemas/report.schema.ts`

```typescript
import { z } from 'zod';

export const reportPayloadSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['mensal', 'trimestral', 'semestral', 'anual', 'custom']),
  status: z.enum(['draft', 'final', 'archived']).default('final'),
  patientId: z.string().uuid(),
  therapistId: z.string().uuid(),
  area: z.string().min(1), // 🆕 ADICIONAR: Validar área obrigatória
  periodStart: z.string(), // ISO date
  periodEnd: z.string(),   // ISO date
  clinicalObservations: z.string().optional(),
  data: z.object({
    filters: z.record(z.unknown()),
    generatedData: z.record(z.unknown()),
  }),
});
```

### 6️⃣ Controller - Filtrar Query Params

**Arquivo**: `backend/src/features/reports/report.controller.ts`

```typescript
export async function listReports(req: Request, res: Response, next: NextFunction) {
  try {
    const query = reportListQuerySchema.parse(req.query);
    
    const filters: ReportListFilters = {
      patientId: query.patientId,
      therapistId: query.therapistId,
      area: query.area, // 🆕 ADICIONAR
      status: query.status as ReportStatus | undefined,
      type: query.type as ReportType | undefined,
      // ... demais filtros
    };

    // 🔒 RBAC: Aplicar restrições baseadas no perfil
    const canSeeAll = userCanSeeAllReports(req.user);
    if (!canSeeAll) {
      filters.restrictToTherapistId = req.user.id;
      
      // 🆕 ADICIONAR: Se terapeuta clínico, filtrar por área dele
      // Sugestão: buscar área do terapeuta na tabela registro_profissional
      // filters.area = req.user.area; // Implementar lógica conforme modelo de dados
    }

    const reports = await ReportService.listReports(filters);
    res.json({ data: reports });
  } catch (error) {
    next(error);
  }
}
```

**Arquivo**: `backend/src/schemas/report.schema.ts`

```typescript
export const reportListQuerySchema = z.object({
  patientId: z.string().uuid().optional(),
  therapistId: z.string().uuid().optional(),
  area: z.string().optional(), // 🆕 ADICIONAR
  status: z.enum(['draft', 'final', 'archived']).optional(),
  type: z.enum(['mensal', 'trimestral', 'semestral', 'anual', 'custom']).optional(),
  // ... demais filtros
});
```

### 7️⃣ R2 Storage - Atualizar Estrutura de Pastas

**Arquivo**: `backend/src/features/reports/report-drive.service.ts`

```typescript
interface EnsureReportFolderParams {
  fullName: string;
  birthDate: string;
  periodStart: Date;
  area: string; // 🆕 ADICIONAR
}

export function ensureMonthlyReportFolder({ 
  fullName, 
  birthDate, 
  periodStart,
  area // 🆕 ADICIONAR
}: EnsureReportFolderParams): ReportFolderInfo {
  const monthFolderName = dayjs(periodStart).format('YYYY-MM');
  const basePrefix = `${sanitizeFolderName(fullName)}-${birthDate}`;
  
  // 🆕 MODIFICAR: Incluir área na hierarquia de pastas
  const reportsPrefix = `${basePrefix}/relatorios/${area}`;
  const monthPrefix = `${reportsPrefix}/${monthFolderName}`;

  return {
    basePrefix,
    reportsPrefix,
    monthPrefix,
  };
}
```

**Nova estrutura de pastas**:
```
R2 Bucket:
└── {nome-cliente}-{data-nascimento}/
    └── relatorios/
        ├── fonoaudiologia/
        │   ├── 2025-01/
        │   │   ├── relatorio_2025-01_cliente_titulo1.pdf
        │   │   └── relatorio_2025-01_cliente_titulo2.pdf
        │   └── 2025-02/
        │       └── relatorio_2025-02_cliente_titulo3.pdf
        └── terapia-ocupacional/
            └── 2025-01/
                └── relatorio_2025-01_cliente_titulo4.pdf
```

### 8️⃣ RBAC - Aplicar Controle de Acesso

**Arquivo**: `backend/src/abilities/defineAbility.ts`

```typescript
// Sugestão de estrutura (ajustar conforme modelo de dados):

export function defineAbilityFor(perfil_acesso?: string, area?: string) {
  const { can, build } = new AbilityBuilder(AppAbility);

  const role = perfil_acesso?.toLocaleLowerCase() ?? '';
  const level = ACCESS_LEVELS[role] ?? 0;

  // Dashboard para todos
  can('read', 'Dashboard');

  // ATs (nível 1): Veem apenas clientes vinculados da própria área
  if (level >= 1) {
    can('read', 'Consultar');
    can('read', 'Vinculos');
    
    // 🆕 ADICIONAR: Restringir relatórios à área do terapeuta
    can('read', 'Relatorios', { area }); // Condição: área corresponde
  }

  // Supervisores e clínicos (nível 2-4): Mesma área
  if (level >= 2 && level < 5) {
    can('create', 'Cadastro');
    can(['update', 'read'], 'Consultar');
    can(['create', 'read'], 'Relatorios', { area }); // 🆕 Mesma área
  }

  // Gerentes e coordenadores (nível 5+): Acesso completo
  if (level >= 5) {
    can('manage', 'all');
  }

  return build({
    detectSubjectType: (object: { type?: Subjects }) => object?.type as Subjects,
  });
}
```

**Nota**: Implementação exata depende do modelo de vínculos terapeuta-área no banco.

## 🧪 Testes Recomendados

### Backend
1. **Unit Tests**:
   - Salvar relatório com campo `area`
   - Listar relatórios filtrando por `area`
   - Validar RBAC: terapeuta vê apenas relatórios da própria área

2. **Integration Tests**:
   - POST `/api/relatorios` com campo `area` → deve salvar corretamente
   - GET `/api/relatorios?area=fonoaudiologia` → deve filtrar
   - GET `/api/relatorios?area=terapia-ocupacional` → terapeuta de fono NÃO deve ver

3. **E2E Tests**:
   - Fluxo completo: gerar relatório → salvar com área → listar por cliente e área

### Frontend (já implementado)
- ✅ Agrupamento por área funciona com fallback
- ✅ Validação de área obrigatória ao salvar
- ✅ Filtros locais aplicam área quando backend retornar

## 📝 Checklist de Implementação

### Database
- [ ] Adicionar coluna `area` (VARCHAR) no model `relatorio`
- [ ] Criar índice composto `[clienteId, area]`
- [ ] Criar índice individual `[area]`
- [ ] Rodar migration

### Código Backend
- [ ] Atualizar `report.types.ts` (adicionar `area` em interfaces)
- [ ] Atualizar `report.service.ts` (incluir `area` ao salvar)
- [ ] Atualizar `report.service.ts` (filtrar por `area` na listagem)
- [ ] Atualizar `report.controller.ts` (aceitar `area` no payload)
- [ ] Atualizar `report.schema.ts` (validar `area` obrigatória)
- [ ] Atualizar `report-drive.service.ts` (incluir área na estrutura de pastas R2)
- [ ] Implementar RBAC por área em `defineAbility.ts` (opcional, mas recomendado)

### Testes
- [ ] Unit tests para salvar e filtrar por área
- [ ] Integration tests para endpoints
- [ ] Validar RBAC (terapeutas não veem outras áreas)

### Deploy
- [ ] Rodar migration em produção
- [ ] Migrar relatórios existentes (atribuir área padrão)
- [ ] Monitorar logs após deploy

## 🚀 Cronograma Sugerido

1. **Sprint 1** (1-2 dias):
   - Schema + Migration
   - Types + Service básico

2. **Sprint 2** (1-2 dias):
   - Controller + Validations
   - R2 folder structure

3. **Sprint 3** (1-2 dias):
   - RBAC implementation
   - Tests

4. **Sprint 4** (1 dia):
   - Deploy + Migration + Monitoring

## 📞 Contato

Dúvidas sobre a implementação frontend preparada:
- Revisar commits recentes no branch `dev`
- Verificar arquivos modificados:
  - `frontend/src/features/relatorios/types.ts`
  - `frontend/src/features/relatorios/pages/RelatoriosPage.tsx`
  - `frontend/src/features/relatorios/pages/GerarRelatorioPage.tsx`
  - `frontend/src/features/relatorios/services/relatorios.service.ts`
  - `frontend/src/features/relatorios/services/pdf-export.service.ts`

---

**Frontend está 100% preparado e aguardando backend!** 🎉
