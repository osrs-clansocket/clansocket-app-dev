import {
    EVENT_BANK_CLOSE,
    EVENT_BANK_OPEN,
    EVENT_BOOSTS,
    EVENT_COLLECTION_LOG_SNAPSHOT,
    EVENT_COMBAT_ACHIEVEMENTS_SNAPSHOT,
    EVENT_CONTAINER,
    EVENT_DIARIES,
    EVENT_PRAYERS,
    EVENT_QUESTS,
    EVENT_RUNE_POUCH,
    EVENT_SLAYER,
    EVENT_STATS,
} from "../../event-types.js";
import { isNonBlank } from "../../../shared/validators/type-guards.js";
import type { PluginClientMessage } from "../../types/index.js";
import type { DispatchContext } from "../dispatch-types.js";

const HASHED_SNAPSHOT_TYPES: ReadonlySet<string> = new Set([
    EVENT_BANK_CLOSE,
    EVENT_BANK_OPEN,
    EVENT_BOOSTS,
    EVENT_COLLECTION_LOG_SNAPSHOT,
    EVENT_COMBAT_ACHIEVEMENTS_SNAPSHOT,
    EVENT_CONTAINER,
    EVENT_DIARIES,
    EVENT_PRAYERS,
    EVENT_QUESTS,
    EVENT_RUNE_POUCH,
    EVENT_SLAYER,
    EVENT_STATS,
]);

export function isDuplicateSnapshot(state: DispatchContext["state"], msg: PluginClientMessage): boolean {
    if (!HASHED_SNAPSHOT_TYPES.has(msg.type)) return false;
    const incoming = (msg as { hash?: unknown }).hash;
    if (!isNonBlank(incoming)) return false;
    const dedupKey = `${msg.type}:${(msg as { containerId?: string }).containerId ?? ""}`;
    if (state.snapshotHashes.get(dedupKey) === incoming) return true;
    state.snapshotHashes.set(dedupKey, incoming);
    return false;
}
