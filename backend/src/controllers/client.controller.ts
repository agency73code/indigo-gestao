import type { Request, Response, NextFunction } from "express";
import * as clientService from "../features/client/client.service.js";
import { sendWelcomeEmail } from "../utils/mail.util.js";

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID inválido' });

    const data = await clientService.getById(id);
    if (!data) return res.status(404).json({ success: false, message: 'Cliente não encontrado' });

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clientService.list();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const client = await clientService.create(req.body);

    await sendWelcomeEmail({
        to: client.email_contato,
        name: client.nome,
        token: client.token_redefinicao!,
    }).catch((error) => {
        console.error('Erro ao enviar email de boas-vindas:', error);
    });

    res.status(201).json({ success: true, message: 'Cliente cadastrado com sucesso!' });
  } catch (err) {
    next(err);
  }
}