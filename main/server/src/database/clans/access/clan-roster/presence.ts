import { clanPluginDb, pluginModes } from "../../../core/database.js";
import { sqlPlaceholders } from "../../../core/operations/index.js";
import type { PluginPresence } from "./types.js";
import { resolveHashes, type RosterMemberLite } from "./resolve-hashes.js";

interface MarkModeArgs {
    clanId: string;
    mode: string;
    result: Record<string, PluginPresence>;
    hashByLowerName: Record<string, string>;
    allHashes: readonly string[];
}

function markModeLive(args: MarkModeArgs): void {
    const { clanId, mode, result, hashByLowerName, allHashes } = args;
    const liveRows = clanPluginDb(clanId, mode)
        .prepare(
            `SELECT DISTINCT account_hash FROM plugin_sessions
             WHERE disconnected_at IS NULL AND account_hash IN (${sqlPlaceholders(allHashes.length)})`,
        )
        .all(...allHashes) as { account_hash: string }[];
    if (liveRows.length === 0) return;
    const liveSet = new Set(liveRows.map((r) => r.account_hash));
    for (const [lower, hash] of Object.entries(hashByLowerName)) {
        if (!liveSet.has(hash)) continue;
        const entry = result[lower];
        if (entry) entry.isLive = true;
    }
}

function markLive(
    clanId: string,
    result: Record<string, PluginPresence>,
    hashByLowerName: Record<string, string>,
): void {
    const hashValues = Object.values(hashByLowerName);
    if (hashValues.length === 0) return;
    const allHashes = [...new Set(hashValues)];
    for (const mode of pluginModes(clanId)) {
        markModeLive({ clanId, mode, result, hashByLowerName, allHashes });
    }
}

export function getPluginPresence(
    clanId: string,
    members: readonly RosterMemberLite[],
): Record<string, PluginPresence> {
    const result: Record<string, PluginPresence> = {};
    if (members.length === 0) return result;
    markLive(clanId, result, resolveHashes(members, result));
    return result;
}
