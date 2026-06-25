import { isPlainObject } from "../../shared/validators/type-guards.js";

export interface ParsedSub {
    readonly id: string;
    readonly kind: "projection" | "writes" | "identification";
    readonly raw: Record<string, unknown>;
}

export type ParseResult = { ok: true; subs: ParsedSub[] } | { ok: false; error: string; field?: string };

const fail = (error: string, field?: string): ParseResult => ({
    ok: false,
    error,
    ...(field !== undefined && { field }),
});

export function parseSubs(input: unknown): ParseResult {
    if (!Array.isArray(input)) return fail("bad_subs_shape");
    const subs: ParsedSub[] = [];
    for (const raw of input) {
        if (!isPlainObject(raw)) return fail("bad_sub_entry");
        if (typeof raw.id !== "string") return fail("bad_sub_fields", "id");
        if (raw.kind !== "projection" && raw.kind !== "writes" && raw.kind !== "identification") {
            return fail("unknown_kind", String(raw.kind));
        }
        subs.push({ id: raw.id, kind: raw.kind, raw });
    }
    return { ok: true, subs };
}
