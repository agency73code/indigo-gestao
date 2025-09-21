import type { ReactNode } from "react"
import { useAbility } from "../abilities/useAbility"
import { Navigate } from "react-router-dom"
import type { Actions, Subjects } from "../abilities/ability"

interface RequireAbilityProps {
    action: Actions
    subject: Subjects
    children: ReactNode
}

export function RequireAbility({ action, subject, children }: RequireAbilityProps) {
    const ability = useAbility()

    if (!ability.can(action, subject)) {
        return <Navigate to='/403' replace />
    }

    return <>{children}</>
}
