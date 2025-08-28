import { saveTherapist } from "../models/therapist.model.js";
import type { Request, Response } from "express";
import { sendWelcomeEmail } from "../utils/mail.util.js";
import { therapistSchema } from "../schemas/therapist.schema.js";

export async function createTherapist(req: Request, res: Response) {
    try {
        const data = therapistSchema.parse(req.body);
        const therapist = await saveTherapist(data);

        await sendWelcomeEmail({
            to: therapist.email,
            name: therapist.nome,
            token: therapist.token_redefinicao!,
        });

        res.send({ message: "Terapeuta cadastro com sucesso!" });
    } catch (err: any) {
        res.status(500).send({ error: `Erro ao cadastrar terapeuta: ${err.message}` });
    }
}