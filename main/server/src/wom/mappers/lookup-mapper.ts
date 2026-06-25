import { isString } from "../../shared/validators/type-guards.js";

export function lookupOrFallback<T>(raw: unknown, table: Record<string, T>, fallback: T): T {
    if (!isString(raw)) return fallback;
    return table[raw.toLowerCase()] ?? fallback;
}
