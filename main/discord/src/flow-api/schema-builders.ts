import type { JSONSchema } from "./manifest-types.js";

export function objectSchema(properties: Record<string, JSONSchema>, required: readonly string[]): JSONSchema {
    return { type: "object", required: [...required], properties };
}
