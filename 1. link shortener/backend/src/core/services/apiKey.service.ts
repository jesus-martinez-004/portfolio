// src/core/services/apiKey.service.ts
import crypto from "crypto";
import { ExternalApiKeyRepository } from "../../infra/db/repositories/ExternalApiKeyRepository";

export class ApiKeyService {
    private repo = new ExternalApiKeyRepository();

    // Generar API Key estilo Stripe: sk_live_XXXXX
    generateApiKey(): string {
        const raw = crypto.randomBytes(32).toString("hex");
        return `sl_${raw}`;
    }

    async createKey(userId: number, name?: string) {
        const key = this.generateApiKey();
        return this.repo.create(userId, key, name);
    }

    async listKeys(userId: number) {
        return this.repo.listByUser(userId);
    }

    async deleteKey(id: number, userId: number) {
        const deleted = await this.repo.delete(id, userId);

        if (!deleted) {
            throw new Error("API key no encontrada o no te pertenece");
        }

        return deleted;
    }


    async authenticateApiKey(key: string) {
        const apiKey = await this.repo.findByKey(key);
        if (!apiKey) return null;

        // actualizar último uso
        await this.repo.updateLastUsed(apiKey.id);

        return apiKey;
    }
}
