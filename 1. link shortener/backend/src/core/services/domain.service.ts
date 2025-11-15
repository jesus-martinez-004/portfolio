// src/core/services/domain.service.ts
import dns from "dns/promises";
import { DomainRepository } from "../../infra/db/repositories/DomainRepository";
import {
    BadRequest,
    NotFound,
    Unauthorized,
    InternalServerError,
    Conflict,
} from "../../utils/AppError";

export class DomainService {
    private domainRepo = new DomainRepository();

    // El hostname al que deben apuntar los CNAME
    private requiredTarget = process.env.DOMAIN_TARGET || "cname.miapp.com";

    // ============================
    // CREATE DOMAIN
    // ============================
    async addDomain(userId: number, domain: string, type?: "A" | "CNAME") {
        if (!userId) throw Unauthorized("No autorizado");
        if (!domain) throw BadRequest("El dominio es requerido");

        // Normalizar
        const cleanDomain = domain.trim().toLowerCase();

        if (!cleanDomain.includes(".")) {
            throw BadRequest("Dominio inválido", { domain });
        }

        // Verificar si ya existe para este usuario
        const existing = await this.domainRepo.findByDomain(cleanDomain);
        if (existing) {
            throw Conflict("El dominio ya está registrado", {
                domain: cleanDomain,
                userId,
            });
        }

        return this.domainRepo.create(userId, cleanDomain, type);
    }

    // ============================
    // VERIFY DOMAIN
    // ============================
    async verifyDomain(domainId: number) {
        const domain = await this.domainRepo.findById(domainId);
        if (!domain) {
            throw NotFound("Dominio no encontrado", { domainId });
        }

        const host = domain.domain;

        // Modo dev: verificar automáticamente
        if (
            process.env.VERIFICATION_MODE === "local" ||
            host.endsWith(".loca.lt") ||
            host.endsWith(".local")
        ) {
            return this.domainRepo.verifyDomain(domainId);
        }

        try {
            // Primero marcamos el dominio como *no verificado*, siempre
            await this.domainRepo.unverifyDomain(domainId);

            // Resolver DNS
            const resolver = new dns.Resolver();
            resolver.setServers(["8.8.8.8", "1.1.1.1"]);

            const cnames = await resolver.resolveCname(host);

            const match = cnames.some(
                (c) => c.toLowerCase() === this.requiredTarget.toLowerCase()
            );

            if (!match) {
                throw BadRequest("El dominio no apunta al CNAME requerido", {
                    expected: this.requiredTarget,
                    received: cnames,
                });
            }

            // Finalmente marcar como verificado
            return this.domainRepo.verifyDomain(domainId);

        } catch (err: any) {
            // Resolver falló (NXDOMAIN, timeout, etc.)
            if (err.code === "ENOTFOUND" || err.code === "ENODATA") {
                throw BadRequest("No se encontraron registros DNS válidos para el dominio", {
                    domain: host,
                });
            }

            throw InternalServerError("No se pudo verificar el dominio", {
                reason: err.message,
            });
        }
    }

    // ============================
    // LIST DOMAINS BY USER
    // ============================
    async listByUser(userId: number) {
        if (!userId) throw Unauthorized();
        return this.domainRepo.findByUser(userId);
    }

    // ============================
    // DELETE DOMAIN
    // ============================
    async deleteDomain(domainId: number, userId: number) {
        const domain = await this.domainRepo.findById(domainId);

        if (!domain) {
            throw NotFound("Dominio no existe", { domainId });
        }

        if (domain.userId !== userId) {
            throw Unauthorized("No tienes permisos para eliminar este dominio", {
                domainOwnerId: domain.userId,
                requesterId: userId,
            });
        }

        return this.domainRepo.delete(domainId);
    }
}
