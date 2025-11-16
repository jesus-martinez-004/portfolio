// src/core/services/auth.service.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { UserRepository } from "../../infra/db/repositories/UserRepository";
import { ApiTokenRepository } from "../../infra/db/repositories/ApiTokenRepository";
import { JwtHandler } from "../../infra/security/jwt";

import {
    BadRequest,
    Unauthorized,
    Conflict,
    NotFound,
    InternalServerError,
} from "../../utils/AppError";

export class AuthService {
    private userRepo = new UserRepository();
    private apiTokenRepo = new ApiTokenRepository();

    private generateAccessToken(user: { id: number; email: string }) {
        try {
            return JwtHandler.signAccessToken(user);
        } catch (err) {
            throw InternalServerError("No se pudo generar el token de acceso");
        }
    }

    private generateRefreshToken() {
        try {
            return crypto.randomBytes(48).toString("hex");
        } catch {
            throw InternalServerError("No se pudo generar el refresh token");
        }
    }

    // ============================
    // REGISTER
    // ============================
    async register(email: string, password: string) {
        if (!email || !email.includes("@")) {
            throw BadRequest("Email inválido", { email });
        }

        if (!password || password.length < 6) {
            throw BadRequest("La contraseña debe tener mínimo 6 caracteres");
        }

        const existing = await this.userRepo.findByEmail(email);
        if (existing) {
            throw Conflict("El email ya está registrado", { email });
        }

        const hashed = await bcrypt.hash(password, 10);

        const user = await this.userRepo.create({ email, password: hashed });
        const accessToken = this.generateAccessToken({
            id: user.id,
            email: user.email,
        });

        const refreshToken = this.generateRefreshToken();

        await this.apiTokenRepo.create(user.id, refreshToken);

        return { accessToken, refreshToken, user };
    }

    // ============================
    // LOGIN
    // ============================
    async login(email: string, password: string) {
        if (!email || !password) {
            throw BadRequest("Email y contraseña requeridos");
        }

        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw Unauthorized("Credenciales inválidas", {
                reason: "user_not_found",
            });
        }

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) {
            throw Unauthorized("Credenciales inválidas", {
                reason: "incorrect_password",
            });
        }

        const accessToken = this.generateAccessToken({
            id: user.id,
            email: user.email,
        });

        const refreshToken = this.generateRefreshToken();

        await this.apiTokenRepo.create(user.id, refreshToken);

        return { accessToken, refreshToken, user };
    }

    // ============================
    // REFRESH TOKEN
    // ============================
    async refresh(oldRefreshToken: string) {
        if (!oldRefreshToken) {
            throw BadRequest("Refresh token no provisto");
        }

        const stored = await this.apiTokenRepo.findByToken(oldRefreshToken);
        if (!stored) {
            throw Unauthorized("Refresh token inválido", {
                token: oldRefreshToken,
            });
        }

        const user = await this.userRepo.findById(stored.userId);
        if (!user) {
            await this.apiTokenRepo.delete(stored.id);
            throw NotFound("Usuario vinculado al token no existe", {
                userId: stored.userId,
            });
        }

        // invalidar token viejo
        await this.apiTokenRepo.delete(stored.id);

        // generar nuevo refresh
        const newRefresh = this.generateRefreshToken();
        await this.apiTokenRepo.create(user.id, newRefresh);

        // generar nuevo access
        const newAccess = this.generateAccessToken({
            id: user.id,
            email: user.email,
        });

        return { accessToken: newAccess, refreshToken: newRefresh };
    }

    // ============================
    // LOGOUT
    // ============================
    async logout(refreshToken: string) {
        if (!refreshToken) return;

        const stored = await this.apiTokenRepo.findByToken(refreshToken);
        if (stored) {
            await this.apiTokenRepo.delete(stored.id);
        }

        return;
    }

    // ============================
    // VERIFY TOKEN
    // ============================
    verifyAccessToken(token: string) {
        try {
            return JwtHandler.verifyAccessToken(token);
        } catch (err) {
            throw Unauthorized("Token inválido o expirado");
        }
    }
}
