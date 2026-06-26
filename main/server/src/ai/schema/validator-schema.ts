import type { FieldConstraint } from "./types-schema.js";

const HEX_SHORT_LEN = 4;
const HEX_LEN = 7;
const HEX_ALPHA_LEN = 9;

const HEX_COLOR_LENGTHS = new Set([HEX_SHORT_LEN, HEX_LEN, HEX_ALPHA_LEN]);
const NAMED_COLORS = new Set(["transparent", "inherit", "currentColor"]);

function isValidColor(v: string): boolean {
    if (v[0] === "#" && HEX_COLOR_LENGTHS.has(v.length)) return true;
    if (v.startsWith("rgb") || v.startsWith("hsl")) return true;
    return NAMED_COLORS.has(v);
}

function validateNumber(key: string, value: string, constraint: FieldConstraint): string | null {
    const n = parseFloat(value);
    if (isNaN(n)) return `${key}: not a valid number`;
    if (constraint.min !== undefined && n < constraint.min) return `${key}: below min ${constraint.min}`;
    if (constraint.max !== undefined && n > constraint.max) return `${key}: above max ${constraint.max}`;
    return null;
}

function validateEnum(key: string, value: string, constraint: FieldConstraint): string | null {
    if (!constraint.enumValues || constraint.enumValues.includes(value)) return null;
    return `${key}: must be one of [${constraint.enumValues.join(", ")}]`;
}

function validateByType(key: string, value: string, constraint: FieldConstraint): string | null {
    switch (constraint.type) {
        case "number":
            return validateNumber(key, value, constraint);
        case "color":
            return isValidColor(value) ? null : `${key}: not a valid color`;
        case "enum":
            return validateEnum(key, value, constraint);
        default:
            return null;
    }
}

export function validateField(key: string, value: string, constraint: FieldConstraint): string | null {
    if (constraint.required && !value) return `${key}: required`;
    if (!value) return null;
    if (constraint.maxLength && value.length > constraint.maxLength) {
        return `${key}: exceeds max length ${constraint.maxLength} (got ${value.length})`;
    }
    return validateByType(key, value, constraint);
}
