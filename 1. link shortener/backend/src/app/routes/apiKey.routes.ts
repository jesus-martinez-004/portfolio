import { Router } from "express";
import { ExternalApiKeyController } from "../controllers/apiKey.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, ExternalApiKeyController.create);

router.get("/list", authMiddleware, ExternalApiKeyController.list);

router.delete("/:id", authMiddleware, ExternalApiKeyController.remove);

export default router;
