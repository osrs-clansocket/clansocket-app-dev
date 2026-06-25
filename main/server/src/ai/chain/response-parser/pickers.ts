import { isNonEmpty } from "../../../shared/validators/non-empty-validator.js";

export { isNonEmpty };

export function pickString(raw: Record<string, unknown>, key: string): string | undefined {
    const v = raw[key];
    return isNonEmpty(v) ? v : undefined;
}

export function pickStringArray(raw: Record<string, unknown>, key: string): string[] | undefined {
    const v = raw[key];
    if (!Array.isArray(v)) return undefined;
    const arr = v.filter(isNonEmpty);
    return arr.length > 0 ? arr : undefined;
}

export function pickOpArray<T>(
    raw: Record<string, unknown>,
    key: string,
    normalize: (v: unknown) => T | null,
): T[] | undefined {
    const v = raw[key];
    if (!Array.isArray(v)) return undefined;
    const arr = v.map(normalize).filter((op): op is T => op !== null);
    return arr.length > 0 ? arr : undefined;
}
