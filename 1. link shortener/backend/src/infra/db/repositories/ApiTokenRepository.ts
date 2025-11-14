import prisma from "../connection";

export class ApiTokenRepository {
    async create(userId: number, token: string) {
        return prisma.apiToken.create({
            data: { userId, token },
        });
    }

    async findByToken(token: string) {
        return prisma.apiToken.findUnique({
            where: { token },
        });
    }

    async findByUser(userId: number) {
        return prisma.apiToken.findMany({
            where: { userId },
        });
    }

    async updateLastUsed(token: string) {
        return prisma.apiToken.update({
            where: { token },
            data: { lastUsedAt: new Date() },
        });
    }

    async delete(id: number) {
        return prisma.apiToken.delete({ where: { id } });
    }
}
