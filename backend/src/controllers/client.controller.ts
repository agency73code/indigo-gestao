import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { createCliente } from "../features/client/client.mapper.js";
import { normalizer } from "../features/client/client.normalizer.js";

const prisma = new PrismaClient();

export async function createClienteController(req: Request, res: Response, next: NextFunction) {
  try {
    const normalized = await normalizer(req.body);
    const created = await createCliente(prisma, normalized);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}