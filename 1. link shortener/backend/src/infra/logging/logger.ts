// logger.ts
import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
const isWindows = process.platform === "win32";

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
