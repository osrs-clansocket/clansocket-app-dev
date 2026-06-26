export type FieldType = "text" | "html" | "url" | "color" | "number" | "icon" | "enum";

export interface FieldConstraint {
    type: FieldType;
    maxLength?: number;
    min?: number;
    max?: number;
    enumValues?: string[];
    pattern?: string;
    required?: boolean;
    defaultValue?: string;
    section?: string;
    description?: string;
}

export type ActionSchema = Record<string, FieldConstraint>;
