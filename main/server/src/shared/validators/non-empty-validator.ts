import { isString } from "./type-guards.js";

export function isNonEmpty(v: unknown): v is string {
    return isString(v) && v.length > 0;
}
