export type FieldKind = "boolean" | "string";

export interface PluginConfigField {
    key: string;
    label: string;
    description: string;
    kind: FieldKind;
    defaultValue: string | number | boolean;
}
