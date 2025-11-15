// src/infra/security/jwt.ts
import jwt from "jsonwebtoken";
import ms from "ms";
import { env } from "../../config/env";

import { Unauthorized, InternalServerError } from "../../utils/AppError";

export interface JwtPayload {
    id: number;
    email: string;
    iat?: number;
    exp?: number;
}

export class JwtHandler {
    /**
     * Genera un access token corto, estilo JWT estándar
     */
    static signAccessToken(payload: { id: number; email: string }): string {
        try {
            return jwt.sign(payload, env.JWT_SECRET, {
                expiresIn: env.ACCESS_TOKEN_EXP as ms.StringValue,
            });
        } catch (err: any) {
            throw InternalServerError("No se pudo generar el token JWT", {
                error: err.message,
            });
        }
    }

    /**
     * Verifica token y lanza errores amigables
     */
    static verifyAccessToken(token: string): JwtPayload {
        if (!token) {
            throw Unauthorized("Token no provisto");
        }

        try {
            const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
            return decoded;
        } catch (err: any) {
            // Token expirado
            if (err instanceof jwt.TokenExpiredError) {
                throw Unauthorized("El token ha expirado", {
                    expiredAt: err.expiredAt,
                });
            }

            // Token inválido
            if (err instanceof jwt.JsonWebTokenError) {
                throw Unauthorized("Token inválido", {
                    error: err.message,
                });
            }

            // Error desconocido
            throw InternalServerError("Error verificando token JWT", {
                error: err.message,
            });
        }
    }
}
