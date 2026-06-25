import { clanPluginDb } from "../../core/database.js";

export interface PluginMetrics {
    totalSessions: number;
    uniqueAccounts: number;
    rsnChanges: number;
}

export function emptyPluginMetrics(): PluginMetrics {
    return { totalSessions: 0, uniqueAccounts: 0, rsnChanges: 0 };
}

export function getPluginMetrics(clanId: string, mode: string): PluginMetrics {
    const conn = clanPluginDb(clanId, mode);
    const totalSessions = (conn.prepare("SELECT COUNT(*) AS c FROM plugin_sessions").get() as { c: number }).c;
    const rsnChanges = (conn.prepare("SELECT COUNT(*) AS c FROM plugin_identity_drifts").get() as { c: number }).c;
    return { ...emptyPluginMetrics(), totalSessions, rsnChanges };
}
