import type { FormatPickerContext, JSONSchemaNode } from "./format-registry.js";

export interface EnumControlProps {
    readonly fieldName: string;
    readonly options: readonly string[];
    readonly labels: readonly string[] | null;
    readonly current: string;
    readonly onChange: (next: string) => void;
}

export interface StringControlProps {
    readonly fieldName: string;
    readonly schema: JSONSchemaNode;
    readonly current: string;
    readonly onChange: (next: string) => void;
    readonly ctx: FormatPickerContext;
}

export interface NumberControlProps {
    readonly fieldName: string;
    readonly schema: JSONSchemaNode;
    readonly current: number | null;
    readonly onChange: (next: number | null) => void;
}

export interface BooleanControlProps {
    readonly fieldName: string;
    readonly current: boolean;
    readonly onChange: (next: boolean) => void;
}

export interface ControlProps {
    readonly fieldName: string;
    readonly schema: JSONSchemaNode;
    readonly current: unknown;
    readonly onChange: (next: unknown) => void;
    readonly ctx: FormatPickerContext;
}

export interface RowProps {
    readonly fieldName: string;
    readonly schema: JSONSchemaNode;
    readonly current: unknown;
    readonly onChange: (next: unknown) => void;
    readonly ctx: FormatPickerContext;
}

export interface ObjectProps {
    readonly schema: JSONSchemaNode;
    readonly value: Readonly<Record<string, unknown>>;
    readonly onChange: (next: Record<string, unknown>) => void;
    readonly ctx: FormatPickerContext;
    readonly nested: boolean;
}
