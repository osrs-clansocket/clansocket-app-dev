import { isObject } from "../is-object.js";

export function migrate8to9(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    if (isObject(parts.world)) {
        const w = parts.world as Record<string, unknown>;
        parts.background = { backgroundColor: w.backgroundColor };
        parts.toneExposure = { toneMapping: w.toneMapping, exposure: w.exposure };
        delete parts.world;
    }
    return { ...raw, schemaVersion: 9, parts };
}
