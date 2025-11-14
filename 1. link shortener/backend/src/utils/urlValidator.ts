// utils/urlValidator.ts

/**
 * Validación estricta para URLs externas.
 * Rechaza:
 * - javascript:
 * - data:
 * - file:
 * - mailto:
 */
export function isValidUrl(url: string): boolean {
    try {
        const parsed = new URL(url);

        const allowedProtocols = ["http:", "https:"];

        return allowedProtocols.includes(parsed.protocol);
    } catch {
        return false;
    }
}

/**
 * Normaliza URLs (quita espacios, corrige errores comunes).
 */
export function normalizeUrl(url: string): string {
    return url.trim();
}
