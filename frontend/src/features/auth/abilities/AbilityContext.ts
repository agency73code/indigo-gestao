import { createContext } from "react";
import type { AppAbility } from "./ability";

export const AbilityContext = createContext<AppAbility | null>(null);