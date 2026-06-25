import { defaultValueOf } from "../defaults-client.js";
import type { SlotMeta } from "../index.js";

const BLOCK_PLACEHOLDER_MAX = 160;
const ENTRY_PLACEHOLDER_MAX = 60;

function placeholderText(meta: SlotMeta, maxLen: number): string {
    const v = defaultValueOf(meta.key);
    if (v === "") return "Server default";
    const parts: string[] = [];
    let inSpace = true;
    for (let i = 0; i < v.length; i++) {
        const c = v[i];
        const isSpace = c === " " || c === "\t" || c === "\n" || c === "\r";
        if (isSpace) {
            if (!inSpace) parts.push(" ");
            inSpace = true;
        } else {
            parts.push(c!);
            inSpace = false;
        }
    }
    const oneLine = parts.join("").trim();
    return oneLine.length > maxLen ? `${oneLine.slice(0, maxLen)}…` : oneLine;
}

export function placeholderForBlock(meta: SlotMeta): string {
    return placeholderText(meta, BLOCK_PLACEHOLDER_MAX);
}

export function placeholderForEntry(meta: SlotMeta): string {
    return placeholderText(meta, ENTRY_PLACEHOLDER_MAX);
}
