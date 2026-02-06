import { AppError } from "./AppError.js";

export const forbidden = () =>
    new AppError('FORBIDDEN', 'Sem permissão para baixar este arquivo', 403);