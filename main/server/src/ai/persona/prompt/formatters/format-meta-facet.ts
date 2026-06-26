import type { DomElement } from "../assembly/types.js";
import { formatElementLine } from "./element-line-formatter.js";

function metaTagsOf(el: DomElement): string[] {
    return el.meta ? el.meta.split(" ").filter(Boolean) : [];
}

export function formatMetaFacet(state: Record<string, unknown>, tag: string): string {
    const lines: string[] = [];
    for (const [key, raw] of Object.entries(state)) {
        const el = raw as DomElement;
        if (!metaTagsOf(el).includes(tag)) continue;
        lines.push(formatElementLine(key, el));
    }
    if (lines.length === 0) return `No operable elements tagged "${tag}" on the current page.`;
    return [`Operable elements tagged "${tag}" — data-key, current state, and what you can do:`, ...lines].join("\n");
}
