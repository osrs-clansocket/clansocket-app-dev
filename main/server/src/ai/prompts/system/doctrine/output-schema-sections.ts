import { OUTPUT_FIELDS } from "../../sources/output/output-fields.js";
import { mappedSection } from "../../sources/render.js";
import { resolveValueShape } from "./output-schema-renderers.js";

export function jsonExample(): string {
    const body = mappedSection(OUTPUT_FIELDS, (f) => `    "${f.name}": ${resolveValueShape(f.jsonValueShape)}`, ",\n");
    return `\`\`\`json\n{\n${body}\n}\n\`\`\``;
}

export function fieldReference(): string {
    const fields = mappedSection(OUTPUT_FIELDS, (f) => `- **\`${f.name}\`** — ${f.description}`);
    return `## field reference\n\n${fields}`;
}
