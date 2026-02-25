import { AbilityBuilder, PureAbility, type AbilityClass } from '@casl/ability';
import { ACCESS_LEVELS } from '../utils/accessLevels.js';

export type Actions = 'read' | 'create' | 'update' | 'manage';
export type Subjects =
    | 'all'
    | 'Dashboard'
    | 'Cadastro'
    | 'Consultar'
    | 'Programas'
    | 'Faturamento'
    | 'Configuração'
    | 'Vinculos';

export type AppAbility = PureAbility<[Actions, Subjects]>;
const AppAbility = PureAbility as AbilityClass<AppAbility>;

export function defineAbilityFor(perfil_acesso?: string) {
    const role = normalizeRole(perfil_acesso);
    const level = ACCESS_LEVELS[role] ?? 0;
    return defineAbilityForLevel(level);
}

export function defineAbilityForLevel(level: number) {
    const { can, build } = new AbilityBuilder(AppAbility);

    // 🧭 Todos podem acessar o Dashboard
    can('read', 'Dashboard');

    // 👥 Ats veem seus clientes (Consultar)
    if (level >= 1) {
        can('read', 'Consultar');
        can('read', 'Vinculos');
    }

    // 👥 Terapeutas clínicos: podem ler/atualizar consultar e criar/editar programas
    if (level >= 2) {
        can(['update', 'read'], 'Consultar');
        can('create', 'Programas');
        can('update', 'Programas');
    }

    // 👥 Coordenadores e acima: podem criar e editar clientes
    if (level >= 3) {
        can('create', 'Cadastro');
        can('update', 'Cadastro');
    }

    if (level >= 4) {
        can('create', 'Vinculos');
        can('manage', ['Programas', 'Faturamento', 'Configuração'])
    }

    // 🧑‍💼 Gerentes e coordenadores executivos têm acesso completo
    if (level >= 5) {
        can('manage', 'all');
    }

    // 🔧 Acesso geral a módulos administrativos
    can('read', ['Programas', 'Faturamento', 'Configuração']);

    return build({
        detectSubjectType: (object: { type?: Subjects }) => object?.type as Subjects,
    });
}

function normalizeRole(role?: string): string {
  return (role ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}