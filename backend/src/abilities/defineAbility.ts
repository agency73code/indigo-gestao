import { AbilityBuilder, PureAbility, type AbilityClass } from "@casl/ability";

export type Actions = 'manage' | 'read';
export type Subjects = 'Cadastro' | 'Dashboard' | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;
const AppAbility = PureAbility as AbilityClass<AppAbility>;

export function defineAbilityFor(perfil_acesso?: string) {
    const { can, build } = new AbilityBuilder(AppAbility);

    if (perfil_acesso === 'gerente') {
        can('manage', 'Cadastro');
    }

    can('read', 'Dashboard');

    return build();
}