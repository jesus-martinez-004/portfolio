// src/app/controllers/url.controller.ts
import { Request, Response, NextFunction } from "express";
import { UrlService } from "../../core/services/url.service";
import { isValidUrl, normalizeUrl } from "@utils/urlValidator";

const urlService = new UrlService();

export class UrlController {
    // ====================================
    // 🔹 Crear URL corta
    // POST /url/shorten
    // ====================================
    static async createShortUrl(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const { originalUrl, domainId, customCode, expiresAt } = req.body;

            if (!originalUrl) {
                return res.status(400).json({ error: "originalUrl es requerido" });
            }

            // -----------------------------------
            // ✅ Normalizar y validar la URL
            // -----------------------------------
            const normalized = normalizeUrl(originalUrl);

            if (!isValidUrl(normalized)) {
                return res.status(400).json({ error: "URL inválida o no permitida" });
            }

            const url = await urlService.createShortUrl({
                userId: userId || -1,
                originalUrl: normalized,
                domainId: domainId || null,
                customCode,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
            });

            return res.json(url);
        } catch (err) {
            next(err);
        }
    }


    // ====================================
    // 🔹 Redirigir URL corta
    // GET /:code
    // ====================================
    static async redirect(req: Request, res: Response, next: NextFunction) {
        try {
            const shortCode = req.params.code;
            const host = req.headers.host || "";

            const url = await urlService.resolveShortCode(shortCode, host);

            if (!url) {
                return res.status(404).json({ error: "URL no encontrada o expirada" });
            }

            await urlService.registerClick(url.id, {
                ip: req.ip,
                userAgent:
                    Array.isArray(req.headers["user-agent"])
                        ? req.headers["user-agent"][0]
                        : req.headers["user-agent"] ?? "",
                referer:
                    Array.isArray(req.headers.referer)
                        ? req.headers.referer[0]
                        : req.headers.referer ?? "",
                country:
                    Array.isArray(req.headers["cf-ipcountry"])
                        ? req.headers["cf-ipcountry"][0]
                        : req.headers["cf-ipcountry"] ?? undefined,
            });

            return res.redirect(url.originalUrl);
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Listar URLs del usuario
    // GET /mine/list
    // ====================================
    static async listMyUrls(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            const urls = await urlService.listByUser(userId!);

            return res.json(urls);
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Eliminar URL
    // DELETE /:id
    // ====================================
    static async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const id = Number(req.params.id);

            await urlService.deleteUrl(id, userId!);

            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
}
