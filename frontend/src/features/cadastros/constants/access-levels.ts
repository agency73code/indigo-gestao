/**
 * Níveis de acesso por cargo
 * 
 * Níveis >= 3: Supervisores (aparecem com fundo azul nos cards)
 * Níveis <= 2: Terapeutas operacionais (aparecem com borda branca nos cards)
 */
export const ACCESS_LEVELS: Record<string, number> = {
  'Acompanhante Terapêutico': 1,
  'Terapeuta Clínico': 2,
  'Mediador de Conflitos': 2,
  'Professor UniIndigo': 2,
  'Coordenador ABA': 3,
  'Terapeuta Supervisor': 4,
  'Supervisor ABA': 4,
  'Gerente': 5,
  'Coordenador Executivo': 6,
};

/**
 * Verifica se um cargo tem nível de supervisor (>= 3)
 * @param cargo - Nome do cargo
 * @returns true se o cargo é de nível supervisor
 */
export function isSupervisorRole(cargo: string): boolean {
  const level = ACCESS_LEVELS[cargo];
  return level !== undefined && level >= 3;
}

/**
 * Obtém o nível de acesso de um cargo
 * @param cargo - Nome do cargo
 * @returns Nível de acesso (1-6) ou 0 se não encontrado
 */
export function getAccessLevel(cargo: string): number {
  return ACCESS_LEVELS[cargo] ?? 0;
}
