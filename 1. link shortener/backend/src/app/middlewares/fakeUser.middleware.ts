import { Request, Response, NextFunction } from "express";

export function fakeUser(req: any, res: Response, next: NextFunction) {
    req.user = { id: 1 }; // usuario fijo mientras no hay auth
    next();
}
