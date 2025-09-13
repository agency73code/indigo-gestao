import React, { useMemo } from "react";
import { defineAbilityFor } from "./ability";
import { useAuth } from "../hooks/useAuth";
import { AbilityContext } from './AbilityContext';

export const AbilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    const ability = useMemo(() => defineAbilityFor(user?.perfil_acesso), [user?.perfil_acesso]);

    return (
        <AbilityContext.Provider value={ability}>
            {children}
        </AbilityContext.Provider>
    );
}

