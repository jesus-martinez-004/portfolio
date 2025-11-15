// src/core/services/apiKey.service.ts
import crypto from "crypto";
import { ExternalApiKeyRepository } from "../../infra/db/repositories/ExternalApiKeyRepository";
import {
    NotFound,
    Forbidden,
    BadRequest,
    InternalServerError,
    Unauthorized
} from "../../utils/AppError";

export class ApiKeyService {
    private repo = new ExternalApiKeyRepository();

    // Generar API Key estilo Stripe: sl_XXXXX...
    generateApiKey(): string {
        try {
            const raw = crypto.randomBytes(32).toString("hex");
            return `sl_${raw}`;
        } catch (_) {
            // Errores de cripto casi nunca pasan, pero mejor manejado
            throw InternalServerError("No se pudo generar la API Key");
        }
    }

    async createKey(userId: number, name?: string) {
        if (!userId) throw BadRequest("El usuario es requerido");

        const key = this.generateApiKey();
        return this.repo.create(userId, key, name);
    }

    async listKeys(userId: number) {
        if (!userId) throw BadRequest("El usuario es requerido");

        return this.repo.listByUser(userId);
    }

    async deleteKey(id: number, userId: number) {
        if (!userId) throw Unauthorized("No autorizado");
        if (!id) throw BadRequest("ID de API Key inválido");

        const deleted = await this.repo.delete(id, userId);

        if (!deleted) {
            throw NotFound("API Key no encontrada o no te pertenece", {
                apiKeyId: id,
                userId: userId
            });
        }

        return deleted;
    }

    async authenticateApiKey(key: string) {
        if (!key) throw BadRequest("API Key requerida");

        const apiKey = await this.repo.findByKey(key);

        if (!apiKey) {
            // No lanzamos error 401 aquí porque esto se usa en middleware de autenticación
            return null;
        }

        try {
            await this.repo.updateLastUsed(apiKey.id);
        } catch (err) {
            throw InternalServerError("No se pudo actualizar el uso de la API Key");
        }

        return apiKey;
    }
}
