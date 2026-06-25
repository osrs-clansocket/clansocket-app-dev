import type Database from "better-sqlite3";
import { buildChangeEmitter } from "../change-inserter.js";
import type { PlayerIdentity } from "../projection-utils.js";
import type { EventContext, StatChange } from "./stat-types.js";

export function insertStatChange(
    conn: Database.Database,
    id: PlayerIdentity,
    ctx: EventContext,
    change: StatChange,
): void {
    const { envelope, where } = ctx;
    buildChangeEmitter(conn, "plugin_stats_changes", [
        "skill",
        "level_before",
        "level_after",
        "xp_before",
        "xp_after",
    ]).emit({
        id,
        envelope,
        where,
        dedupKind: "stats_change",
        dedupParts: [change.skill, change.levelBefore, change.levelAfter, change.xpBefore, change.xpAfter],
        specific: [change.skill, change.levelBefore, change.levelAfter, change.xpBefore, change.xpAfter],
    });
}
