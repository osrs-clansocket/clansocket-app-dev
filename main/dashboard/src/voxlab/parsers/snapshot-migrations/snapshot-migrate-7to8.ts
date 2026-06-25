import { isObject } from "../is-object.js";

export function migrate7to8(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    if (parts.texture === undefined) {
        parts.texture = { enabled: false };
    }
    return { ...raw, schemaVersion: 8, parts };
}
