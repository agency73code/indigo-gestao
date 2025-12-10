import 'express';

declare global {
    namespace Express {
        interface UserPayload {
            id: string;
            perfil_acesso?: string;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}

export {};
