import prisma from "../connection";

export class UserRepository {
    async create(data: { email: string; password: string; plan?: string }) {
        return prisma.user.create({ data });
    }

    async findById(id: number) {
        return prisma.user.findUnique({ where: { id } });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    }

    async list() {
        return prisma.user.findMany();
    }

    async update(id: number, data: Partial<{ email: string; password: string; plan: string }>) {
        return prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: number) {

        await prisma.apiToken.deleteMany({
            where: { userId: id }
        });

        const urls = await prisma.url.findMany({
            where: { userId: id },
            select: { id: true }
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

        return prisma.user.delete({
            where: { id }
        });
    }

}
