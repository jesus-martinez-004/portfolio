// src/core/services/url.service.ts
import { UrlRepository } from "../../infra/db/repositories/UrlRepository";
import { DomainRepository } from "../../infra/db/repositories/DomainRepository";
import { ClickEventRepository } from "../../infra/db/repositories/ClickEventRepository";

import { parseUserAgent } from "@utils/userAgentParser";
import { getGeoInfo } from "@utils/geoIp";

import {
    BadRequest,
    NotFound,
    Unauthorized,
    Conflict,
    InternalServerError,
} from "../../utils/AppError";

interface CreateShortUrlInput {
    userId: number;
    originalUrl: string;
    domainId?: number | null;
    customCode?: string;
    expiresAt?: Date | null;
}

export class UrlService {
    private urlRepo = new UrlRepository();
    public domainRepo = new DomainRepository(); // público para router
    private clickRepo = new ClickEventRepository();

    private RESERVED_CODES = ["default", "api", "auth", "admin", "login"];

    private generateShortCode(length = 6) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // ========================================================
    // CREATE SHORT URL
    // ========================================================
    async createShortUrl(input: CreateShortUrlInput) {
        if (!input.userId) throw Unauthorized("No autorizado");
        if (!input.originalUrl) throw BadRequest("La URL original es requerida");

        let shortCode = input.customCode?.trim() || null;
        const domainId = input.domainId ?? null;

        // Evitar códigos reservados
        if (shortCode && this.RESERVED_CODES.includes(shortCode.toLowerCase())) {
            throw BadRequest("El código elegido está reservado", {
                code: shortCode,
            });
        }

        // Verificar colisiones
        if (shortCode) {
            const exists = await this.urlRepo.findByShortCode(shortCode, domainId);
            if (exists) {
                throw Conflict("Ya existe un URL con ese código", {
                    code: shortCode,
                    domainId,
                });
            }
        }

        // Generar shortcode si no viene custom
        if (!shortCode) {
            do {
                shortCode = this.generateShortCode();
            } while (await this.urlRepo.findByShortCode(shortCode, domainId));
        }

        return this.urlRepo.create({
            userId: input.userId,
            domainId: domainId || undefined,
            originalUrl: input.originalUrl,
            shortCode,
            expiresAt: input.expiresAt || null,
        });
    }

    // ========================================================
    // FIND BY ID
    // ========================================================
    async findById(id: number) {
        const url = await this.urlRepo.findById(id);
        if (!url) throw NotFound("URL no encontrada", { id });
        return url;
    }

    // ========================================================
    // RESOLVE SHORTCODE
    // Considera dominio verificado o genérico
    // ========================================================
    async resolveShortCode(shortCode: string, host: string) {
        if (!shortCode) return null;

        let domainId: number | null = null;

        // Determinar dominio si existe
        const domain = await this.domainRepo.findByDomain(host);
        if (domain && domain.verified) {
            domainId = domain.id;
        }

        const url = await this.urlRepo.findByShortCode(shortCode, domainId);

        if (!url) return null;

        // Expiración
        if (url.expiresAt && url.expiresAt.getTime() < Date.now()) {
            return null;
        }

        return url;
    }

    // ========================================================
    // REGISTER CLICK
    // ========================================================
    async registerClick(
        urlId: number,
        data: {
            ip: string | undefined;
            userAgent: string | undefined;
            referer: string | undefined;
            country?: string | undefined;
        }
    ) {
        try {
            const ip = (data.ip || "").replace("::ffff:", "").trim();
            const userAgent = data.userAgent || "";
            const referer = data.referer || null;

            // 1. User Agent Analysis
            const ua = parseUserAgent(userAgent);

            // 2. Geolocalización
            let geoInfo = null;

            if (data.country) {
                geoInfo = { country: data.country, city: "Unknown" };
            } else if (ip) {
                geoInfo = await getGeoInfo(ip);
            }

            // 3. Guardar evento
            await this.clickRepo.registerEvent({
                urlId,
                ip,
                country: geoInfo?.country || "UNKNOWN",
                userAgent,
                referer,
            });
            this.urlRepo.incrementClicks(urlId);
        } catch (err: any) {
            // Nunca debe romper la redirección
            console.error("Error registering click:", err.message);
        }
    }

    // ========================================================
    // LIST BY USER
    // ========================================================
    async listByUser(userId: number) {
        if (!userId) throw Unauthorized();
        return this.urlRepo.findByUser(userId);
    }

    // ========================================================
    // DELETE URL
    // ========================================================
    async deleteUrl(id: number, userId: number) {
        const url = await this.urlRepo.findById(id);

        if (!url) {
            throw NotFound("URL no encontrada", { id });
        }

        if (url.userId !== userId) {
            throw Unauthorized("No tienes permisos para eliminar esta URL", {
                urlOwnerId: url.userId,
                requesterId: userId,
            });
        }

        return this.urlRepo.delete(id);
    }
}
