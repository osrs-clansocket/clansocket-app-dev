import { inRange } from "../../shared/parsers/ascii-bounds.js";
import { isNonEmpty } from "../../shared/validators/non-empty-validator.js";
import type { WomPayload } from "../types/payload-type.js";

const MIN_UA_LENGTH = 2;
const MAX_UA_LENGTH = 64;
const UA_EXTRA_CHARS: ReadonlySet<string> = new Set(["_", "-", "#", "@", "."]);

function isUserAgent(v: unknown): v is string {
    if (typeof v !== "string" || v.length < MIN_UA_LENGTH || v.length > MAX_UA_LENGTH) return false;
    for (const c of v) {
        const ok = inRange(c, "A", "Z") || inRange(c, "a", "z") || inRange(c, "0", "9") || UA_EXTRA_CHARS.has(c);
        if (!ok) return false;
    }
    return true;
}

export function validateWomPayload(payload: unknown): payload is WomPayload {
    if (typeof payload !== "object" || payload === null) return false;
    const p = payload as Record<string, unknown>;
    if (!Number.isInteger(p.group_id) || (p.group_id as number) <= 0) return false;
    if (!isNonEmpty(p.verification_code)) return false;
    if (p.api_key !== undefined && !isNonEmpty(p.api_key)) return false;
    if (!isUserAgent(p.user_agent)) return false;
    return true;
}
