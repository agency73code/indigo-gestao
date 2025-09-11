import type { Request, Response, NextFunction } from "express";
import * as clientService from "../features/client/client.service.js";

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
    await clientService.create(req.body);
    res.status(201).json({ success: true, message: 'Terapeuta cadastrado com sucesso!' });
  } catch (err) {
    next(err);
  }
}