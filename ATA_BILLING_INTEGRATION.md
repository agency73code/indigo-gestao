# Integração de Faturamento (Ata -> Back)

## Dados novos (somente o que NÃO existe no banco para ATA)
Adicionar na tabela `ata_reuniao`:
- `tipo_faturamento` (string)
- `observacao_faturamento` (text)
- `tem_ajuda_custo` (boolean)
- `motivo_ajuda_custo` (text)

Adicionar na enum `ata_finalidade_reuniao`: ok
- `supervisao_recebida`
- `desenvolvimento_materiais`

Adicionar tabela para comprovantes de ajuda de custo da ata:
- `ata_comprovante_ajuda_custo`
  - `id`, `ata_reuniao_id` (FK), `nome`, `tipo`, `tamanho`, `url`, `arquivo_id`, `criado_em`

> Observação: a ata NÃO envia valor de ajuda de custo. Apenas Sim/Não + motivo + comprovantes.

---

## Onde está no front (paths)
- Componente: `frontend/src/features/atas-reuniao/components/AtaBillingData.tsx`
- Types: `frontend/src/features/atas-reuniao/types/billing.ts`
- Hook/form: `frontend/src/features/atas-reuniao/hooks/useAtaForm.ts`
- Service/API: `frontend/src/features/atas-reuniao/services/atas.service.ts`
- Contract API: `frontend/src/features/atas-reuniao/services/atas.api-contract.ts`

---

## Payload enviado (Create/Update ATA)
FormData:
- `payload` (JSON)
  - campos da ata (data, horários, participantes, etc.)
- `data` (JSON)
  - `faturamento`: {
      `tipoFaturamento`,
      <!-- `observacaoFaturamento`, campo não preenchivel só não importa -->
      `temAjudaCusto`,
      `motivoAjudaCusto`
    }
- arquivos:
  - anexos da ata: `files[ID]` + `fileNames[ID]`
  - comprovantes da ajuda de custo: `billingFiles[ID]` + `billingFileNames[ID]`

---

## O que o backend precisa fazer (somente ATA)
1. Criar colunas na tabela `ata_reuniao` para os 4 campos acima.
2. Adicionar as duas novas finalidades na enum do banco.
3. Criar tabela de comprovantes para ajuda de custo da ata.
4. Ler `data.faturamento` (JSON) e persistir:
  - `tipo_faturamento`, `observacao_faturamento`, `tem_ajuda_custo`, `motivo_ajuda_custo`.
5. Persistir `billingFiles[]` na nova tabela de comprovantes.
6. Retornar esses campos na resposta de ATA (GET/POST/PATCH) e `arquivos_faturamento`.
