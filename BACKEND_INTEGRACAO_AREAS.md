# Integração Backend - Separação por Áreas

## 📋 Resumo
O frontend agora envia o parâmetro `area` em **TODAS** as requisições de programas e sessões. O backend precisa filtrar os dados por esse parâmetro.

## 🎯 Objetivo
Permitir que **Fonoaudiologia**, **Psicopedagogia** e **Terapia ABA** compartilhem as mesmas telas e componentes, mas mantenham **dados completamente separados**.

## 📤 O que o Frontend Envia

### 1. Query Parameter (Todas as requisições GET)
```
GET /api/ocp/programs?area=fonoaudiologia
GET /api/ocp/programs/123?area=terapia-aba
GET /api/ocp/programs/123/sessions?area=psicopedagogia
```

### 2. Body (Requisições POST/PUT/PATCH)
```json
{
  "area": "fonoaudiologia",
  "patientId": "abc123",
  "title": "Programa X",
  ...
}
```

## 🔧 Valores Possíveis de `area`

```typescript
type AreaType = 
    | 'fonoaudiologia'      // Fono - usa modelo base
    | 'psicopedagogia'      // Psicopedagogia - usa modelo base
    | 'terapia-aba'         // ABA - usa modelo base
    | 'terapia-ocupacional' // TO - usa modelo próprio
    | 'psicoterapia'        // Psico - futuro
    | 'fisioterapia'        // Fisio - futuro
    | 'psicomotricidade'    // Psicomotricidade - futuro
    | 'educacao-fisica'     // Ed. Física - futuro
    | 'musicoterapia'       // Musico - futuro
    | 'neuropsicologia'     // Neuro - futuro
```

## 🗄️ Mudanças Necessárias no Backend

### 1. Adicionar campo `area` na tabela de programas
```sql
ALTER TABLE programs ADD COLUMN area VARCHAR(50) NOT NULL;
CREATE INDEX idx_programs_area ON programs(area);
CREATE INDEX idx_programs_patient_area ON programs(patient_id, area);
```

### 2. Adicionar campo `area` na tabela de sessões
```sql
ALTER TABLE sessions ADD COLUMN area VARCHAR(50) NOT NULL;
CREATE INDEX idx_sessions_area ON sessions(area);
CREATE INDEX idx_sessions_program_area ON sessions(program_id, area);
```

### 3. Endpoints que PRECISAM filtrar por `area`

#### GET /api/ocp/programs (Listar programas)
```typescript
async getPrograms(req, res) {
    const { area } = req.query; // OBRIGATÓRIO
    
    if (!area) {
        return res.status(400).json({ 
            error: 'Parâmetro area é obrigatório' 
        });
    }
    
    const programs = await db.programs.findMany({
        where: { 
            area,
            // ... outros filtros
        }
    });
    
    return res.json({ data: programs });
}
```

#### GET /api/ocp/programs/:id (Detalhe do programa)
```typescript
async getProgram(req, res) {
    const { id } = req.params;
    const { area } = req.query; // OBRIGATÓRIO
    
    const program = await db.programs.findFirst({
        where: { 
            id,
            area // Garante que só retorna se for da área correta
        }
    });
    
    if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
    }
    
    return res.json({ data: program });
}
```

#### POST /api/ocp/programs (Criar programa)
```typescript
async createProgram(req, res) {
    const { area, patientId, title, ...data } = req.body;
    
    if (!area) {
        return res.status(400).json({ 
            error: 'Campo area é obrigatório' 
        });
    }
    
    const program = await db.programs.create({
        data: {
            area,
            patientId,
            title,
            ...data
        }
    });
    
    return res.json({ data: program });
}
```

#### GET /api/ocp/programs/:programId/sessions (Sessões do programa)
```typescript
async getProgramSessions(req, res) {
    const { programId } = req.params;
    const { area } = req.query; // OBRIGATÓRIO
    
    // Primeiro verifica se o programa existe e é da área correta
    const program = await db.programs.findFirst({
        where: { id: programId, area }
    });
    
    if (!program) {
        return res.status(404).json({ error: 'Programa não encontrado' });
    }
    
    const sessions = await db.sessions.findMany({
        where: { 
            programId,
            area // Filtro adicional por segurança
        }
    });
    
    return res.json({ data: sessions });
}
```

#### POST /api/ocp/sessions (Criar sessão)
```typescript
async createSession(req, res) {
    const { area, programId, ...data } = req.body;
    
    if (!area) {
        return res.status(400).json({ 
            error: 'Campo area é obrigatório' 
        });
    }
    
    // Verificar se o programa existe e é da área correta
    const program = await db.programs.findFirst({
        where: { id: programId, area }
    });
    
    if (!program) {
        return res.status(400).json({ 
            error: 'Programa não encontrado para esta área' 
        });
    }
    
    const session = await db.sessions.create({
        data: {
            area,
            programId,
            ...data
        }
    });
    
    return res.json({ data: session });
}
```

## 🧪 Testes Essenciais

