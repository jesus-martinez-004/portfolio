// utils/userAgentParser.ts

/**
 * Extrae información sobre:
 * - tipo de dispositivo (mobile/desktop/tablet/bot)
 * - navegador
 * - sistema operativo
 */
export function parseUserAgent(ua: string) {
    ua = ua || "";

    const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    const isBot = /(bot|crawler|spider|crawling)/i.test(ua);

    const browser = detectBrowser(ua);
    const os = detectOS(ua);

    return {
        raw: ua,
        isMobile,
        isBot,
        browser,
        os,
    };
}

function detectBrowser(ua: string): string {
    if (/chrome|crios|crmo/i.test(ua)) return "Chrome";
    if (/firefox|fxios/i.test(ua)) return "Firefox";
    if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
    if (/edg/i.test(ua)) return "Edge";
    if (/opr\//i.test(ua)) return "Opera";
    return "Unknown";
}

function detectOS(ua: string): string {
    if (/windows/i.test(ua)) return "Windows";
    if (/macintosh|mac os x/i.test(ua)) return "MacOS";
    if (/linux/i.test(ua)) return "Linux";
    if (/android/i.test(ua)) return "Android";
    if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
    return "Unknown";
}
