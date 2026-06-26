import type { FlaggedMember } from "../../../database/site/runewatch/flagged-by-clan.js";
import type { RunewatchCaseRow } from "../../../database/site/runewatch/lookup-by-rsn.js";
import { findOrNull } from "../../../shared/util/util-finder.js";
import { indexBy, mapBy } from "../../../shared/util/util-mapper.js";
import type { TierLevel } from "./transitions-types.js";

const TIERS: readonly TierLevel[] = ["hard", "soft"];

export function pickCase(cases: RunewatchCaseRow[], tier: TierLevel): RunewatchCaseRow | null {
    return findOrNull(cases, (c) => c.tier === tier);
}

export function highestTier(cases: RunewatchCaseRow[]): TierLevel {
    return findOrNull(TIERS, (t) => pickCase(cases, t) !== null);
}

export function tierAdded(added: TierLevel, removed: TierLevel): boolean {
    return added === "hard" && removed !== "hard";
}

export function indexByMember(flagged: FlaggedMember[]): Record<string, FlaggedMember> {
    return indexBy(flagged, (f) => f.rsn_normalized);
}

export { mapBy };
