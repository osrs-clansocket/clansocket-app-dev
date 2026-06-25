const SPACE_LIKE = new Set([" ", " ", " ", " ", "　"]);
const ZERO_WIDTH = new Set(["​", "‌", "‍", "﻿"]);
const ASCII_SPACE = " ";
const EMPTY = "";

export function canonicalRsn(raw: string): string {
    const normalized = raw.normalize("NFKC");
    const parts: string[] = [];
    for (const ch of normalized) {
        if (ZERO_WIDTH.has(ch)) continue;
        parts.push(SPACE_LIKE.has(ch) ? ASCII_SPACE : ch);
    }
    return parts.join(EMPTY).trim();
}
