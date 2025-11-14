// utils/base62.ts

const ALPHABET =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = ALPHABET.length;

/**
 * Convierte un número a una cadena Base62 (ej: 12345 → "3D7").
 */
export function encodeBase62(num: number): string {
    if (num === 0) return ALPHABET[0];
    let result = "";

    while (num > 0) {
        result = ALPHABET[num % BASE] + result;
        num = Math.floor(num / BASE);
    }

    return result;
}

/**
 * Convierte una cadena Base62 en número (ej: "3D7" → 12345).
 */
export function decodeBase62(str: string): number {
    return str.split("").reduce((acc, char) => {
        const index = ALPHABET.indexOf(char);
        if (index === -1) throw new Error(`Invalid Base62 character: ${char}`);
        return acc * BASE + index;
    }, 0);
}
