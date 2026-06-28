import { humanize } from "./humanize.js";

export type JSONSchemaNode = Readonly<Record<string, unknown>>;

export function readFormat(schema: JSONSchemaNode): string | undefined {
    const f = schema.format;
    return typeof f === "string" ? f : undefined;
}

export function readType(schema: JSONSchemaNode): string | null {
    const t = schema.type;
    return typeof t === "string" ? t : null;
}

export function readTitle(schema: JSONSchemaNode, fallback: string): string {
    const t = schema.title;
    return typeof t === "string" ? t : humanize(fallback);
}
