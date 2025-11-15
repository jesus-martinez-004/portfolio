// logger.ts
import pino from "pino";
import { env } from "@config/env";
const isProd = env.NODE_ENV === "development";
const isWindows = true;

export const logger = pino(
    isProd || isWindows
        ? {
            level: "info"
        }
        : {
            transport: {
                target: "pino-pretty",
                options: {
                    colorize: true,
                    translateTime: "SYS:standard"
                },
            },
        }
);


/**
 * Crea un logger hijo para módulos específicos.
 * Ejemplo: const dbLogger = createLogger("db");
 */
export function createLogger(context: string) {
    return logger.child({ context });
}
