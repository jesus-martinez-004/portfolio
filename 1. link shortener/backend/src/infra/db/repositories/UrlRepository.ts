import prisma from "../connection";

export class UrlRepository {
    async create(data: {
        userId: number;
        domainId?: number;
        shortCode: string;
        originalUrl: string;
        expiresAt?: Date | null;
    }) {
        return prisma.url.create({ data });
    }

    async findById(id: number) {
        return prisma.url.findUnique({ where: { id } });
    }

    async findByShortCode(shortCode: string, domainId?: number | null) {
        return prisma.url.findFirst({
            where: { shortCode, domainId: domainId ?? null },
        });
    }

    async findByUser(userId: number) {
        return prisma.url.findMany({ where: { userId } });
    }

    async incrementClicks(id: number) {
        return prisma.url.update({
            where: { id },
            data: { clicks: { increment: 1 } },
        });
    }

    async delete(id: number) {
        return prisma.url.delete({ where: { id } });
    }
}
