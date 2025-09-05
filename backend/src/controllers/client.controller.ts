import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { createCliente } from "../features/client/client.mapper.js";

const prisma = new PrismaClient();

export async function createClienteController(req: Request, res: Response, next: NextFunction) {
  try {
    const created = await createCliente(prisma, req.body);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}