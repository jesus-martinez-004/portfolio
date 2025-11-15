// src/infra/security/jwt.ts
import jwt from "jsonwebtoken";
import { env } from "../../config/env"; // ya tienes env validado con Zod
import ms from "ms";
export interface JwtPayload {
    id: number;
    email: string;
    iat?: number;
    exp?: number;
}

export class JwtHandler {
    static signAccessToken(payload: { id: number; email: string }): string {
        return jwt.sign(payload, env.JWT_SECRET, {
            expiresIn: env.ACCESS_TOKEN_EXP as ms.StringValue,
        });
    }

    static verifyAccessToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        } catch (err) {
            throw new Error("Token inválido o expirado");
        }
    }
}
