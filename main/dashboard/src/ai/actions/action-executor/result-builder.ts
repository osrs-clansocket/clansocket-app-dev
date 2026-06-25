import type { ActionResult } from "../action-types.js";

export function ok(verb: string, target: string | null, meta?: Record<string, unknown>): ActionResult {
    const r: ActionResult = { verb, target, success: true };
    if (meta) r.meta = meta;
    return r;
}

export function fail(verb: string, target: string | null, error: string): ActionResult {
    return { verb, target, error, success: false };
}
