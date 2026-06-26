import { asFiniteNumber, asObject, asString } from "../../shared/coerce.js";
import { boundedString } from "./reader-bounded-string.js";
import { MAX_ENTRY_FIELD_LENGTH, MAX_META_JSON_LENGTH, MAX_PARAM_LENGTH } from "./validator-constants.js";

export function readSessionId(raw: unknown): string | null {
    const s = asString(raw);
    return s !== null && s.length > 0 && s.length <= MAX_PARAM_LENGTH ? s : null;
}

export function readSeq(raw: unknown): number | null {
    const n = asFiniteNumber(raw);
    return n !== null && Number.isInteger(n) && n >= 0 ? n : null;
}

export function readEntryField(raw: unknown): string | null {
    return boundedString(raw, MAX_ENTRY_FIELD_LENGTH) ?? null;
}

export function readMeta(raw: unknown): Record<string, unknown> | null | false {
    if (raw === undefined || raw === null) return null;
    const obj = asObject(raw);
    if (obj === null || Array.isArray(raw)) return null;
    const serialized = JSON.stringify(obj);
    if (serialized.length > MAX_META_JSON_LENGTH) return false;
    return obj;
}
