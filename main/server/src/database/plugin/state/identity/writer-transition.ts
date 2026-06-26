import type { clanPluginDb } from "../../../core/database.js";
import { rowDedupHash } from "../../projection/envelope.js";

export interface TransitionWriteArgs {
    conn: ReturnType<typeof clanPluginDb>;
    accountHash: string;
    sessionId: string;
    rsn: string | null;
    stateBefore: string;
    loginState: string;
    pluginVersion: string;
    now: number;
}

export function writeTransitionRow(args: TransitionWriteArgs): void {
    const { conn, accountHash, sessionId, rsn, stateBefore, loginState, pluginVersion, now } = args;
    const dedup = rowDedupHash(accountHash, "login_state_transition", stateBefore, loginState, now);
    conn.prepare(
        `INSERT INTO plugin_login_state_transitions
            (account_hash, rsn, session_id, session_seq, event_received_at,
             plugin_version, state_before, state_after,
             world, x, y, plane, region_id, region_name, area, dedup_hash)
         VALUES ($accountHash, $rsn, $sessionId, 0, $now, $pluginVersion, $stateBefore, $loginState,
                 NULL, NULL, NULL, NULL, NULL, NULL, NULL, $dedup)
         ON CONFLICT(dedup_hash) DO NOTHING`,
    ).run({
        rsn: rsn ?? "",
        pluginVersion,
        accountHash,
        sessionId,
        stateBefore,
        loginState,
        dedup,
        now,
    });
}
