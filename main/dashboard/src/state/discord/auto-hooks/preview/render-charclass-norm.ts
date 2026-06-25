import { normalizeChar } from "./render-charclass-classifier.js";

export function normalizeWithUnderscores(input: string): string {
    const parts: string[] = [];
    for (const c of input) parts.push(normalizeChar(c));
    return parts.join("");
}

export function compactForm(normalized: string): string {
    const parts: string[] = [];
    for (const c of normalized) if (c !== "_") parts.push(c);
    return parts.join("");
}
