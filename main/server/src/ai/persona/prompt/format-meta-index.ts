import type { DomElement } from "./types.js";

function metaTagsOf(el: DomElement): string[] {
    return el.meta ? el.meta.split(" ").filter(Boolean) : [];
}

export function formatMetaIndex(state: Record<string, unknown>): string {
    const index: Record<string, string[]> = {};
    for (const [key, raw] of Object.entries(state)) {
        for (const tag of metaTagsOf(raw as DomElement)) {
            index[tag] ??= [];
            index[tag].push(key);
        }
    }
    const tags = Object.keys(index).sort((a, b) => a.localeCompare(b));
    if (tags.length === 0) return "No operable elements on the current page.";
    const lines: string[] = [
        'Operable element index — meta-tag → (count) keys. Pull a facet\'s full context with read: ["dom:<tag>"].',
    ];
    for (const tag of tags) {
        const keys = index[tag];
        lines.push(`  ${tag} (${keys.length}): ${keys.join(", ")}`);
    }
    return lines.join("\n");
}
