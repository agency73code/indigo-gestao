import type { Request, Response, NextFunction } from "express";
import * as clientService from "../features/client/client.service.js";
import * as clientNormalize from "../features/client/client.normalizer.js";
import { sendWelcomeEmail } from "../utils/mail.util.js";
import * as clientSchema from "../schemas/client.schema.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = clientSchema.ClientSchema.parse(req.body);
    const client = await clientService.create(parsed);

    if (!client) return res.status(500).json({ success: false, message: 'Erro ao cadastrar cliente' });
    if (!client.emailContato) return res.status(422).json({ success: false, message: 'Email de contato é obrigatório!' });
    if (!client.nome) return res.status(422).json({ success: false, message: 'Nome do cliente é obrigatório!' });

    await sendWelcomeEmail({
        to: client.emailContato,
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

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ success: false, message: 'ID inválido' });

    // const parsed = clientSchema.UpdateClientSchema.parse(req.body);
    // if (Object.keys(parsed).length === 0) {
    //   return res.status(400).json({ success: false, message: 'Nenhum dado fornecido para atualização' });
    // }
    const updated = await clientService.update(id, req.body);

    return res.json({ success: true, message: 'Cliente atualizado com sucesso!', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function getClientReport(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clientService.getClientReport();
    res.json({ data })
  } catch (err) {
    next(err);
  }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await clientService.list();
    const normalized = await clientNormalize.normalizeList(data);

    res.json({ success: true, normalized });
  } catch (err) {
    next(err);
  }
}

export async function countActiveClients(req: Request, res: Response, next: NextFunction) {
  try {
    const total = await clientService.countActiveClients();

    res.json({ success: true, data: total });
  } catch (error) {
    next(error);
  }
}