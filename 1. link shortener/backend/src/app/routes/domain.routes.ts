import { Router } from "express";
import { DomainController } from "../controllers/domain.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Agregar dominio
router.post("/", authMiddleware, DomainController.add);

// Verificar dominio
router.post("/:id/verify", authMiddleware, DomainController.verify);

// Listar dominios del usuario
router.get("/mine", authMiddleware, DomainController.listMine);

// Eliminar dominio
router.delete("/:id", authMiddleware, DomainController.remove);

export default router;
