import { listFlaggedClan } from "../../database/site/runewatch/flagged-by-clan.js";
import { activeClanIds } from "../../database/site/runewatch/active-clan-ids.js";
import { diffClan } from "./transitions/composer-transition.js";
import { mapBy } from "./transitions/tier-resolver.js";
import type { ClanFlagSnapshot, TransitionSummary } from "./transitions/transitions-types.js";

export type { ClanFlagSnapshot, TransitionSummary } from "./transitions/transitions-types.js";

export const captureFlagSnapshot = (): ClanFlagSnapshot => mapBy(activeClanIds(), (id) => id, listFlaggedClan);

export function emitClanTransitions(before: ClanFlagSnapshot, after: ClanFlagSnapshot): TransitionSummary {
    const summary: TransitionSummary = {
        hardAdded: 0,
        hardCleared: 0,
        softAdded: 0,
        softCleared: 0,
        accountsPurged: 0,
    };
    const clanIds = new Set<string>([...Object.keys(before), ...Object.keys(after)]);
    for (const clanId of clanIds) {
        diffClan(clanId, before[clanId] ?? [], after[clanId] ?? [], summary);
    }
    return summary;
}
