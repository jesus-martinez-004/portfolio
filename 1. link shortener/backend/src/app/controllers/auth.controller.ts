// src/app/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../core/services/auth.service";

const authService = new AuthService();

export class AuthController {
    // ====================================
    // 🔹 Registrar usuario
    // POST /auth/register
    // ====================================
    static async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const user = await authService.register(email, password);

            // Remover contraseña
            const { password: _pw, ...safeUser } = user as any;

            return res.json(safeUser);
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Login
    // POST /auth/login
    // ====================================
    static async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;

            const data = await authService.login(email, password);

            return res.json(data);
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Refresh token
    // POST /auth/refresh
    // ====================================
    static async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            const tokens = await authService.refresh(refreshToken);

            return res.json(tokens);
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Logout
    // POST /auth/logout
    // ====================================
    static async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;

            await authService.logout(refreshToken);

            return res.json({ ok: true });
        } catch (err) {
            next(err);
        }
    }
}
