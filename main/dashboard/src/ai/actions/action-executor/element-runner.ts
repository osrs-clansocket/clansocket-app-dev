import type { ActionResult } from "../action-types.js";
import { ERR_NOT_FOUND } from "./constants.js";
import { findByKey } from "./key-finder.js";
import { fail } from "./result-builder.js";

export function withFoundElement(key: string, verb: string, body: (el: HTMLElement) => ActionResult): ActionResult {
    const el = findByKey(key);
    if (!el) return fail(verb, key, ERR_NOT_FOUND);
    return body(el);
}
