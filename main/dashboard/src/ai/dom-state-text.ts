const TEXT_PREVIEW_LENGTH = 200;
const ATTR_ARIA_LABEL = "aria-label";

const WHITESPACE_CHARS = [" ", "\t", "\n", "\r"] as const;

function collapseWhitespace(text: string): string {
    let normalized = text;
    for (const ch of WHITESPACE_CHARS) {
        normalized = normalized.split(ch).join(" ");
    }
    return normalized.split(" ").filter(Boolean).join(" ");
}

export function extractText(el: HTMLElement): string {
    const aria = el.getAttribute(ATTR_ARIA_LABEL);
    if (aria && aria.trim()) return aria.trim();
    const normalized = collapseWhitespace(el.textContent ?? "");
    return normalized.slice(0, TEXT_PREVIEW_LENGTH);
}
