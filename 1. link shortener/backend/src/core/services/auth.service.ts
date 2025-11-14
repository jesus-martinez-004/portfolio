import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { UserRepository } from "../../infra/db/repositories/UserRepository";
import { ApiTokenRepository } from "../../infra/db/repositories/ApiTokenRepository";

const ACCESS_TOKEN_EXP = "15m"; // ajustar si quieres
const ACCESS_TOKEN_ALGO = { expiresIn: ACCESS_TOKEN_EXP };

export class AuthService {
    private userRepo = new UserRepository();
    private apiTokenRepo = new ApiTokenRepository();

    private generateAccessToken(user: { id: number; email: string }) {
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET no definido");
        return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: ACCESS_TOKEN_EXP,
        });
    }

    private generateRefreshToken() {
        return crypto.randomBytes(48).toString("hex");
    }

    // ========== Register ==========
    async register(email: string, password: string) {
        const existing = await this.userRepo.findByEmail(email);
        if (existing) throw new Error("El email ya está registrado");

        const hashed = await bcrypt.hash(password, 10);
        const user = await this.userRepo.create({ email, password: hashed });
        return user;
    }

    // ========== Login ==========
    async login(email: string, password: string) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new Error("Credenciales inválidas");

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) throw new Error("Credenciales inválidas");

        const accessToken = this.generateAccessToken({ id: user.id, email: user.email });
        const refreshToken = this.generateRefreshToken();

        // Guardar refresh token en la tabla ApiToken (modelo que ya tienes)
        await this.apiTokenRepo.create(user.id, refreshToken);

        return { accessToken, refreshToken, user };
    }

    // ========== Refresh ==========
    // Devuelve nuevos tokens y rota refresh token (elimina el viejo y crea uno nuevo)
    async refresh(oldRefreshToken: string) {
        if (!oldRefreshToken) throw new Error("Refresh token no provisto");

        const stored = await this.apiTokenRepo.findByToken(oldRefreshToken);
        if (!stored) throw new Error("Refresh token inválido");

        const user = await this.userRepo.findById(stored.userId);
        if (!user) {
            // por seguridad: eliminar token si user inexistente
            await this.apiTokenRepo.delete(stored.id);
            throw new Error("Usuario vinculado al token no existe");
        }

        // Rotar token
        await this.apiTokenRepo.delete(stored.id);

        const newRefresh = this.generateRefreshToken();
        await this.apiTokenRepo.create(user.id, newRefresh);

        const newAccess = this.generateAccessToken({ id: user.id, email: user.email });

        return { accessToken: newAccess, refreshToken: newRefresh };
    }

    // ========== Logout ==========
    async logout(refreshToken: string) {
        if (!refreshToken) return;
        const stored = await this.apiTokenRepo.findByToken(refreshToken);
        if (stored) await this.apiTokenRepo.delete(stored.id);
        return;
    }

    // ========== Verify access token helper ==========
    verifyAccessToken(token: string) {
        if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET no definido");
        return jwt.verify(token, process.env.JWT_SECRET) as any;
    }
}
