import type { FieldConstraint } from "./types-schema.js";

const MAX_PX = 9999;

export function numRange(min: number, max: number, description?: string): FieldConstraint {
    return description !== undefined ? { type: "number", min, max, description } : { type: "number", min, max };
}

export function textField(maxLength: number, description?: string): FieldConstraint {
    return description !== undefined ? { type: "text", maxLength, description } : { type: "text", maxLength };
}

export function pxField(signed: boolean): FieldConstraint {
    return numRange(signed ? -MAX_PX : 0, MAX_PX);
}
