import type { AdvanceContext } from "./advance-types.js";

export function pickEmittedStatus(status: unknown): string | null {
    if (Array.isArray(status)) return (status[0] as string | undefined) ?? null;
    if (typeof status === "string") return status;
    return null;
}

export function shouldContinue(c: AdvanceContext): boolean {
    const { parsed, appendedUserInput, readIds, queries, nextCtx } = c;
    const wantsChain = parsed.chain === true || appendedUserInput.length > 0;
    const wants = wantsChain || readIds.length > 0 || queries.length > 0 || nextCtx.length > 0;
    const hasActions =
        parsed.actions !== null && parsed.actions !== undefined && Object.keys(parsed.actions).length > 0;
    return wants && !hasActions;
}
