// src/infra/security/rateLimiter.ts
import { Request, Response, NextFunction } from "express";
import { env } from "../../config/env";

// requests permitidas por ventana
const MAX_REQUESTS = env.RATE_LIMIT_MAX ? Number(env.RATE_LIMIT_MAX) : 1000;

// ventana en milisegundos (ej: 1 minuto)
const WINDOW_MS = 60_000;

// ================================
// 📌 almacenamiento en memoria
// { "IP": { count: number, firstRequestTime: timestamp } }
// ================================
const memoryStore = new Map<
    string,
    { count: number; firstRequestTime: number }
>();

interface RateLimiterOptions {
    keyGenerator?: (req: Request) => string;
    maxRequests?: number;
    windowMs?: number;
}

// ================================
// 📌 rate limiter principal
// ================================
export function createRateLimiter(options: RateLimiterOptions = {}) {
    const keyFn: (req: Request) => string | undefined = options.keyGenerator || ((req) => req.ip);
    const max: number = options.maxRequests || MAX_REQUESTS;
    const window: number = options.windowMs || WINDOW_MS;

    return function rateLimiter(req: Request, res: Response, next: NextFunction) {
        const key: string = keyFn(req) || "";
        const now: number = Date.now();

        let record = memoryStore.get(key);

        if (!record) {
            // primera petición
            memoryStore.set(key, { count: 1, firstRequestTime: now });
            return next();
        }

        const timeSinceFirst = now - record.firstRequestTime;

        // si se cumplió la ventana → reiniciar contador
        if (timeSinceFirst > window) {
            record = { count: 1, firstRequestTime: now };
            memoryStore.set(key, record);
            return next();
        }

        // dentro de la ventana, incrementar
        record.count++;

        if (record.count > max) {
            return res.status(429).json({
                error: "Too many requests",
                retryAfterMs: window - timeSinceFirst,
            });
        }

        next();
    };
}
