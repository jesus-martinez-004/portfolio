// core/services/clickAnalytics.service.ts

import { ClickEventRepository } from "../../infra/db/repositories/ClickEventRepository";

export class ClickAnalyticsService {
    private repo = new ClickEventRepository();

    async getStatsForUrl(urlId: number) {
        const totalClicks = Number(await this.repo.countByUrl(urlId));

        const rawByCountry = await this.repo.countByCountry(urlId);
        const byCountry = rawByCountry.map(row => ({
            country: row.country,
            count: Number(row._count.country),
        }));

        const rawByReferer = await this.repo.countByReferer(urlId);
        const byReferer = rawByReferer.map(row => ({
            referer: row.referer,
            count: Number(row._count.referer),
        }));

        const rawByDay = await this.repo.countByDay(urlId);
        const byDay = rawByDay.map((row: any) => ({
            day: row.day,
            clicks: Number(row.clicks),
        }));

        const recentClicks = await this.repo.findByUrl(urlId);

        return {
            totalClicks,
            byCountry,
            byReferer,
            byDay,
            recentClicks,
        };
    }
}
