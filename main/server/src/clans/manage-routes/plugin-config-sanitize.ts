import { isPlainObject } from "../../shared/validators/type-guards.js";

const SCHEMA_VERSION = 1;
const DENY_PREFIXES = ["$", "snap_hash.", "wikiav."];
const DENY_KEYS = new Set(["mode", "serverWsUrl"]);

function isDenylisted(key: string): boolean {
    for (const p of DENY_PREFIXES) {
        if (key.startsWith(p)) return true;
    }
    return DENY_KEYS.has(key);
}

export type PluginConfigValues = Record<string, string | number | boolean>;

function sanitizeValues(input: unknown): PluginConfigValues | null {
    if (!isPlainObject(input)) return null;
    const out: PluginConfigValues = {};
    for (const key of Object.keys(input)) {
        if (isDenylisted(key)) continue;
        const v = input[key];
        if (typeof v === "string" || typeof v === "boolean" || typeof v === "number") {
            out[key] = v;
        } else {
            return null;
        }
    }
    return out;
}

export function parseBodyValues(body: unknown): PluginConfigValues | null {
    if (!isPlainObject(body)) return null;
    if (body.version !== undefined && body.version !== SCHEMA_VERSION) return null;
    return sanitizeValues(body.values);
}
