import { asObject, asString } from "../../../../shared/coerce.js";

import { SLOT_REGISTRY } from "../../../persona/default-persona/preferences/slot-registry.js";

const PROSE_OVERRIDE_MAX_CHARS = 8192;

const SLOT_BY_KEY = new Map(SLOT_REGISTRY.map((s) => [s.key, s]));

const KNOWN_MODE_KEYS: ReadonlySet<string> = new Set([
    "mode_continuous",
    "mode_dashboard_actions",
    "mode_db_queries",
    "mode_memory_authoring",
    "mode_pin_unpin",
    "mode_profile_updates",
    "mode_suggested_replies",
    "mode_banter",
    "mode_inside_jokes",
    "mode_spontaneous_reactions",
    "mode_op_action",
    "mode_op_guide",
    "mode_op_tracker",
]);

function normalizeKeyedRecord<T>(
    raw: unknown,
    accept: (key: string, val: unknown) => T | undefined,
): Record<string, T> {
    const r = asObject(raw);
    if (r === null) return {};
    const out: Record<string, T> = {};
    for (const [key, val] of Object.entries(r)) {
        const v = accept(key, val);
        if (v !== undefined) out[key] = v;
    }
    return out;
}

export function normalizeModeOverrides(raw: unknown): Record<string, boolean> {
    return normalizeKeyedRecord<boolean>(raw, (key, val) =>
        KNOWN_MODE_KEYS.has(key) && typeof val === "boolean" ? val : undefined,
    );
}

function normalizeNumberOverride(meta: (typeof SLOT_REGISTRY)[number], raw: string): string | null {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return null;
    const min = meta.bounds?.min ?? Number.NEGATIVE_INFINITY;
    const max = meta.bounds?.max ?? Number.POSITIVE_INFINITY;
    if (n < min || n > max) return null;
    return String(n);
}

function normalizeSlotOverride(meta: NonNullable<ReturnType<typeof SLOT_BY_KEY.get>>, s: string): string | null {
    if (meta.type === "number") return normalizeNumberOverride(meta, s);
    if (s.length <= PROSE_OVERRIDE_MAX_CHARS) return s;
    return null;
}

export function normalizePersonaOverrides(raw: unknown): Record<string, string> {
    return normalizeKeyedRecord<string>(raw, (key, val) => {
        const meta = SLOT_BY_KEY.get(key);
        if (!meta) return undefined;
        const s = asString(val);
        if (s === null || s === "") return undefined;
        const coerced = normalizeSlotOverride(meta, s);
        return coerced ?? undefined;
    });
}
