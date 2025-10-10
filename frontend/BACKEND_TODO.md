# TODO Backend - Campo stimuliApplicationDescription

## ⚠️ Atenção Backend Team

O frontend está usando **mocks temporários** para o campo `stimuliApplicationDescription` no programa (OCP).

### O que precisa ser feito no Backend:

#### 1. Adicionar campo na tabela `ocp` no banco de dados

```sql
ALTER TABLE ocp ADD COLUMN descricao_aplicacao_estimulo TEXT NULL;
```

#### 2. Atualizar o modelo Prisma

No arquivo `backend/prisma/schema.prisma`, adicione o campo no modelo `ocp`:

```prisma
model ocp {
  id                              Int                 @id @default(autoincrement())
  cliente_id                      String
  criador_id                      String
  nome_programa                   String
  criado_em                       DateTime            @default(now())
  data_inicio                     DateTime
  data_fim                        DateTime
  objetivo_programa               String?
  objetivo_descricao              String?             @db.Text
  dominio_criterio                String?             @db.Text
  observacao_geral                String?             @db.Text
  descricao_aplicacao_estimulo    String?             @db.Text  // <- NOVO CAMPO
  atualizado_em                   DateTime            @updatedAt
  status                          String              @default("active")

  // ... resto do modelo
}
```

#### 3. Retornar o campo no endpoint GET `/api/ocp/programs/:id`

No controller do backend, certifique-se de que o campo seja mapeado corretamente para o frontend:

```typescript
// Backend deve mapear:
descricao_aplicacao_estimulo -> stimuliApplicationDescription
```

#### 4. Aceitar o campo no endpoint PATCH `/api/ocp/programs/:id`

Permitir que o campo seja atualizado quando o programa for editado.

---

### Arquivos do Frontend com Mock Temporário:

Os seguintes arquivos contém mocks temporários que devem ser **removidos** após o backend implementar o campo:

1. `frontend/src/features/programas/detalhe-ocp/services.ts` (linhas ~12-15)
2. `frontend/src/features/programas/nova-sessao/services.ts` (linhas ~18-21)
3. `frontend/src/features/programas/editar-ocp/services.ts` (linhas ~11-14)

Procure por comentários começando com:
```typescript
// TODO: Remover este mock quando o backend adicionar o campo stimuliApplicationDescription
```

---

### Como o Frontend Espera Receber:

**Tipo TypeScript esperado:**

```typescript
interface ProgramDetail {
  // ... outros campos
  stimuliApplicationDescription?: string | null;
}
```

**Exemplo de resposta da API:**

```json
{
  "data": {
    "id": "2",
    "name": "Comunicação Funcional — Fase 1",
    "goalTitle": "Independência em respostas comunicativas",
    "stimuliApplicationDescription": "Aplique os estímulos nas sessões diárias, utilizando reforçadores preferidos e alternando contextos (sala, pátio e refeitório) para favorecer a generalização.",
    // ... outros campos
  }
}
```

---

### Prioridade: **MÉDIA**

O frontend está funcionando com mock, mas seria ideal implementar logo para ter dados reais.
