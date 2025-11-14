import { UrlRepository } from "../../infra/db/repositories/UrlRepository";
import { DomainRepository } from "../../infra/db/repositories/DomainRepository";
import { ClickEventRepository } from "../../infra/db/repositories/ClickEventRepository";

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

    private generateShortCode(length = 6) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let code = "";
        for (let i = 0; i < length; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    async createShortUrl(input: CreateShortUrlInput) {
        let shortCode = input.customCode || this.generateShortCode();

        // Evitar colisiones
        let exists = await this.urlRepo.findByShortCode(shortCode, input.domainId || null);
        while (exists) {
            shortCode = this.generateShortCode();
            exists = await this.urlRepo.findByShortCode(shortCode, input.domainId || null);
        }

        return this.urlRepo.create({
            userId: input.userId,
            domainId: input.domainId ?? undefined,
            originalUrl: input.originalUrl,
            shortCode,
            expiresAt: input.expiresAt || null,
        });
    }

    // Resolver shortCode considerando dominio y subdominios
    async resolveShortCode(shortCode: string, host: string) {
        let domainId: number | null = null;

        // Buscar dominio exacto o subdominio
        const domain = await this.domainRepo.findByDomain(host);

        if (domain && domain.verified) {
            domainId = domain.id;
        }

        // Buscar URL
        const url = await this.urlRepo.findByShortCode(shortCode, domainId);

        if (!url) return null;

        // Check expiración
        if (url.expiresAt && url.expiresAt.getTime() < Date.now()) {
            return null;
        }

        return url;
    }

    async registerClick(urlId: number, data: { ip?: string; userAgent?: string; referer?: string; country?: string; domainId?: number | null }) {
        return this.clickRepo.registerEvent({
            urlId,
            ip: data.ip || null,
            userAgent: data.userAgent || null,
            referer: data.referer || null,
            country: data.country || null
        });
    }

    async listByUser(userId: number) {
        return this.urlRepo.findByUser(userId);
    }

    async deleteUrl(id: number, userId: number) {
        const url = await this.urlRepo.findById(id);
        if (!url) throw new Error("URL no encontrada");
        if (url.userId !== userId) throw new Error("No autorizado");
        return this.urlRepo.delete(id);
    }
}
