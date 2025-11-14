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
        return prisma.user.delete({ where: { id } });
    }
}
