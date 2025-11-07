import { getTherapistData } from "../cache/therapistCache.js";
import { AppError } from "../errors/AppError.js";
import { ACCESS_LEVELS } from "./accessLevels.js";
import { defineAbilityFor } from "../abilities/defineAbility.js";
import { prisma } from "../config/database.js";

export async function getVisibleTherapistIds(therapistId: string): Promise<string[]> {
  const registers = await getTherapistData(therapistId);
  if (!registers.length) {
    throw new AppError(
      'REQUIRED_THERAPIST_REGISTER',
      'Terapeuta sem registro profissional.',
      400
    );
  }

  // --- Normaliza e identifica o maior nível de acesso ---
  const cargos = registers
    .map(r =>
      r.cargo?.nome
        ?.toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
    )
    .filter(Boolean);

  const maxLevel = Math.max(...cargos.map(c => ACCESS_LEVELS[c!] ?? 0));
  const ability = defineAbilityFor(cargos[0]!);

  // --- Sem permissão CASL ---
  if (!ability.can('read', 'Consultar')) return [];

  // --- Nível administrativo total ---
  if (maxLevel >= 5)  return [];

  // --- Nível intermediário (coordenação/supervisão) ---
  // Uma única query para cada nível hierárquico
  const firstLevel = await prisma.vinculo_supervisao.findMany({
    where: { supervisor_id: therapistId },
    select: { clinico_id: true },
  });

  const firstIds = firstLevel.map(v => v.clinico_id);

  let secondIds: string[] = [];
  if (maxLevel === 4 && firstIds.length > 0) {
    const secondLevel = await prisma.vinculo_supervisao.findMany({
      where: { supervisor_id: { in: firstIds } },
      select: { clinico_id: true },
    });
    secondIds = secondLevel.map(v => v.clinico_id);
  }

  // --- Junta todos os IDs ---
  const allIds = new Set<string>([therapistId, ...firstIds, ...secondIds]);

  // --- Níveis clínico/AT: só ele mesmo ---
  if (maxLevel <= 2) return [therapistId];

  return Array.from(allIds);
}
