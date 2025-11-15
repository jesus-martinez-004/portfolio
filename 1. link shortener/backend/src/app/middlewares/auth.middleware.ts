// src/app/middlewares/hybridAuth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../core/services/auth.service";
import { ApiKeyService } from "../../core/services/apiKey.service";

const authService = new AuthService();
const apiKeyService = new ApiKeyService();

export interface RequestWithUser extends Request {
    user?: {
        id: number;
        email?: string;
        via?: "jwt" | "api-key";
        apiKeyId?: number;
    };
}

export async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
        // =========================
        // 1) Prioridad: API KEY
        // =========================
        const apiKeyHeader =
            req.headers["x-api-key"] ||
            req.headers["x-apikey"] ||
            req.headers["apikey"] ||
            req.query["x-api-key"]?.toString() ||
            req.query["x-apikey"]?.toString() ||
            req.query["apikey"]?.toString();

        if (apiKeyHeader && typeof apiKeyHeader === "string") {
            const apiKey = await apiKeyService.authenticateApiKey(apiKeyHeader);

            if (!apiKey) {
                return res.status(401).json({ error: "API key inválida" });
            }

            req.user = {
                id: apiKey.userId,
                via: "api-key",
                apiKeyId: apiKey.id,
            };

            return next();
        }

        // =========================
        // 2) JWT regular
        // =========================
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No autorizado" });
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = authService.verifyAccessToken(token);
            req.user = {
                id: decoded.id,
                email: decoded.email,
                via: "jwt",
            };
            return next();
        } catch {
            return res.status(401).json({ error: "Token inválido o expirado" });
        }
    } catch (err: any) {
        return res.status(500).json({ error: err.message || "Error de autenticación" });
    }
}
