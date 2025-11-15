// app/controllers/clickAnalytics.controller.ts

import { Request, Response, NextFunction } from "express";
import { ClickAnalyticsService } from "../../core/services/analytics.service";
import { UrlService } from "../../core/services/url.service";

const analyticsService = new ClickAnalyticsService();
const urlService = new UrlService();

export class ClickAnalyticsController {
    static async getStats(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const urlId = Number(req.params.id);

            // Validación: la URL pertenece al usuario
            const url = await urlService.findById(urlId);
            if (!url || url.userId !== userId) {
                return res.status(403).json({ error: "No autorizado" });
            }

            const stats = await analyticsService.getStatsForUrl(urlId);

            res.json(stats);
        } catch (err) {
            next(err);
        }
    }
}
