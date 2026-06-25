import { isObject } from "../is-object.js";

export function migrate12to13(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    delete parts.texture;
    return { ...raw, schemaVersion: 13, parts };
}
