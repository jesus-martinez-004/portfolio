import { logger } from "@infra/logging/logger";
import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
        logger.info({
            method: req.method,
            url: req.originalUrl,
            status: res.status,
            duration: Date.now() - start,
            ip: req.ip || "-",
        });
    });

    next();
}
