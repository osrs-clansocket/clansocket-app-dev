import type { FlaggedMember } from "../../../database/site/runewatch/flagged-by-clan.js";
import { applyTransitionForward } from "./applier-forward.js";
import { applyTransitionReverse } from "./applier-reverse.js";
import { highestTier, indexByMember } from "./tier-resolver.js";
import type { TransitionSummary } from "./transitions-types.js";

export function diffClan(
    clanId: string,
    before: FlaggedMember[],
    after: FlaggedMember[],
    summary: TransitionSummary,
): void {
    const beforeMap = indexByMember(before);
    const afterMap = indexByMember(after);
    for (const [rsn, afterMember] of Object.entries(afterMap)) {
        const beforeMember = beforeMap[rsn] ?? null;
        const beforeTier = beforeMember ? highestTier(beforeMember.cases) : null;
        applyTransitionForward({ clanId, rsn, afterMember, beforeTier, summary });
    }
    for (const beforeMember of Object.values(beforeMap)) {
        const afterMember = afterMap[beforeMember.rsn_normalized] ?? null;
        const afterTier = afterMember ? highestTier(afterMember.cases) : null;
        applyTransitionReverse({ clanId, beforeMember, afterTier, summary });
    }
}
