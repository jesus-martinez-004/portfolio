import dns from "dns/promises";
import { DomainRepository } from "../../infra/db/repositories/DomainRepository";

export class DomainService {
    private domainRepo = new DomainRepository();

    // El hostname al que deben apuntar los dominios CNAME
    private requiredTarget = process.env.DOMAIN_TARGET || "cname.miapp.com";

    async addDomain(userId: number, domain: string, type?: "A" | "CNAME") {
        // normalizas dominio (sin espacios, minúsculas)
        const cleanDomain = domain.trim().toLowerCase();

        return this.domainRepo.create(userId, cleanDomain, type);
    }

    async verifyDomain(domainId: number) {
        const domain = await this.domainRepo.findById(domainId);
        if (!domain) throw new Error("Dominio no encontrado");

        const host = domain.domain;

        // ======= Modo local/desarrollo =======
        if (
            process.env.VERIFICATION_MODE === "local" ||
            host.endsWith(".loca.lt") ||
            host.endsWith(".local")
        ) {
            // Marca automáticamente como verificado
            return this.domainRepo.verifyDomain(domainId);
        }

        try {
            // ======= Verificación real por CNAME =======
            // Usar un resolver confiable (Google / Cloudflare)
            this.domainRepo.unverifyDomain(domainId);
            const resolver = new dns.Resolver();
            resolver.setServers(["8.8.8.8", "1.1.1.1"]);

            const cnames = await resolver.resolveCname(host);

            const match = cnames.some(
                (c) => c.toLowerCase() === this.requiredTarget.toLowerCase()
            );

            if (!match) {
                throw new Error(
                    `El dominio no apunta al CNAME requerido (${this.requiredTarget})`
                );
            }

            // ======= Marcar dominio como verificado =======
            return this.domainRepo.verifyDomain(domainId);

        } catch (err: any) {
            throw new Error("No se pudo verificar el dominio: " + err.message);
        }
    }

    async listByUser(userId: number) {
        return this.domainRepo.findByUser(userId);
    }

    async deleteDomain(domainId: number, userId: number) {
        const domain = await this.domainRepo.findById(domainId);
        if (!domain) throw new Error("Dominio no existe");
        if (domain.userId !== userId) throw new Error("No autorizado");

        return this.domainRepo.delete(domainId);
    }
}
