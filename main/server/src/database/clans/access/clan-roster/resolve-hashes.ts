import type { PluginPresence } from "./types.js";
import { normalizeRsn, verifiedRsnMap } from "./lookups.js";

export interface RosterMemberLite {
    name: string;
    accountHash?: string | null;
}

export function resolveHashes(
    members: readonly RosterMemberLite[],
    result: Record<string, PluginPresence>,
): Record<string, string> {
    const hashByLowerName: Record<string, string> = {};
    let verified: Record<string, string> | undefined;
    for (const m of members) {
        const lower = m.name.toLowerCase();
        const entry: PluginPresence = { hasPlugin: false, isLive: false };
        result[lower] = entry;
        let hash = m.accountHash ?? undefined;
        if (hash === undefined) {
            verified ??= verifiedRsnMap();
            hash = verified[normalizeRsn(m.name)];
        }
        if (hash !== undefined) {
            entry.hasPlugin = true;
            hashByLowerName[lower] = hash;
        }
    }
    return hashByLowerName;
}
