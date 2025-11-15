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
        return prisma.clickEvent.findMany({
            where: { urlId },
            orderBy: { createdAt: "desc" }
        });
    }

    async listAll() {
        return prisma.clickEvent.findMany();
    }

    // ==========================================
    // ✔ COUNT SIMPLE
    // ==========================================

    async countByUrl(urlId: number) {
        return prisma.clickEvent.count({
            where: { urlId }
        });
    }

    // ==========================================
    // ✔ GROUP BY COUNTRY
    // ==========================================

    async countByCountry(urlId: number) {
        return prisma.clickEvent.groupBy({
            by: ["country"],
            where: { urlId },
            _count: { country: true }
        });
    }

    // ==========================================
    // ✔ GROUP BY REFERER
    // ==========================================

    async countByReferer(urlId: number) {
        return prisma.clickEvent.groupBy({
            by: ["referer"],
            where: { urlId },
            _count: { referer: true }
        });
    }

    // ==========================================
    // ✔ GROUP BY DAY (RAW QUERY)
    // ==========================================

    async countByDay(urlId: number): Promise<{ day: string; clicks: bigint }[]> {
        return prisma.$queryRawUnsafe(`
            SELECT 
                DATE("createdAt") AS day,
                COUNT(*)::bigint AS clicks
            FROM "ClickEvent"
            WHERE "urlId" = ${urlId}
            GROUP BY day
            ORDER BY day ASC
        `);
    }
}
