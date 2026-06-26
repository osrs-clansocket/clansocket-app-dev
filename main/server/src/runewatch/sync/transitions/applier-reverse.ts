import type { FlaggedMember } from "../../../database/site/runewatch/flagged-by-clan.js";
import { emitHardCleared } from "../../flow-emit/emit-hard-cleared.js";
import { emitSoftCleared } from "../../flow-emit/emit-soft-cleared.js";
import { highestTier, pickCase, tierAdded } from "./tier-resolver.js";
import type { TierLevel, TransitionSummary } from "./transitions-types.js";

export interface TransitionReverseArgs {
    clanId: string;
    beforeMember: FlaggedMember;
    afterTier: TierLevel;
    summary: TransitionSummary;
}

export function applyTransitionReverse(args: TransitionReverseArgs): void {
    const { clanId, beforeMember, afterTier, summary } = args;
    const beforeTier = highestTier(beforeMember.cases);
    if (tierAdded(beforeTier, afterTier)) {
        const hardCase = pickCase(beforeMember.cases, "hard");
        if (hardCase?.hash) {
            emitHardCleared(clanId, beforeMember.member_name, hardCase.hash);
            summary.hardCleared += 1;
        }
    }
    if (beforeTier === "soft" && afterTier === null) {
        const softCase = pickCase(beforeMember.cases, "soft");
        if (softCase) {
            emitSoftCleared(clanId, beforeMember.member_name, softCase.source);
            summary.softCleared += 1;
        }
    }
}
