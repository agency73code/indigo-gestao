import { PureAbility, AbilityBuilder } from "@casl/ability";

type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete';
type Subjects = 'cliente' | 'terapeuta' | 'gerente' | 'all';

export type AppAbility = PureAbility<[Actions, Subjects]>;

export function defineAbilityFor(user: { id: number; role: string }) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility)

    if (user.role === 'gerente') {
        can('manage', 'all');
    }

    if (user.role === 'terapeuta') {
        can('manage', 'cliente', { id: user.id });
        cannot('delete', 'cliente');
    }

    return build()
}
