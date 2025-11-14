import { Router, Request, Response } from "express";
import { UrlService } from "../../core/services/url.service";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();
const urlService = new UrlService();

interface RequestWithUser extends Request {
    user?: { id: number };
}

// ================================
// 🔹 Crear URL corta
// POST /url/shorten
// ================================
router.post("/shorten", authMiddleware, async (req: RequestWithUser, res: Response) => {
    try {
        const { originalUrl, domainId, customCode, expiresAt } = req.body;
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "No autenticado" });

        const url = await urlService.createShortUrl({
            userId,
            originalUrl,
            domainId,
            customCode,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
        });

        res.json(url);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// ================================
// 🔹 Redirigir URL corta
// GET /:code
// ================================
router.get("/:code", async (req: Request, res: Response) => {
    try {
        const shortCode = req.params.code;
        const host = req.headers.host || "";

        const url = await urlService.resolveShortCode(shortCode, host);
        if (!url) return res.status(404).json({ error: "URL no encontrada o expirada" });

        await urlService.registerClick(url.id, {
            ip: req.ip,
            userAgent: Array.isArray(req.headers["user-agent"]) ? req.headers["user-agent"][0] : req.headers["user-agent"] ?? "",
            referer: Array.isArray(req.headers.referer) ? req.headers.referer[0] : req.headers.referer ?? "",
            country: Array.isArray(req.headers["cf-ipcountry"]) ? req.headers["cf-ipcountry"][0] : req.headers["cf-ipcountry"] ?? undefined
        });

        return res.redirect(url.originalUrl);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// ================================
// 🔹 Listar URLs del usuario
// GET /url/mine/list
// ================================
router.get("/mine/list", authMiddleware, async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "No autenticado" });

        const urls = await urlService.listByUser(userId);
        res.json(urls);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// ================================
// 🔹 Eliminar URL
// DELETE /url/:id
// ================================
router.delete("/:id", authMiddleware, async (req: RequestWithUser, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "No autenticado" });

        const id = Number(req.params.id);
        await urlService.deleteUrl(id, userId);

        res.json({ success: true });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
