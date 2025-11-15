export type ErrorDetails = Record<string, any>;

export class AppError extends Error {
    public status: number;
    public isOperational: boolean;
    public code: string;
    public details?: ErrorDetails;

    constructor(
        message: string,
        status: number = 400,
        code: string = "BAD_REQUEST",
        details?: ErrorDetails,
        isOperational: boolean = true
    ) {
        super(message);

        this.status = status;
        this.code = code;
        this.details = details;
        this.isOperational = isOperational;

        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this);
    }
}

/**
 * 🔥 Helpers profesionales con códigos de error consistentes
 *  
 * Incluyen:
 *   - Mensaje
 *   - Estado HTTP
 *   - Código interno
 *   - Detalles opcionales
 */

export const BadRequest = (msg: string, details?: ErrorDetails) =>
    new AppError(msg, 400, "BAD_REQUEST", details);

export const Unauthorized = (msg: string = "No autorizado", details?: ErrorDetails) =>
    new AppError(msg, 401, "UNAUTHORIZED", details);

export const Forbidden = (msg: string = "Acceso denegado", details?: ErrorDetails) =>
    new AppError(msg, 403, "FORBIDDEN", details);

export const NotFound = (msg: string = "Recurso no encontrado", details?: ErrorDetails) =>
    new AppError(msg, 404, "NOT_FOUND", details);

export const Conflict = (msg: string = "Conflicto", details?: ErrorDetails) =>
    new AppError(msg, 409, "CONFLICT", details);

export const UnprocessableEntity = (
    msg: string = "Datos inválidos",
    details?: ErrorDetails
) => new AppError(msg, 422, "UNPROCESSABLE_ENTITY", details);

export const InternalServerError = (
    msg: string = "Error interno del servidor",
    details?: ErrorDetails
) => new AppError(msg, 500, "INTERNAL_SERVER_ERROR", details);
