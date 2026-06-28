import type { JSONSchemaNode } from "./schema-types-reader.js";

export function readEnum(schema: JSONSchemaNode): readonly string[] | null {
    const e = schema.enum;
    if (!Array.isArray(e)) return null;
    return e.map((x) => String(x));
}

export function readEnumLabels(schema: JSONSchemaNode): readonly string[] | null {
    const labels = (schema as { enumLabels?: unknown }).enumLabels;
    if (!Array.isArray(labels)) return null;
    return labels.map((x) => String(x));
}
