import prisma from "../connection";

export class DomainRepository {
    async create(userId: number, domain: string, type?: string) {
        return prisma.domain.create({
            data: { userId, domain, type },
        });
    }

    async findById(id: number) {
        return prisma.domain.findUnique({ where: { id } });
    }

    async findByDomain(domain: string) {
        return prisma.domain.findFirst({ where: { domain } });
    }

    async findByUser(userId: number) {
        return prisma.domain.findMany({ where: { userId } });
    }

    async verifyDomain(id: number) {
        return prisma.domain.update({
            where: { id },
            data: { verified: true },
        });
    }

    async delete(id: number) {
        const urls = await prisma.url.findMany({
            where: { domainId: id },
            select: { id: true },
        });

        const urlIds = urls.map(u => u.id);

        if (urlIds.length > 0) {
            await prisma.clickEvent.deleteMany({
                where: { urlId: { in: urlIds } }
            });
            await prisma.url.deleteMany({
                where: { id: { in: urlIds } }
            });
        }
        return prisma.domain.delete({
            where: { id }
        });
    }

}
