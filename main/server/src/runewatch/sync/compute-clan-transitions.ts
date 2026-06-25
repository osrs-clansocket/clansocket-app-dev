import { listFlaggedClan, type FlaggedMember } from "../../database/site/runewatch/flagged-by-clan.js";
import { activeClanIds } from "../../database/site/runewatch/active-clan-ids.js";
import type { RunewatchCaseRow } from "../../database/site/runewatch/lookup-by-rsn.js";
import { emitHardAdded } from "../flow-emit/emit-hard-added.js";
import { emitHardCleared } from "../flow-emit/emit-hard-cleared.js";
import { emitSoftAdded } from "../flow-emit/emit-soft-added.js";
import { emitSoftCleared } from "../flow-emit/emit-soft-cleared.js";
import { invokePurge } from "../purge/invoke-purge.js";

export interface TransitionSummary {
    hardAdded: number;
    hardCleared: number;
    softAdded: number;
    softCleared: number;
    accountsPurged: number;
}

export type ClanFlagSnapshot = Record<string, FlaggedMember[]>;

function mapBy<T, V>(items: readonly T[], keyFn: (item: T) => string, valueFn: (item: T) => V): Record<string, V> {
    const r: Record<string, V> = {};
    for (const item of items) r[keyFn(item)] = valueFn(item);
    return r;
}

export const captureFlagSnapshot = (): ClanFlagSnapshot => mapBy(activeClanIds(), (id) => id, listFlaggedClan);
const indexByMember = (flagged: FlaggedMember[]) =>
    mapBy(
        flagged,
        (f) => f.rsn_normalized,
        (f) => f,
    );

type TierLevel = "hard" | "soft" | null;
const TIERS: readonly TierLevel[] = ["hard", "soft"];

const findOrNull = <T>(arr: readonly T[], pred: (v: T) => boolean): T | null => arr.find(pred) ?? null;
const pickCase = (cases: RunewatchCaseRow[], tier: TierLevel): RunewatchCaseRow | null =>
    findOrNull(cases, (c) => c.tier === tier);
const highestTier = (cases: RunewatchCaseRow[]): TierLevel => findOrNull(TIERS, (t) => pickCase(cases, t) !== null);
const tierAdded = (added: TierLevel, removed: TierLevel) => added === "hard" && removed !== "hard";

interface ForwardArgs {
    clanId: string;
    rsn: string;
    afterMember: FlaggedMember;
    beforeTier: TierLevel;
    summary: TransitionSummary;
}

interface ReverseArgs {
    clanId: string;
    beforeMember: FlaggedMember;
    afterTier: TierLevel;
    summary: TransitionSummary;
}

function handleForwardTransition(args: ForwardArgs): void {
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

function handleReverseTransition(args: ReverseArgs): void {
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

function diffClan(clanId: string, before: FlaggedMember[], after: FlaggedMember[], summary: TransitionSummary): void {
    const beforeMap = indexByMember(before);
    const afterMap = indexByMember(after);
    for (const [rsn, afterMember] of Object.entries(afterMap)) {
        const beforeMember = beforeMap[rsn] ?? null;
        const beforeTier = beforeMember ? highestTier(beforeMember.cases) : null;
        handleForwardTransition({ clanId, rsn, afterMember, beforeTier, summary });
    }
    for (const beforeMember of Object.values(beforeMap)) {
        const afterMember = afterMap[beforeMember.rsn_normalized] ?? null;
        const afterTier = afterMember ? highestTier(afterMember.cases) : null;
        handleReverseTransition({ clanId, beforeMember, afterTier, summary });
    }
}

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
