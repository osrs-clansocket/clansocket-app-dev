import { parseIsoMs } from "../../shared/time/index.js";
import { isNonBlank } from "../../shared/validators/type-guards.js";
import { mapAccountType } from "./account-type-mapper.js";
import { mapSkillsMap } from "./map-skills.js";
import { mapActivities, mapBosses } from "./mapper-snapshot-metrics.js";
import type { MappedPlayerSnapshot, PlayerDetailsRaw } from "./snapshot-types.js";

export type {
    MappedPlayerSnapshot,
    MappedSnapshotActivity,
    MappedSnapshotBoss,
    MappedSnapshotSkill,
} from "./snapshot-types.js";

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
