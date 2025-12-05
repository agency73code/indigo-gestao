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
    const { can, build } = new AbilityBuilder(AppAbility);

    const role = perfil_acesso?.toLocaleLowerCase() ?? '';
    const level = ACCESS_LEVELS[role] ?? 0;

    // 🧭 Todos podem acessar o Dashboard
    can('read', 'Dashboard');

    // 👥 Ats veem seus clientes (Consultar)
    if (level >= 1) {
        can('read', 'Consultar');
        can('read', 'Vinculos');
    }

    // 👥 Supervisores e terapeutas clínicos podem criar/editar clientes
    if (level >= 2 && level < 5) {
        can('create', 'Cadastro');
        can(['update', 'read'], 'Consultar');
    }

    if (level >= 4) {
        can('create', 'Vinculos');
    }

    // 🧑‍💼 Gerentes e coordenadores executivos têm acesso completo
    if (level >= 5) {
        can('manage', 'all');
    }

    // 🔧 Acesso geral a módulos administrativos
    can('manage', ['Programas', 'Faturamento', 'Configuração']);

    return build({
        detectSubjectType: (object: { type?: Subjects }) => object?.type as Subjects,
    });
}
