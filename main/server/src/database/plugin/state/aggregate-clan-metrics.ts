import { getClanDb, pluginModes } from "../../core/database.js";
import { clanById } from "../../clans/clan-store.js";
import { emptyPluginMetrics, getPluginMetrics, type PluginMetrics } from "./get-plugin-metrics.js";

export function clanPluginMetrics(clanId: string): PluginMetrics {
    const agg: PluginMetrics = emptyPluginMetrics();
    if (!clanById(clanId)) return agg;
    for (const mode of pluginModes(clanId)) {
        const m = getPluginMetrics(clanId, mode);
        agg.totalSessions += m.totalSessions;
        agg.rsnChanges += m.rsnChanges;
    }
    const row = getClanDb(clanId).prepare("SELECT COUNT(*) AS c FROM clan_accounts").get() as { c: number };
    agg.uniqueAccounts = row.c;
    return agg;
}
