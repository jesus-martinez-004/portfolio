// app/routes/stats.routes.ts

import { Router } from "express";
import { ClickAnalyticsController } from "../controllers/stats.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

// GET /stats/:id
router.get("/:id", authMiddleware, ClickAnalyticsController.getStats);

export default router;
