import { isObject } from "../is-object.js";

export function migrate11to12(raw: Record<string, unknown>): Record<string, unknown> {
    const parts = isObject(raw.parts) ? { ...(raw.parts as Record<string, unknown>) } : {};
    if (isObject(parts.surface)) {
        const s = { ...(parts.surface as Record<string, unknown>) };
        if (typeof s.flatShading === "boolean") {
            const flatShading = s.flatShading as boolean;
            const existingShading = isObject(parts.shading) ? (parts.shading as Record<string, unknown>) : {};
            parts.shading = {
                smoothShading:
                    typeof existingShading.smoothShading === "boolean" ? existingShading.smoothShading : false,
                flatShading,
            };
            delete s.flatShading;
            parts.surface = s;
        }
    }
    return { ...raw, schemaVersion: 12, parts };
}
