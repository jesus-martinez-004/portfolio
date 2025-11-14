// config/constants.ts

export const APP_NAME = "UrlShortenerPro";

export const SHORT_CODE_LENGTH = 7;     // longitud por defecto
export const DEFAULT_DOMAIN = "short.ly"; // dominio general

export const CLICK_QUEUE_NAME = "click_events";
export const EMAIL_QUEUE_NAME = "email_jobs";

export const CACHE_TTL = {
    SHORT_URL: 60 * 5,       // 5 min
    DOMAIN_VERIFICATION: 60 * 60, // 1 hora
};

export const RATE_LIMIT = {
    FREE_TIER: 1000,
    PRO_TIER: 10000,
};
