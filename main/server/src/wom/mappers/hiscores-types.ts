import type { ClanSocketAccountType } from "./account-type-mapper.js";
import type { WomActivityMetric, WomBossMetric, WomSkillMetric } from "./metric-types.js";
import type { MappedSkillRow } from "./map-skills.js";
import type { MappedActivityRow } from "./map-activities.js";

export interface WomPlayerData {
    skills?: Record<string, WomSkillMetric>;
    bosses?: Record<string, WomBossMetric>;
    activities?: Record<string, WomActivityMetric>;
}

export interface WomGroupMembership {
    player?: { id?: number; username?: string; displayName?: string; type?: string };
    data?: WomPlayerData;
}

export type GroupHiscoresResponse = readonly WomGroupMembership[];

export interface MappedBossRow {
    sourceName: string;
    kc: number;
}

export interface MappedClanMember {
    rsn: string;
    womPlayerId: number | null;
    accountType: ClanSocketAccountType;
    skills: MappedSkillRow[];
    bosses: MappedBossRow[];
    activities: MappedActivityRow[];
}
