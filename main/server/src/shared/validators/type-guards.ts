export { isPlainObject } from "./is-plain-object.js";
export { isBoolean } from "./is-boolean.js";

export function isString(v: unknown): v is string {
    return typeof v === "string";
}

export function isNumber(v: unknown): v is number {
    return typeof v === "number" && Number.isFinite(v);
}

export function isNonBlank(v: unknown): v is string {
    return typeof v === "string" && v.length > 0;
}
