import { nextInt } from "../../shared/random/non-crypto-random.js";

let iconCache: string[] | null = null;

function collectIcons(): string[] {
    if (iconCache) return iconCache;
    const seen = new Set<string>();
    const icons: string[] = [];
    for (const img of document.querySelectorAll<HTMLImageElement>(".metric-icon")) {
        if (img.src && !seen.has(img.src)) {
            seen.add(img.src);
            icons.push(img.src);
        }
    }
    iconCache = icons;
    return icons;
}

export function randomIcon(): string {
    const icons = collectIcons();
    return icons.length > 0 ? icons[nextInt(icons.length)]! : "";
}
