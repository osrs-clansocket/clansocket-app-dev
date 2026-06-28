import type { Instance } from "../../../../../factory/index.js";
import type { JSONSchemaNode } from "../../../../../../state/flows/schema-types-reader.js";

export type { JSONSchemaNode };

export interface FormatPickerContext {
    readonly fieldName: string;
    readonly clanId: string;
    readonly capabilityId: string | null;
    readonly operationId: string | null;
}

export type FormatPicker = (
    schema: JSONSchemaNode,
    value: string,
    onChange: (next: string) => void,
    ctx: FormatPickerContext,
) => Instance;

const PICKERS = new Map<string, FormatPicker>();

export function registerFormat(format: string, picker: FormatPicker): void {
    PICKERS.set(format, picker);
}

export function getFormat(format: string | undefined): FormatPicker | null {
    if (!format) return null;
    return PICKERS.get(format) ?? null;
}
