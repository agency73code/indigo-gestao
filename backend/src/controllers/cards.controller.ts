import type { Request, Response, NextFunction } from "express";
import { getCardsOverview } from "../features/cards/cards.service.js";

export async function overview(req: Request, res: Response, next: NextFunction) {
    console.log(">>> overview chamado");
    try {
        const data = await getCardsOverview();
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}