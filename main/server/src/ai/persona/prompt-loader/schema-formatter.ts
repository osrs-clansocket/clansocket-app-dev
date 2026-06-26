import type { FieldConstraint } from "../../schema/types-schema.js";
import { META_SCHEMA } from "../../schema/meta-schema.js";
import { STYLE_SCHEMA } from "../../schema/style-schema.js";

function formatSchema(schema: Record<string, FieldConstraint>): string {
    const lines: string[] = [];
    for (const [key, c] of Object.entries(schema)) {
        const parts = [`  ${key}: ${c.type}`];
        if (c.maxLength) parts.push(`maxLen=${c.maxLength}`);
        if (c.min !== undefined) parts.push(`min=${c.min}`);
        if (c.max !== undefined) parts.push(`max=${c.max}`);
        if (c.enumValues) parts.push(`enum=[${c.enumValues.join(",")}]`);
        if (c.description) parts.push(`— ${c.description}`);
        lines.push(parts.join(" "));
    }
    return lines.join("\n");
}

export function fillPlaceholders(content: string, data: Record<string, string>): string {
    let filled = content;
    const schemaMap: Record<string, Record<string, FieldConstraint>> = {
        "{{STYLE_SCHEMA}}": STYLE_SCHEMA,
        "{{META_SCHEMA}}": META_SCHEMA,
    };
    for (const [placeholder, schema] of Object.entries(schemaMap)) {
        if (filled.includes(placeholder)) filled = filled.replace(placeholder, formatSchema(schema));
    }
    for (const [key, value] of Object.entries(data)) {
        const tag = key.startsWith("__") && key.endsWith("__") ? `{{${key.slice(2, -2).toUpperCase()}}}` : null;
        if (tag && filled.includes(tag)) filled = filled.replaceAll(tag, value);
    }
    return filled;
}
