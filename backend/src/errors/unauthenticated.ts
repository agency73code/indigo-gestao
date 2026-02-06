import { AppError } from "./AppError.js";

export const unauthenticated = () =>
    new AppError('UNAUTHENTICATED', 'Não autenticado', 401);