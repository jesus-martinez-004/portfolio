import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../core/services/auth.service";

const authService = new AuthService();

export interface RequestWithUser extends Request {
    user?: { id: number; email?: string };
}

export async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Token no provisto" });
        }

        const token = header.split(" ")[1];
        try {
            const decoded = authService.verifyAccessToken(token);
            req.user = { id: decoded.id, email: decoded.email };
            return next();
        } catch (err) {
            return res.status(401).json({ error: "Token inválido o expirado" });
        }
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "Error de auth" });
    }
}
