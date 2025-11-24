# Estratégia de Separação de Áreas - Solução Completa

## 🎯 Problema Identificado

Múltiplas áreas (Fono, Psico, ABA, TO, etc.) compartilham:
- ✅ Mesmos componentes (reutilização)
- ❌ Mesmas rotas URL (não diferencia área)
- ❌ Mesmo estado global (dados misturados)
- ❌ Header não atualiza ao trocar área
- ❌ Sidebar destaca múltiplas áreas simultaneamente
- ❌ Backend não sabe de qual área vieram os dados

## ✅ Solução Implementada

### 1. **Context de Área Global** (`AreaContext.tsx`)

**O que faz:**
- Rastreia qual área está ativa (Fono, Psico, TO, etc.)
- Sincroniza com URL e localStorage
- Fornece hooks para componentes acessarem área atual

**Como usar:**
```tsx
import { useArea, useCurrentArea } from '@/contexts/AreaContext';

// No componente
const { currentArea, getAreaLabel } = useArea();
const area = useCurrentArea('fonoaudiologia'); // com fallback
```

### 2. **Utilitários de Rota** (`areaRoutes.ts`)

**Funções criadas:**

```typescript
// Construir rotas com área
buildAreaRoute('fonoaudiologia', '/programas/novo')
// => '/app/programas/fonoaudiologia/novo'

// Adicionar área em API
addAreaToApiUrl('/api/programs', 'fonoaudiologia')
// => '/api/programs?area=fonoaudiologia'

// Adicionar área em headers HTTP
addAreaToHeaders({}, 'fonoaudiologia')
// => { 'X-Area': 'fonoaudiologia' }
```

## 📋 Plano de Implementação (PASSO A PASSO)

### **FASE 1: Configuração Inicial**

#### 1.1 Adicionar Provider no App
```tsx
// frontend/src/main.tsx ou App.tsx
import { AreaProvider } from '@/contexts/AreaContext';

<AreaProvider>
  <RouterProvider router={router} />
</AreaProvider>
```

#### 1.2 Atualizar Rotas (routes.tsx)

**ANTES:**
```tsx
{
  path: 'programas/lista',
  element: <ConsultaOcpPage />
}
```

**DEPOIS (opção 1 - param direto):**
```tsx
{
  path: 'programas/:area/lista',
  element: <ConsultaOcpPage />
}
// URLs: /app/programas/fonoaudiologia/lista
//       /app/programas/psicoterapia/lista
```

**OU DEPOIS (opção 2 - manter compatibilidade):**
```tsx
// Rota padrão (detecta área do context)
{
  path: 'programas/lista',
  element: <ConsultaOcpPage />
},
// Rotas específicas (sobrescrevem)
{
  path: 'programas/fonoaudiologia/lista',
  element: <ConsultaOcpPage />
},
{
  path: 'programas/psicoterapia/lista',
  element: <ConsultaOcpPage />
}
```

### **FASE 2: Atualizar Hubs**

#### 2.1 Hub Fono/Psico (HubPage.tsx)

```tsx
import { useArea } from '@/contexts/AreaContext';
import { buildAreaRoute } from '@/utils/areaRoutes';

export default function HubPage() {
  const { currentArea, setCurrentArea } = useArea();
  
  // Definir área padrão quando acessar hub
  useEffect(() => {
    if (!currentArea) {
      setCurrentArea('fonoaudiologia');
    }
  }, []);
  
  const mainActions = [
    {
      title: 'Criar Programa',
      href: buildAreaRoute(currentArea || 'fonoaudiologia', 'novo'),
      // href será: /app/programas/fonoaudiologia/novo
    },
    {
      title: 'Consultar Programas',
      href: buildAreaRoute(currentArea || 'fonoaudiologia', 'lista'),
      // href será: /app/programas/fonoaudiologia/lista
    },
    // ... outros cards
  ];
}
```

#### 2.2 Hub TO (AreaHubTOPage.tsx)

```tsx
export default function AreaHubTOPage() {
  const { setCurrentArea } = useArea();
  
  useEffect(() => {
    setCurrentArea('terapia-ocupacional');
  }, []);
  
  // Resto do código igual
}
```

### **FASE 3: Atualizar Componentes de Formulário**

#### 3.1 CadastroOcpPage (criar programa)

```tsx
import { useCurrentArea } from '@/contexts/AreaContext';
import { addAreaToApiUrl } from '@/utils/areaRoutes';

export default function CadastroOcpPage() {
  const area = useCurrentArea();
  
  const handleSave = async (data) => {
    // Opção 1: Query parameter
    const url = addAreaToApiUrl('/api/programs', area);
    await fetch(url, { method: 'POST', body: JSON.stringify(data) });
    
    // Opção 2: Header HTTP
    await fetch('/api/programs', {
      method: 'POST',
      headers: addAreaToHeaders({ 'Content-Type': 'application/json' }, area),
      body: JSON.stringify(data)
    });
    
    // Opção 3: Incluir no body
    await fetch('/api/programs', {
      method: 'POST',
      body: JSON.stringify({ ...data, area })
    });
  };
}
```

