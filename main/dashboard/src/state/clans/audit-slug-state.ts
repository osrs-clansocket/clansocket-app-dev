import { parseSlug } from "./audit-client-slug.js";

let currentSlug: string | null = parseSlug(window.location.pathname);

export function getCurrentSlug(): string | null {
    return currentSlug;
}

export function setCurrentSlug(s: string | null): void {
    currentSlug = s;
}
