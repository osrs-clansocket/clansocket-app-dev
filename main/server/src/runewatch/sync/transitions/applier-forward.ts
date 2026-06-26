import type { FlaggedMember } from "../../../database/site/runewatch/flagged-by-clan.js";
import { emitHardAdded } from "../../flow-emit/emit-hard-added.js";
import { emitSoftAdded } from "../../flow-emit/emit-soft-added.js";
import { invokePurge } from "../../purge/invoke-purge.js";
import { highestTier, pickCase, tierAdded } from "./tier-resolver.js";
import type { TierLevel, TransitionSummary } from "./transitions-types.js";

export interface TransitionForwardArgs {
    clanId: string;
    rsn: string;
    afterMember: FlaggedMember;
    beforeTier: TierLevel;
    summary: TransitionSummary;
}

export function applyTransitionForward(args: TransitionForwardArgs): void {
    const { clanId, rsn, afterMember, beforeTier, summary } = args;
    const afterTier = highestTier(afterMember.cases);
    if (tierAdded(afterTier, beforeTier)) {
        const hardCase = pickCase(afterMember.cases, "hard");
        if (!hardCase) return;
        emitHardAdded(clanId, afterMember.member_name, hardCase);
        const purge = invokePurge(rsn);
        summary.hardAdded += 1;
        summary.accountsPurged += purge.accountsPurged;
        return;
    }
    if (afterTier !== "soft" || beforeTier !== null) return;
    const softCase = pickCase(afterMember.cases, "soft");
    if (!softCase) return;
    emitSoftAdded(clanId, afterMember.member_name, softCase);
    summary.softAdded += 1;
}
