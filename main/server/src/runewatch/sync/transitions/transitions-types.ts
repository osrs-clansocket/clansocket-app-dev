import type { FlaggedMember } from "../../../database/site/runewatch/flagged-by-clan.js";

export interface TransitionSummary {
    hardAdded: number;
    hardCleared: number;
    softAdded: number;
    softCleared: number;
    accountsPurged: number;
}

export type ClanFlagSnapshot = Record<string, FlaggedMember[]>;
export type TierLevel = "hard" | "soft" | null;
