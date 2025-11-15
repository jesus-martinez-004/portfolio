// src/infra/db/repositories/ExternalApiKeyRepository.ts
import prisma from "../connection";

export class ExternalApiKeyRepository {
    async create(userId: number, key: string, name?: string) {
        return prisma.externalApiKey.create({
            data: { userId, key, name },
        });
    }

    async findByKey(key: string) {
        return prisma.externalApiKey.findUnique({
            where: { key },
        });
    }

    async listByUser(userId: number) {
        return prisma.externalApiKey.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async delete(id: number, userId: number) {
        return prisma.externalApiKey.delete({
            where: { id },
        });
    }

    async updateLastUsed(id: number) {
        return prisma.externalApiKey.update({
            where: { id },
            data: { lastUsedAt: new Date() },
        });
    }
}
