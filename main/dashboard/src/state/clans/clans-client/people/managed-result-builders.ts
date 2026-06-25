import type { ManagerSubmitResult } from "./types.js";
import { alreadyResult } from "./result-already.js";
import { grantedResult } from "./result-granted.js";

export function successResult(body: Record<string, unknown>): ManagerSubmitResult {
    if (body.alreadyManager === true) return alreadyResult(body);
    if (body.status === "granted") return grantedResult(body);
    return {
        ok: true,
        status: "awaiting-owner-approval",
        requestId: body.requestId as string,
        slug: body.slug as string,
        clanId: body.clanId as string,
        next: body.next as string | undefined,
    };
}
