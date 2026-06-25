import type { EventEnvelopeCols } from "../envelope.js";
import type { SpatialColumns } from "../projection-utils.js";

export interface SkillEntry {
    name?: string;
    skill?: string;
    level?: number;
    boosted?: number;
    xp?: number;
}

export interface PriorStat {
    level: number;
    xp: number;
}

export interface StatRow {
    skill: string;
    level: number;
    boosted: number;
    xp: number;
}

export interface StatChange {
    skill: string;
    levelBefore: number;
    levelAfter: number;
    xpBefore: number;
    xpAfter: number;
}

export interface EventContext {
    envelope: EventEnvelopeCols;
    where: SpatialColumns;
}
