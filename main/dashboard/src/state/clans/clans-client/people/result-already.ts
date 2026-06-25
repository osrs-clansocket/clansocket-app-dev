import type { ManagerSubmitResult } from "./types.js";

export function alreadyResult(body: Record<string, unknown>): ManagerSubmitResult {
    return {
        ok: true,
        alreadyManager: true,
        slug: body.slug as string | undefined,
        clanId: body.clanId as string | undefined,
    };
}
