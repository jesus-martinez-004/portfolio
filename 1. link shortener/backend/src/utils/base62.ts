// utils/base62.ts

import { BadRequest } from "../utils/AppError";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = ALPHABET.length;

/**
 * Convierte un número positivo a Base62.
 */
export function encodeBase62(num: number): string {
    if (typeof num !== "number" || Number.isNaN(num)) {
        throw BadRequest("El valor a codificar debe ser un número válido");
    }

    if (num < 0) {
        throw BadRequest("El número Base62 no puede ser negativo");
    }

    if (num === 0) return ALPHABET[0];

    let result = "";

    while (num > 0) {
        result = ALPHABET[num % BASE] + result;
        num = Math.floor(num / BASE);
    }

    return result;
}

/**
 * Convierte una cadena Base62 en número.
 */
export function decodeBase62(str: string): number {
    if (!str || typeof str !== "string") {
        throw BadRequest("La cadena Base62 es inválida o está vacía");
    }

    let value = 0;

    for (const char of str) {
        const index = ALPHABET.indexOf(char);

        if (index === -1) {
            throw BadRequest(`Carácter inválido en Base62: "${char}"`, {
                allowed: ALPHABET,
            });
        }

        value = value * BASE + index;
    }

    return value;
}
