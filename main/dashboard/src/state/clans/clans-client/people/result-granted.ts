import type { ManagerSubmitResult } from "./types.js";

export function grantedResult(body: Record<string, unknown>): ManagerSubmitResult {
    return {
        ok: true,
        status: "granted",
        slug: body.slug as string,
        clanId: body.clanId as string,
        rsn: body.rsn as string,
        rank: body.rank as string,
        message: body.message as string,
    };
}
