// src/app/controllers/domain.controller.ts
import { Request, Response, NextFunction } from "express";
import { DomainService } from "../../core/services/domain.service";

const domainService = new DomainService();

export class DomainController {
    // ====================================
    // 🔹 Agregar dominio
    // POST /domains
    // ====================================
    static async add(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const { domain, type } = req.body;

            const created = await domainService.addDomain(userId!, domain, type);

            return res.json(created);
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Verificar dominio
    // POST /domains/:id/verify
    // ====================================
    static async verify(req: Request, res: Response, next: NextFunction) {
        try {
            const domainId = Number(req.params.id);

            const domain = await domainService.verifyDomain(domainId);

            return res.json({ success: true, domain });
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Listar dominios del usuario
    // GET /domains/mine
    // ====================================
    static async listMine(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;

            const domains = await domainService.listByUser(userId!);

            return res.json(domains);
        } catch (err) {
            next(err);
        }
    }

    // ====================================
    // 🔹 Eliminar dominio
    // DELETE /domains/:id
    // ====================================
    static async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.id;
            const domainId = Number(req.params.id);

            await domainService.deleteDomain(domainId, userId!);

            return res.json({ success: true });
        } catch (err) {
            next(err);
        }
    }
}
