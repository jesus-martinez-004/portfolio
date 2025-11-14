import prisma from "../connection";

export class ClickEventRepository {
    async registerEvent(data: {
        urlId: number;
        ip?: string | null;
        userAgent?: string | null;
        referer?: string | null;
        country?: string | null;
    }) {
        return prisma.clickEvent.create({ data });
    }

    async findByUrl(urlId: number) {
        return prisma.clickEvent.findMany({ where: { urlId } });
    }

    async listAll() {
        return prisma.clickEvent.findMany();
    }
}