### Teste 1: Isolamento de Dados
```typescript
// Criar programa em Fonoaudiologia
POST /api/ocp/programs
{ "area": "fonoaudiologia", "patientId": "123", "title": "Programa Fono" }

// Criar programa em Terapia ABA (mesmo paciente)
POST /api/ocp/programs
{ "area": "terapia-aba", "patientId": "123", "title": "Programa ABA" }

// Listar programas de Fono - deve retornar APENAS o programa Fono
GET /api/ocp/programs?area=fonoaudiologia

// Listar programas de ABA - deve retornar APENAS o programa ABA
GET /api/ocp/programs?area=terapia-aba
```

### Teste 2: Segurança entre Áreas
```typescript
// Criar programa em Fono
POST /api/ocp/programs
{ "area": "fonoaudiologia", "id": "abc123", ... }

// Tentar acessar com área diferente - deve retornar 404
GET /api/ocp/programs/abc123?area=terapia-aba
// Resposta esperada: 404 Not Found
```

### Teste 3: Sessões Isoladas
```typescript
// Criar sessão em programa Fono
POST /api/ocp/sessions
{ "area": "fonoaudiologia", "programId": "fono-prog-123", ... }

// Criar sessão em programa ABA
POST /api/ocp/sessions
{ "area": "terapia-aba", "programId": "aba-prog-456", ... }

// Listar sessões do paciente em Fono - só sessões de Fono
GET /api/ocp/sessions?patientId=123&area=fonoaudiologia

// Listar sessões do paciente em ABA - só sessões de ABA
GET /api/ocp/sessions?patientId=123&area=terapia-aba
```

## ⚠️ IMPORTANTE: Validações Obrigatórias

1. **Sempre validar** se `area` está presente nas requisições
2. **Nunca permitir** buscar dados sem o filtro de área
3. **Garantir** que sessões só podem ser criadas para programas da mesma área
4. **Verificar** que atualizações não mudam a área do registro
5. **Indexar** o campo `area` para performance

## 📊 Migration Exemplo (Prisma)

```prisma
// schema.prisma
model Program {
  id          String   @id @default(uuid())
  area        String   // NOVO CAMPO
  patientId   String
  title       String
  // ... outros campos
  
  @@index([area])
  @@index([patientId, area])
}

model Session {
  id         String   @id @default(uuid())
  area       String   // NOVO CAMPO
  programId  String
  // ... outros campos
  
  @@index([area])
  @@index([programId, area])
}
```

```sql
-- Migration SQL
-- Adicionar coluna area
ALTER TABLE programs ADD COLUMN area VARCHAR(50);
ALTER TABLE sessions ADD COLUMN area VARCHAR(50);

-- Migrar dados existentes (definir área padrão para dados antigos)
UPDATE programs SET area = 'fonoaudiologia' WHERE area IS NULL;
UPDATE sessions SET area = 'fonoaudiologia' WHERE area IS NULL;

-- Tornar obrigatório
ALTER TABLE programs ALTER COLUMN area SET NOT NULL;
ALTER TABLE sessions ALTER COLUMN area SET NOT NULL;

-- Criar índices
CREATE INDEX idx_programs_area ON programs(area);
CREATE INDEX idx_programs_patient_area ON programs(patient_id, area);
CREATE INDEX idx_sessions_area ON sessions(area);
CREATE INDEX idx_sessions_program_area ON sessions(program_id, area);
```

## 🎬 Fluxo Completo de Exemplo

### Usuário acessa Fonoaudiologia
1. Clica em "Fonoaudiologia" na sidebar
2. Frontend define `currentArea = 'fonoaudiologia'` no contexto
3. Usuário clica em "Criar Programa"
4. Frontend faz: `POST /api/ocp/programs` com `{ area: 'fonoaudiologia', ... }`
5. Backend salva programa com `area = 'fonoaudiologia'`
6. Usuário lista programas
7. Frontend faz: `GET /api/ocp/programs?area=fonoaudiologia`
8. Backend retorna APENAS programas de fonoaudiologia

### Usuário acessa Terapia ABA
1. Clica em "Terapia ABA" na sidebar
2. Frontend define `currentArea = 'terapia-aba'`
3. Usuário lista programas (mesmo paciente)
4. Frontend faz: `GET /api/ocp/programs?area=terapia-aba`
5. Backend retorna APENAS programas de terapia-aba
6. **Programas de fono NÃO aparecem!** ✅

## 📝 Checklist de Implementação

Backend deve implementar:
- [ ] Adicionar campo `area` nas tabelas
- [ ] Criar migration para adicionar colunas
- [ ] Adicionar índices de performance
- [ ] Validar presença de `area` em todos os endpoints
- [ ] Filtrar por `area` em todas as queries SELECT
- [ ] Incluir `area` em todos os INSERT
- [ ] Testar isolamento entre áreas
- [ ] Testar que dados antigos recebem área padrão
- [ ] Documentar endpoints atualizados
- [ ] Adicionar testes de integração

## 🚀 Pronto para Deploy

Quando o backend implementar essas mudanças, o sistema funcionará assim:

- ✅ Fonoaudiologia, Psicopedagogia e ABA compartilham as MESMAS telas
- ✅ Dados ficam TOTALMENTE separados por área
- ✅ Frontend envia automaticamente a área em todas as requisições
- ✅ Backend filtra tudo por área
- ✅ Zero risco de misturar dados entre áreas
