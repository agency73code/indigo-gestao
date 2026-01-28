# Integração de Faturamento (Front -> Back)

## Dados incluídos (7 campos + anexos)
- dataSessao
- horarioInicio
- horarioFim
- tipoAtendimento (consultorio | homecare)
- ajudaCusto
- observacaoFaturamento
- arquivosFaturamento[]

## Onde está no front

### Componente principal
- frontend/src/features/programas/nova-sessao/components/SessionBillingData.tsx

### Tipos centralizados
- frontend/src/features/programas/core/types/billing.ts

### Payload de sessão (FormData)
- frontend/src/lib/api.ts
  - função: buildSessionFormData
  - envia JSON em "data" com campo "faturamento"
  - envia arquivos em "billingFiles" e meta em "billingFilesMeta"

### Serviços que enviam o payload
- frontend/src/features/programas/nova-sessao/services.ts (Fono/Psicopedagogia/ABA)
- frontend/src/features/programas/variants/terapia-ocupacional/session/services.ts
- frontend/src/features/programas/variants/fisioterapia/session/services.ts
- frontend/src/features/programas/variants/musicoterapia/session/services.ts

### Psicoterapia (Evolução)
- frontend/src/features/programas/variants/psicoterapia/services/psicoterapia.service.ts
  - envia payload em "payload" (JSON)
  - envia arquivos em "billingFiles[ID]" + "billingFileNames[ID]"

## Como o back deve ler

### Sessões (Fono/TO/Fisio/Musi)
**FormData**
- data (JSON)
  - faturamento: {
      dataSessao,
      horarioInicio,
      horarioFim,
      tipoAtendimento,
      ajudaCusto,
      observacaoFaturamento
    }
- billingFiles (arquivos)
- billingFilesMeta (JSON array com size e name)

### Psicoterapia (Evolução)
**FormData**
- payload (JSON)
  - faturamento: {
      data_sessao,
      horario_inicio,
      horario_fim,
      tipo_atendimento,
      ajuda_custo,
      observacao_faturamento
    }
- billingFiles[ID]
- billingFileNames[ID]

## Campos sugeridos para tabelas
### faturamento_sessao
- data_sessao
- horario_inicio
- horario_fim
- tipo_atendimento
- ajuda_custo
- observacao_faturamento
- ata_id
- referencia_sessao (FK) / referencia_evolucao (FK) / ATA (ata_id)

### arquivos_faturamento
- nome
- caminho
- tamanho
- mime_type
- faturamento_id (FK)

## Observações
- O front já envia os dados. O back precisa apenas ler e persistir.
- Validação sugerida: horarioFim > horarioInicio e ajudaCusto obrigatório apenas para homecare.
