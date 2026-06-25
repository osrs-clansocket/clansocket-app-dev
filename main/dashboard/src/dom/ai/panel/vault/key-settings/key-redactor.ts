import { KEY_PREFIX_LEN, KEY_SHORT_THRESHOLD, KEY_SUFFIX_LEN } from "./constants.js";

const REDACTION_DOTS = 8;

export function redactKey(key: string): string {
    if (key.length <= KEY_SHORT_THRESHOLD) return "•".repeat(Math.max(REDACTION_DOTS, key.length));
    return key.slice(0, KEY_PREFIX_LEN) + "•".repeat(REDACTION_DOTS) + key.slice(-KEY_SUFFIX_LEN);
}
