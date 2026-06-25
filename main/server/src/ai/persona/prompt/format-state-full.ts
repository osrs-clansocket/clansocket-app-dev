import type { DomElement } from "./types.js";

export function formatStateFull(state: Record<string, unknown>): string {
    const lines: string[] = ["Full page state — all data-key elements with complete untruncated content:\n"];
    for (const [key, el] of Object.entries(state)) {
        const elem = el as DomElement;
        const vis = elem.visible ? "visible" : "hidden";
        lines.push(`[${key}] <${elem.tag}> class="${elem.classes}" (${vis})`);
        if (elem.text) {
            lines.push(elem.text);
        } else {
            lines.push("(empty)");
        }
        lines.push("");
    }
    return lines.join("\n");
}
