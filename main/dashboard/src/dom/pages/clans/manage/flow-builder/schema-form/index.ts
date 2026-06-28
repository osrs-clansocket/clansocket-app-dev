import type { Instance } from "../../../../../factory/index.js";
import type { FormatPickerContext, JSONSchemaNode } from "./format-registry.js";
import { renderObject } from "./object-renderer.js";
import "./pickers/dynamic-picker.js";

export interface SchemaFormProps {
    readonly schema: JSONSchemaNode;
    readonly value: Readonly<Record<string, unknown>>;
    readonly onChange: (next: Record<string, unknown>) => void;
    readonly ctx: FormatPickerContext;
}

export function schemaForm(props: SchemaFormProps): Instance {
    return renderObject({ ...props, nested: false });
}
