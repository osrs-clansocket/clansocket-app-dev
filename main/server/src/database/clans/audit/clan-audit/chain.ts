import { sha256Hex } from "../../../../shared/hash.js";
import type { HashableRow } from "./row-hash-types.js";

export { getLastHash } from "./last-hash-loader.js";
export type { HashableRow } from "./row-hash-types.js";

function canonicalize(row: HashableRow): string {
    return JSON.stringify({
        ts: row.ts,
        actor: row.actor,
        action: row.action,
        source: row.source,
        schema_version: row.schemaVersion,
        target_type: row.targetType,
        target_id: row.targetId,
        payload_json: row.payloadJson,
        prev_hash: row.prevHash,
    });
}

export function hashRow(row: HashableRow): string {
    return sha256Hex(canonicalize(row));
}
