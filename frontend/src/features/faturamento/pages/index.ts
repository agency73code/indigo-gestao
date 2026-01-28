/**
 * Páginas da feature Faturamento
 */

export { HubFaturamentoPage } from './HubFaturamentoPage';
export { MinhasHorasSessoesPage } from './MinhasHorasSessoesPage';
// Alias para compatibilidade
export { MinhasHorasSessoesPage as MinhasHorasPage } from './MinhasHorasSessoesPage';
export { GestaoHorasPage } from './GestaoHorasPage';

// Hub unificado do GERENTE (com tabs)
export { GestaoFaturamentoHub } from './GestaoFaturamentoHub';
// Alias para compatibilidade com routes.tsx
export { GestaoFaturamentoHub as GestaoFaturamentoPage } from './GestaoFaturamentoHub';

// Páginas antigas separadas (mantidas para compatibilidade, mas não usadas)
export { AprovarHorasPage } from './AprovarHorasPage';
export { HorasPorTerapeutaPage } from './HorasPorTerapeutaPage';
export { HorasPorClientePage } from './HorasPorClientePage';

