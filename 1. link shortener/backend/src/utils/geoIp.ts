// utils/geoIp.ts

/**
 * Pequeña utilidad para geolocalizar IP.
 * Para producción, reemplaza esta función con:
 * - MaxMind GeoLite2
 * - API de ipapi.co
 * - API de ipstack
 */
export async function getGeoInfo(ip: string) {
    // Ejemplo simple para desarrollo
    if (ip.startsWith("192.") || ip.startsWith("127.") || ip === "::1") {
        return {
            country: "LOCAL",
            city: "Localhost",
        };
    }

    // Placeholder — aquí podrías hacer request a un servicio real
    return {
        country: "UNKNOWN",
        city: "UNKNOWN",
    };
}
