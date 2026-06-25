import { parseIsoMs } from "../../shared/time.js";
import { isNonBlank } from "../../shared/validators/type-guards.js";
import { mapAccountType, type ClanSocketAccountType } from "./account-type-mapper.js";
import { mapSkillsMap, type MappedSkillRow } from "./map-skills.js";
import { mapMetrics, type WomActivityMetric, type WomBossMetric, type WomSkillMetric } from "./metric-types.js";

interface WomSnapshotData {
    skills?: Record<string, WomSkillMetric>;
    bosses?: Record<string, WomBossMetric>;
    activities?: Record<string, WomActivityMetric>;
}

interface WomLatestSnapshot {
    createdAt?: string;
    importedAt?: string | null;
    data?: WomSnapshotData;
}

interface PlayerDetailsRaw {
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

function titleCaseSlug(slug: string): string {
    const parts = slug.split("_");
    const out: string[] = [];
    for (const part of parts) {
        if (part.length === 0) continue;
        out.push(part.charAt(0).toUpperCase() + part.slice(1));
    }
    return out.join(" ");
}

function mapBosses(bosses: Record<string, WomBossMetric> | undefined): MappedSnapshotBoss[] {
    return mapMetrics(bosses, (slug, m) =>
        typeof m.kills === "number" && m.kills > 0 ? { slug, sourceName: titleCaseSlug(slug), kc: m.kills } : null,
    );
}

function mapActivities(activities: Record<string, WomActivityMetric> | undefined): MappedSnapshotActivity[] {
    return mapMetrics(activities, (activityName, m) =>
        typeof m.score === "number" && m.score >= 0 ? { activityName, score: m.score } : null,
    );
}

export function playerToSnapshot(payload: unknown): MappedPlayerSnapshot | null {
    if (payload === null || typeof payload !== "object") return null;
    const raw = payload as PlayerDetailsRaw;
    const rsn = raw.displayName ?? raw.username;
    if (!isNonBlank(rsn)) return null;
    const snapshotData = raw.latestSnapshot?.data;
    const watermarkMs = parseIsoMs(raw.lastChangedAt) || parseIsoMs(raw.updatedAt);
    return {
        rsn,
        womPlayerId: typeof raw.id === "number" ? raw.id : null,
        accountType: mapAccountType(raw.type),
        updatedAtMs: watermarkMs,
        skills: mapSkillsMap(snapshotData?.skills),
        bosses: mapBosses(snapshotData?.bosses),
        activities: mapActivities(snapshotData?.activities),
    };
}
