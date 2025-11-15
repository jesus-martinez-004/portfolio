// config/server.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./env";
import { requestLogger } from "../app/middlewares/requestLogger.middleware";
import urlRouter from "../app/routes/url.routes";
import authRouter from "../app/routes/auth.routes";
import { fakeUser } from "@app/middlewares/fakeUser.middleware";
import { authMiddleware } from "@app/middlewares/auth.middleware";
import domainRouter from "../app/routes/domain.routes";
import { createRateLimiter } from "../infra/security/rateLimiter";
import statsRouter from "../app/routes/stats.routes";
import apiKeyRouter from "../app/routes/apiKey.routes";

const rateLimiter = createRateLimiter({
    maxRequests: env.RATE_LIMIT_MAX ? Number(env.RATE_LIMIT_MAX) : 1000,
    windowMs: 1000 * 60
});
export function createServer() {
    const app = express();
    app.set("trust proxy", true);


    // Seguridad
    app.use(helmet());
    app.use(rateLimiter);

    // CORS dinámico según env
    app.use(
        cors({
            origin: env.ORIGIN || "*",
        })
    );

    // Body parsers
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    //app.use(fakeUser);

    // Logging de requests
    app.use(requestLogger);

    // Aquí se montan las rutas
    app.get("/health", (req, res) => {
        res.json({ status: "ok" });
    });
    app.use("/auth", authRouter);
    app.use("/", urlRouter);
    app.use("/domains", authMiddleware, domainRouter);
    app.use("/stats", authMiddleware, statsRouter);
    app.use("/api-keys", authMiddleware, apiKeyRouter);


    // TODO: importar tus rutas reales
    // app.use("/api/auth", authRoutes);
    // app.use("/api/url", urlRoutes);

    // Manejo global de errores



    return app;
}
