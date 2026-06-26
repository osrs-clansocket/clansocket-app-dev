import type { ClanSocketAccountType } from "./account-type-mapper.js";
import type { MappedSkillRow } from "./map-skills.js";
import type { WomActivityMetric, WomBossMetric, WomSkillMetric } from "./metric-types.js";

export interface WomSnapshotData {
    skills?: Record<string, WomSkillMetric>;
    bosses?: Record<string, WomBossMetric>;
    activities?: Record<string, WomActivityMetric>;
}

export interface WomLatestSnapshot {
    createdAt?: string;
    importedAt?: string | null;
    data?: WomSnapshotData;
}

export interface PlayerDetailsRaw {
    id?: number;
    username?: string;
    displayName?: string;
    type?: string;
    updatedAt?: string;
    lastChangedAt?: string | null;
    latestSnapshot?: WomLatestSnapshot | null;
}

export type MappedSnapshotSkill = MappedSkillRow;

export interface MappedSnapshotBoss {
    slug: string;
    sourceName: string;
    kc: number;
}

export interface MappedSnapshotActivity {
    activityName: string;
    score: number;
}

export interface MappedPlayerSnapshot {
    rsn: string;
    womPlayerId: number | null;
    accountType: ClanSocketAccountType;
    updatedAtMs: number;
    skills: MappedSnapshotSkill[];
    bosses: MappedSnapshotBoss[];
    activities: MappedSnapshotActivity[];
}
