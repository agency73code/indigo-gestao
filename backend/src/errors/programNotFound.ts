import { AppError } from "./AppError.js";

export const programNotFound = () =>
    new AppError(
        'PROGRAM_NOT_FOUND',
        'Programa não encontrado ou indisponível.',
        404
    );