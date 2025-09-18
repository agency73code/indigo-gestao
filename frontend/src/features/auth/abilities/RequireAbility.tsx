import type { PropsWithChildren } from "react";
import { useAbility } from "@/features/auth/abilities/useAbility";
import type { Actions, Subjects } from "@/features/auth/abilities/ability";

type RequireAbilityProps = {
    action: Actions;
    subject: Subjects;
    fallback?: React.ReactNode;
};

export function RequireAbility({ action, subject, fallback = null, children }: PropsWithChildren<RequireAbilityProps>) {
    const ability = useAbility();

    if(!ability.can(action, subject)) {
        return <>{fallback}</>;
    }

    return<>{children}</>;
}