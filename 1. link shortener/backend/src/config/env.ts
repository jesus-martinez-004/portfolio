// config/env.ts
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

// Esquema de validación de variables
const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().default("3000"),
    DATABASE_URL: z.string(),
    REDIS_URL: z.string().optional(),
    JWT_SECRET: z.string().min(20, "JWT_SECRET debe ser seguro"),
    RATE_LIMIT_MAX: z.string().default("1000"),
    ORIGIN: z.string().optional(),
    ACCESS_TOKEN_EXP: z.string().default("15m"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("❌ Error en variables de entorno:");
    console.error(parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
