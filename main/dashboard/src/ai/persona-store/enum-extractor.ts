import { personaStore, type SlotMeta } from "./index.js";
import { defaultValueOf } from "./defaults-client.js";

const BOLD_PREFIX = "**";
const BOLD_PREFIX_LEN = 2;

export function extractEnumValue(raw: string, options: readonly string[]): string {
    if (options.includes(raw)) return raw;
    if (!raw.startsWith(BOLD_PREFIX)) return raw;
    const closeIdx = raw.indexOf(BOLD_PREFIX, BOLD_PREFIX_LEN);
    if (closeIdx <= BOLD_PREFIX_LEN) return raw;
    const key = raw.slice(BOLD_PREFIX_LEN, closeIdx);
    return options.includes(key) ? key : raw;
}

export function currentEnumValue(meta: SlotMeta): string {
    const raw = personaStore.valueOf(meta.key) ?? defaultValueOf(meta.key);
    return extractEnumValue(raw, meta.options ?? []);
}
