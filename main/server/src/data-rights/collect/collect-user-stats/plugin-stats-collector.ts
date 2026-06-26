import { clanPluginDb } from "../../../database/index.js";
import {
    PLUGIN_USER_CHILD_TABLES,
    PLUGIN_USER_TABLE_BY_NAME,
    PLUGIN_USER_TABLES,
} from "../../scopes/manifest/index.js";
import { statChildJoined, statOne } from "./stat-ops.js";
import type { StatsAcc } from "./stats-acc-types.js";
import { acc } from "./utils.js";

function collectChildStat(s: StatsAcc, pluginDb: ReturnType<typeof clanPluginDb>, key: string, hash: string): void {
    for (const child of PLUGIN_USER_CHILD_TABLES) {
        const parent = PLUGIN_USER_TABLE_BY_NAME[child.parentTable];
        if (!parent) continue;
        acc(
            s.stats,
            s.dbsTouched,
            key,
            statChildJoined({
                db: pluginDb,
                childTable: child.table,
                childParentKey: child.parentKey,
                parentTable: child.parentTable,
                parentKey: child.parentColumn,
                parentFilterColumn: parent.column,
                value: hash,
            }),
        );
    }
}

export function collectModeStats(s: StatsAcc, clanId: string, mode: string, accountHashes: readonly string[]): void {
    const pluginDb = clanPluginDb(clanId, mode);
    const pluginDbKey = `plugin:${clanId}:${mode}`;
    for (const hash of accountHashes) {
        for (const { table, column } of PLUGIN_USER_TABLES) {
            acc(s.stats, s.dbsTouched, pluginDbKey, statOne(pluginDb, table, column, hash));
        }
        collectChildStat(s, pluginDb, pluginDbKey, hash);
    }
}
