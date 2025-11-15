import { Router } from "express";
import { UrlController } from "../controllers/url.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// Crear URL corta
router.post("/shorten", authMiddleware, UrlController.createShortUrl);

// Redirigir
router.get("/:code", UrlController.redirect);

// Listar URLs del usuario
router.get("/mine/list", authMiddleware, UrlController.listMyUrls);

// Eliminar URL
router.delete("/:id", authMiddleware, UrlController.delete);

export default router;
