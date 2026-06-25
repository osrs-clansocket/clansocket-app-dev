import { isString } from "./validators/type-guards.js";

const MAX_CAUSED_BY_LENGTH = 128;

export function readCausedHeader(value: unknown): string | undefined {
    if (!isString(value)) return undefined;
    if (value.length === 0 || value.length > MAX_CAUSED_BY_LENGTH) return undefined;
    return value;
}
