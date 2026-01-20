import type { NextFunction, Request, Response } from "express";

export function createPsychotherapyRecord(req: Request, res: Response, next: NextFunction) {
    try {
        ///
        console.log(req.body)
        res.status(201).json({message: 'teste'});
    } catch (error) {
        next(error)
    }
}