# Guia de Impressão - Relatório Geral

## 📋 Atributos `data-*` para Controle de Layout no PDF

### 🎯 Estrutura Básica

```tsx
<ReportExporter
  header={<CabecalhoPrograma />}
  reportTitle="Relatório Geral — Programas & Objetivos"
  documentTitle="relatorio_cliente_nome"
>
  {/* Conteúdo aqui */}
</ReportExporter>
```

---

## 🔧 Atributos Disponíveis

### `data-print-kpi-grid` - Grid de KPIs 4×1
Força 4 KPIs em uma única linha (layout desktop) no PDF.

```tsx
<section data-print-block data-print-kpi-grid>
  <KpiAcerto />
  <KpiIndependencia />
  <KpiTentativas />
  <KpiSessoes />
</section>
```

### `data-print-chart` - Gráficos em largura desktop
Aplica largura máxima (198mm) para gráficos ocuparem toda a página.

```tsx
<section data-print-block data-print-wide>
  <div data-print-chart>
    <EvolucaoDesempenhoChart />
  </div>
</section>
```

### `data-print-wide` - Cards/blocos em largura completa
Para qualquer seção que deve ocupar a largura máxima.

```tsx
<section data-print-block data-print-wide>
  <EstimulosAtencaoCard />
</section>
```

### `data-print-block` - Previne corte de conteúdo
Impede que o bloco seja cortado entre páginas.

```tsx
<section data-print-block>
  {/* Conteúdo que não pode ser cortado */}
</section>
```

### `data-print-program-header` - Cabeçalho do programa
Marca o cabeçalho principal (impede quebra de página depois).

```tsx
<div data-print-program-header data-print-block>
  <CabecalhoPrograma />
</div>
```

---

## 👁️ Controle de Visibilidade

### `no-print` - Ocultar no PDF
Elementos que NÃO devem aparecer no PDF.

```tsx
{/* Filtros interativos - só na tela */}
<div className="no-print">
  <FiltrosAvancados />
</div>

{/* Botões de ação */}
<Button className="no-print">Limpar Filtros</Button>
```

### `data-print-only` - Apenas no PDF
Elementos que SÓ aparecem no PDF.

```tsx
{/* Resumo de filtros - só no PDF */}
<div data-print-only data-print-filters-summary data-print-block>
  <span className="chip">Período: Últimos 30 dias</span>
  <span className="chip">Programa: Alfabetização</span>
  <span className="chip">Terapeuta: Dr. João</span>
</div>
```

### `data-print-hide-in-filters` - Ocultar botões nos filtros
Para esconder controles interativos dentro de blocos de filtros.

```tsx
<div data-print-hide-in-filters>
  <Button>Trocar Cliente</Button>
  <Button>Limpar Filtros</Button>
</div>
```

---

## 📝 Exemplo Completo de Uso

```tsx
<ReportExporter
  header={
    <div data-print-program-header>
      <CabecalhoCliente 
        cliente={cliente}
        programa={programa}
      />
      {/* Botões ficam ocultos no PDF */}
      <div className="no-print">
        <Button>Trocar Cliente</Button>
        <Button>Limpar Filtros</Button>
      </div>
    </div>
  }
  reportTitle="Relatório Geral — Programas & Objetivos"
  documentTitle={`relatorio_${cliente.nome.replace(/\s+/g, "_")}`}
>
  {/* 1. Filtros: UI interativa (só tela) */}
  <div className="no-print">
    <FiltrosAvancados />
  </div>

  {/* 2. Resumo de filtros (só PDF) */}
  <div data-print-only data-print-filters-summary data-print-block>
    <span className="chip">Período: {periodo}</span>
    <span className="chip">Programa: {programa}</span>
    <span className="chip">Estímulo: {estimulo}</span>
    <span className="chip">Terapeuta: {terapeuta}</span>
  </div>

  {/* 3. KPIs em grid 4×1 */}
  <section data-print-block data-print-kpi-grid>
    <KpiAcerto valor={92.5} />
    <KpiIndependencia valor={78.3} />
    <KpiTentativas valor={2.8} />
    <KpiSessoes valor={45} />
  </section>

  {/* 4. Gráfico de evolução */}
  <section data-print-block data-print-wide>
    <div data-print-chart>
      <EvolucaoDesempenhoChart dados={dados} />
    </div>
  </section>

  {/* 5. Estímulos que precisam de atenção */}
  <section data-print-block data-print-wide>
    <EstimulosAtencaoCard estimulos={estimulosAtencao} />
  </section>

  {/* 6. Prazo do programa */}
  <section data-print-block data-print-wide>
    <PrazoProgramaCard 
      dataInicio={programa.dataInicio}
      dataFim={programa.dataFim}
    />
  </section>
</ReportExporter>
```

---

## 🎨 Estilos para Chips (Resumo de Filtros)

Se você quiser personalizar os chips do resumo de filtros, adicione:

```tsx
<div 
  data-print-only 
  data-print-filters-summary 
  data-print-block
  className="hidden" // Oculto na tela
>
  <span className="chip">Período: {periodo}</span>
  <span className="chip">Programa: {programa}</span>
</div>
```

O CSS de print já define os estilos dos `.chip`:
- `padding: 2mm 3mm`
- `border-radius: 6px`
- `border: 1px solid rgba(0,0,0,.12)`
- `margin: 0 2mm 2mm 0`
- `font-size: 12px`

---

## ✅ Checklist de Implementação

- [ ] Adicionar `data-print-kpi-grid` na grid dos 4 KPIs
- [ ] Adicionar `data-print-chart` no container do gráfico principal
- [ ] Adicionar `data-print-wide` em cards/blocos que devem ocupar largura completa
- [ ] Adicionar `data-print-block` em todas as seções
- [ ] Adicionar `className="no-print"` em filtros interativos
- [ ] Adicionar `className="no-print"` em botões de ação
- [ ] Criar resumo de filtros com `data-print-only data-print-filters-summary`
- [ ] Adicionar `data-print-program-header` no cabeçalho do programa
- [ ] Testar impressão e verificar layout desktop
- [ ] Verificar que não há scrollbars no PDF
- [ ] Verificar que KPIs ficam em 4 colunas
- [ ] Verificar que gráficos não são cortados

---

## 🐛 Troubleshooting

### Problema: KPIs ainda aparecem em 2 colunas
**Solução:** Verifique se o `data-print-kpi-grid` está no wrapper direto dos 4 KPIs.

### Problema: Gráfico sai pequeno/cortado
**Solução:** Adicione `data-print-chart` E `data-print-wide` nos containers.

### Problema: Ainda aparecem scrollbars
**Solução:** Verifique se há `overflow-*` inline styles. Adicione `!important` se necessário.

### Problema: Layout "tablet" persiste
**Solução:** Certifique-se de que `data-print-root` está no elemento raiz do `ReportExporter`.

---

## 📱 Instruções para o Usuário

Ao imprimir o relatório no Chrome:

1. Clique em **"Exportar Relatório (PDF)"**
2. No diálogo de impressão:
   - ✅ **Desmarque** "Cabeçalhos e rodapés"
   - ✅ Mantenha "Gráficos de fundo" marcado
   - ✅ Selecione "Salvar como PDF"
3. Clique em **"Salvar"**

Isso garante que:
- ❌ Não apareça URL/data do navegador
- ✅ Cores e gráficos sejam preservados
- ✅ Layout fique em desktop (4 KPIs por linha)
