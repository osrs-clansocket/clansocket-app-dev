import { IMAGE_KEY_REGEX } from "@clansocket/constants/clan-homepage-tokens";

const KEY_LENGTH_MAX = 32;

export function generateImageKey(): string {
    const ts = Date.now().toString(36);
    const r = Math.random().toString(36).slice(2, 8);
    return `${ts}${r}`.slice(0, KEY_LENGTH_MAX);
}

export function isValidImageKey(key: string): boolean {
    return IMAGE_KEY_REGEX.test(key);
}
