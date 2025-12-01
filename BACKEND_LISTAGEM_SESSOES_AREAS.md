# Backend: Filtro de Área para Listagem de Sessões

## 📋 Contexto
Frontend agora envia query parameter `?area=` nas requisições de sessões. Backend precisa filtrar sessões por área no banco de dados.

## ✅ Mudanças Necessárias

### 1. **Normalizer** - Expor campo `area`
📁 `backend/src/features/olp/olp.normalizer.ts` (linha ~38-53)

```typescript
export function mapSessionList(dto: OcpTypes.SessionDTO[]): OcpTypes.Session[] {
    return dto.map((s) => ({
        id: s.id.toString(),
        pacienteId: s.cliente_id,
        terapeutaId: s.terapeuta_id,
        data: s.data_criacao.toISOString(),
        programa: s.ocp?.nome_programa ?? '',
        objetivo: s.ocp?.objetivo_programa ?? '',
        prazoInicio: s.ocp?.criado_em.toISOString(),
        prazoFim: null,
        observacoes: s.observacoes_sessao ?? null,
        area: s.area, // ← ADICIONAR ESTA LINHA
        registros: s.trials.map((t) => ({
            tentativa: t.ordem,
            resultado: translateResult(t.resultado),
            stimulusId: t.estimulosOcp?.id.toString(),
            stimulusLabel: t.estimulosOcp?.nome ?? undefined,
        })),
    }));
}
```

### 2. **Controller** - Aceitar query param `area`
📁 `backend/src/features/olp/olp.controller.ts` (linha ~184)

```typescript
export async function listSessionsByClient(req: Request, res: Response) {
    try {
        const { clientId } = req.params;
        if (!clientId) return res.status(400).json({ sucess: false, message: 'ID do paciente é obrigatório' });

        const sortParam = req.query.sort;
        const area = req.query.area as string | undefined; // ← ADICIONAR ESTA LINHA
        
        const sort =
            sortParam === 'accuracy-asc' || sortParam === 'accuracy-desc'
                ? sortParam
                : 'recent';
        
        const sessions = await OcpService.listSessionsByClient(clientId, sort, area); // ← PASSAR 'area'
        return res.json ({ data: OcpNormalizer.mapSessionList(sessions) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Erro ao  buscar sessões do cliente' });
    }
}
```

### 3. **Service** - Filtrar no Prisma
📁 `backend/src/features/olp/olp.service.ts` (linha ~284)

```typescript
export async function listSessionsByClient(
    clientId: string,
    sort: SessionSort = 'recent',
    area?: string // ← ADICIONAR PARÂMETRO
) {
    const sessions = await prisma.sessao.findMany({
        where: { 
            cliente_id: clientId,
            ...(area && { area }) // ← FILTRAR POR ÁREA SE FORNECIDO
        },
        select: {
            id: true,
            cliente_id: true,
            terapeuta_id: true,
            data_criacao: true,
            observacoes_sessao: true,
            area: true, // ← SELECIONAR CAMPO AREA
            ocp: {
                select: {
                    id: true,
                    nome_programa: true,
                    objetivo_programa: true,
                    criado_em: true,
                },
            },
            trials: {
                select: {
                    id: true,
                    ordem: true,
                    resultado: true,
                    estimulosOcp: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                },
                orderBy: { ordem: 'asc' },
            },
        },
        orderBy: { data_criacao: 'desc' },
    });

    // ... resto do código de ordenação
}
```

### 4. **Types** - Adicionar `area` ao type
📁 `backend/src/features/olp/types/olp.types.ts`

```typescript
export type SessionDTO = {
    id: number;
    cliente_id: string;
    terapeuta_id: string;
    data_criacao: Date;
    observacoes_sessao: string | null;
    area: string; // ← ADICIONAR
    ocp: {
        id: number;
        nome_programa: string;
        objetivo_programa: string | null;
        criado_em: Date;
    } | null;
    trials: Array<{
        id: number;
        ordem: number;
        resultado: string;
        estimulosOcp: {
            id: number;
            nome: string | null;
        } | null;
    }>;
};

export type Session = {
    id: string;
    pacienteId: string;
    terapeutaId: string;
    data: string;
    programa: string;
    objetivo: string;
    prazoInicio: string;
    prazoFim: string | null;
    observacoes: string | null;
    area: string; // ← ADICIONAR
    registros: Array<{
        tentativa: number;
        resultado: 'acerto' | 'erro' | 'ajuda';
        stimulusId?: string;
        stimulusLabel?: string;
    }>;
};
```

## ✨ Benefícios
- ✅ Filtro no banco (performance)
- ✅ Índices já existem: `@@index([cliente_id, area])` e `@@index([area])`
- ✅ Frontend recebe apenas sessões da área correta
- ✅ 66% menos dados trafegados (1 de 3 áreas)

## 🚀 Deploy
Frontend já preparado. Deploy backend primeiro ou simultaneamente.
