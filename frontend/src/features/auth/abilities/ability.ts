import { AbilityBuilder, type AbilityClass, PureAbility } from '@casl/ability';

export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'all' | 'Clientes' | 'Terapeutas' | 'Cadastro' | 'Dashboard';

export type AppAbility = PureAbility<[Actions, Subjects]>;
const AppAbility = PureAbility as AbilityClass<AppAbility>;

export function defineAbilityFor(perfil_acesso?: string) {
    const { can, build } = new AbilityBuilder(AppAbility);
    
    if (perfil_acesso === 'gerente') {
        can('manage', 'all');
    }

    can('read', 'all');
    return build()
}