import { Request, Response } from "express";
import { ApiKeyService } from "../../core/services/apiKey.service";

const apiKeyService = new ApiKeyService();

export class ExternalApiKeyController {

    // Crear una API Key
    static async create(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const { name } = req.body;

            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const apiKey = await apiKeyService.createKey(userId, name || null);

            return res.json({ apiKey });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    // Listar todas las API keys del usuario
    static async list(req: Request, res: Response) {
        try {
            const userId = req.user?.id;

            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const keys = await apiKeyService.listKeys(userId);

            return res.json({ keys });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    }

    // Borrar una API key
    static async remove(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            const result = await apiKeyService.deleteKey(id, req.user!.id);

            return res.json({ message: "API Key eliminada", deleted: result });
        } catch (err: any) {
            return res.status(404).json({ error: err.message });
        }
    }
}