#### 3.2 ConsultaOcpPage (listar programas)

```tsx
export default function ConsultaOcpPage() {
  const area = useCurrentArea();
  
  useEffect(() => {
    // Buscar apenas programas da área atual
    const url = addAreaToApiUrl('/api/programs', area);
    fetch(url).then(res => res.json()).then(setPrograms);
  }, [area]);
}
```

### **FASE 4: Atualizar Header**

```tsx
// AppLayout.tsx ou Header.tsx
import { useArea } from '@/contexts/AreaContext';

export function Header() {
  const { getAreaLabel } = useArea();
  
  return (
    <header>
      <h1>{getAreaLabel()}</h1>
      {/* Mostrará: "Fonoaudiologia" ou "Psicoterapia" automaticamente */}
    </header>
  );
}
```

### **FASE 5: Atualizar Sidebar**

```tsx
// app-sidebar.tsx
import { useArea } from '@/contexts/AreaContext';

export function AppSidebar() {
  const { currentArea, isAreaActive } = useArea();
  
  return (
    <nav>
      <NavItem 
        href="/app/programas/fono-psico"
        active={isAreaActive('fonoaudiologia')}
        onClick={() => setCurrentArea('fonoaudiologia')}
      >
        Fonoaudiologia
      </NavItem>
      
      <NavItem 
        href="/app/programas/psicoterapia"
        active={isAreaActive('psicoterapia')}
        onClick={() => setCurrentArea('psicoterapia')}
      >
        Psicoterapia
      </NavItem>
    </nav>
  );
}
```

## 🔧 Como o Backend Receberá a Área

### Opção 1: Query Parameter (Recomendado)
```
GET /api/programs?area=fonoaudiologia
POST /api/programs?area=psicoterapia
```

### Opção 2: Header HTTP
```
GET /api/programs
Headers: { X-Area: 'fonoaudiologia' }
```

### Opção 3: Body (apenas POST/PUT)
```json
{
  "name": "Programa Fono",
  "area": "fonoaudiologia",
  "stimuli": [...]
}
```

## 🎨 Fluxo Completo de Uso

### Cenário: Usuário cria programa de Fono

1. **Usuário clica** "Fonoaudiologia" na sidebar
   - `setCurrentArea('fonoaudiologia')` é chamado
   - localStorage salva: `currentArea: 'fonoaudiologia'`
   - Sidebar destaca apenas Fono

2. **Usuário clica** "Criar Programa"
   - Navega para: `/app/programas/fonoaudiologia/novo`
   - AreaContext detecta 'fonoaudiologia' na URL
   - Header mostra: "Fonoaudiologia"

3. **Usuário preenche** formulário e salva
   - POST `/api/programs?area=fonoaudiologia`
   - Backend salva com área associada

4. **Usuário clica** "Psicoterapia"
   - `setCurrentArea('psicoterapia')` é chamado
   - Header atualiza para: "Psicoterapia"
   - Sidebar destaca apenas Psico

5. **Usuário acessa** "Consultar Programas"
   - GET `/api/programs?area=psicoterapia`
   - Lista **apenas** programas de Psico
   - Programas de Fono **não aparecem**

## ✅ Checklist de Implementação

- [ ] Adicionar `AreaProvider` no App
- [ ] Atualizar rotas com `:area` parameter
- [ ] Modificar HubPage para usar `useArea`
- [ ] Modificar AreaHubTOPage para definir área
- [ ] Atualizar CadastroOcpPage (formulário)
- [ ] Atualizar ConsultaOcpPage (listagem)
- [ ] Atualizar DetalheProgramaPage
- [ ] Atualizar EditarProgramaPage
- [ ] Atualizar Header para mostrar área
- [ ] Atualizar Sidebar para destacar área correta
- [ ] Testar fluxo completo Fono
- [ ] Testar fluxo completo Psico
- [ ] Testar fluxo completo TO
- [ ] Validar que dados não se misturam

## 🚀 Próximos Passos

1. **Implementar AreaProvider no root**
2. **Escolher estratégia de rota** (param ou compatibilidade)
3. **Atualizar hubs primeiro** (quick win)
4. **Migrar componentes gradualmente**
5. **Testar isolamento de dados**
6. **Preparar backend** para receber área

## 📝 Notas Importantes

- ✅ **Não quebra código existente** - Context retorna null se não houver área
- ✅ **Mantém reutilização** - Mesmos componentes, diferentes áreas
- ✅ **Backend preparado** - Três formas de receber área
- ✅ **Testável** - Cada área funciona independentemente
- ✅ **Escalável** - Adicionar nova área é só incluir no enum

---

**Criado em**: 24/11/2025  
**Objetivo**: Separar dados entre áreas mantendo reutilização de componentes
