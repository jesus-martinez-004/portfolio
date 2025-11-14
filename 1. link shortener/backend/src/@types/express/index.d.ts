import "express";

declare global {
    namespace Express {
        interface UserPayload {
            id: number;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}
