import { Router, Request, Response } from "express";
import { DomainService } from "../../core/services/domain.service";

const router = Router();
const domainService = new DomainService();

// =========================
// Agregar dominio
// POST /domains
// =========================
router.post("/", async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "No autenticado" });

        const { domain, type } = req.body;

        const created = await domainService.addDomain(userId, domain, type);
        res.json(created);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// =========================
// Verificar dominio
// POST /domains/:id/verify
// =========================
router.post("/:id/verify", async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;

        const id = Number(req.params.id);
        const domain = await domainService.verifyDomain(id);

        res.json({ success: true, domain });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// =========================
// Listar dominios del usuario
// GET /domains/mine
// =========================
router.get("/mine", async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "No autenticado" });

        const domains = await domainService.listByUser(userId);
        res.json(domains);

    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// =========================
// Eliminar dominio
// DELETE /domains/:id
// =========================
router.delete("/:id", async (req: any, res: Response) => {
    try {
        const userId = req.user?.id;

        const id = Number(req.params.id);
        await domainService.deleteDomain(id, userId);

        res.json({ success: true });

    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
