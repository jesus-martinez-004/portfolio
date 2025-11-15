// utils/geoIp.ts
import fetch from "node-fetch";

interface GeoResponse {
    ip?: string;
    city?: string;
    region?: string;
    country_name?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    error?: string;
}

// cache para no hacer muchas requests
const geoCache = new Map<string, any>();

// detectar IP local/privada
function isLocalIp(ip: string) {
    return (
        ip === "::1" ||
        ip === "127.0.0.1" ||
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        ip.startsWith("172.16.") ||
        ip.startsWith("172.17.") ||
        ip.startsWith("172.18.") ||
        ip.startsWith("172.19.") ||
        ip.startsWith("172.20.") ||
        ip.startsWith("172.21.") ||
        ip.startsWith("172.22.") ||
        ip.startsWith("172.23.") ||
        ip.startsWith("172.24.") ||
        ip.startsWith("172.25.") ||
        ip.startsWith("172.26.") ||
        ip.startsWith("172.27.") ||
        ip.startsWith("172.28.") ||
        ip.startsWith("172.29.") ||
        ip.startsWith("172.30.") ||
        ip.startsWith("172.31.")
    );
}

// ===============================
// 📌 Geolocalización real con ipapi.co
// ===============================
export async function getGeoInfo(ip: string) {
    try {
        if (!ip) return { country: "UNKNOWN", city: "UNKNOWN" };

        // IP local → no hacer request
        if (isLocalIp(ip)) {
            return {
                country: "LOCAL",
                city: "Localhost",
            };
        }

        // cache
        if (geoCache.has(ip)) {
            return geoCache.get(ip);
        }

        const url = `https://ipapi.co/${ip}/json/`;

        const res = await fetch(url);
        const data = (await res.json()) as GeoResponse;

        // validar error del servicio
        if (data.error) {
            return { country: "UNKNOWN", city: "UNKNOWN" };
        }

        const info = {
            country: data.country || data.country_name || "UNKNOWN",
            city: data.city || "UNKNOWN",
            latitude: data.latitude,
            longitude: data.longitude,
        };

        geoCache.set(ip, info);

        return info;
    } catch (err) {
        // fallback silencioso
        return {
            country: "UNKNOWN",
            city: "UNKNOWN",
        };
    }
}
