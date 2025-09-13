import { useContext } from "react";
import { AbilityContext } from './AbilityContext';

export function useAbility() {
    const ctx = useContext(AbilityContext);
    if (!ctx) {
        throw new Error('useAbility must be used within AbilityProvider');
    }
    return ctx;
}