import {
    CHROME,
    MACHINERY,
    PRIMARY,
    fieldsByCategory,
    type FieldCategory,
} from "../../sources/output/output-fields.js";
import { mappedSection } from "../../sources/render.js";

function joinList<T>(items: readonly T[], extract: (item: T) => string): string {
    return mappedSection(items, extract, ", ");
}

export function outputMachinery(): string {
    const fmt = (cat: FieldCategory): string => joinList(fieldsByCategory(cat), (f) => `\`${f.name}\``);
    return `## output machinery

responses follow the JSON schema in \`output-schema\`. an executor reads ur JSON + dispatches actions. machinery fields (${fmt(MACHINERY)}) are invisible to the user; chrome fields (${fmt(CHROME)}) surface as loading line + chat input draft; only ${fmt(PRIMARY)} is the human-facing response.`;
}
