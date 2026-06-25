import { mapAccountType } from "./account-type-mapper.js";
import { mapMetrics, type WomBossMetric } from "./metric-types.js";
import { mapSkillsMap } from "./map-skills.js";
import { mapActivitiesMap } from "./map-activities.js";
import type { GroupHiscoresResponse, MappedBossRow, MappedClanMember } from "./hiscores-types.js";

export type { MappedSkillRow } from "./map-skills.js";
export type { MappedActivityRow } from "./map-activities.js";
export type {
    GroupHiscoresResponse,
    MappedBossRow,
    MappedClanMember,
    WomGroupMembership,
    WomPlayerData,
} from "./hiscores-types.js";

function mapBossesMap(bosses: Record<string, WomBossMetric> | undefined): MappedBossRow[] {
    return mapMetrics(bosses, (sourceName, m) => (typeof m.kills === "number" ? { sourceName, kc: m.kills } : null));
}

export function mapGroupHiscores(response: GroupHiscoresResponse): MappedClanMember[] {
    const out: MappedClanMember[] = [];
    for (const entry of response) {
        const player = entry.player;
        if (!player || typeof player.username !== "string") continue;
        out.push({
            rsn: player.displayName ?? player.username,
            womPlayerId: typeof player.id === "number" ? player.id : null,
            accountType: mapAccountType(player.type),
            skills: mapSkillsMap(entry.data?.skills),
            bosses: mapBossesMap(entry.data?.bosses),
            activities: mapActivitiesMap(entry.data?.activities),
        });
    }
    return out;
}
