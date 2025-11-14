import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

/**
 * Use a single shared PrismaClient instance.
 * Avoids creating multiple connections during development with hot reload.
 */
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient();
} else {
    // @ts-ignore
    if (!global.prisma) {
        // @ts-ignore
        global.prisma = new PrismaClient();
    }
    // @ts-ignore
    prisma = global.prisma;
}

export default prisma;
