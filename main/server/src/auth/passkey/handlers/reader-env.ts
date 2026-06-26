import { isProduction } from "./predicate-production.js";

export function envOrFallback(envKey: string, errorMsg: string, fallback: () => string): string {
    const v = process.env[envKey];
    if (v) return v;
    if (isProduction()) throw new Error(errorMsg);
    return fallback();
}
