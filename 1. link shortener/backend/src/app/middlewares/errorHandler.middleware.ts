import { Request, Response, NextFunction } from "express";

export function errorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error("❌ Error:", err.message);

    const status =
        err.status ||
        err.code ||
        err.statusCode ||
        400; // default: bad request

    return res.status(status).json({
        success: false,
        message: err.message || "Ha ocurrido un error",
        // Añade esto solo si estás en modo dev
        // stack: process.env.NODE_ENV === "production" ? undefined : err.stack
    });
}
