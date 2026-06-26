import type { clanPluginDb } from "../../../core/database.js";

const LOGGED_STATE_SQL = `INSERT INTO plugin_current_state (account_hash, latest_rsn, login_state, last_seen_in_game, first_seen, last_seen, updated_at)
     VALUES ($accountHash, $rsn, $loginState, $now, $now, $now, $now)
     ON CONFLICT(account_hash) DO UPDATE SET
        login_state = excluded.login_state,
        last_seen_in_game = excluded.last_seen_in_game,
        last_seen = excluded.last_seen,
        updated_at = excluded.updated_at`;

const OFF_STATE_SQL = `INSERT INTO plugin_current_state (account_hash, latest_rsn, login_state, first_seen, last_seen, updated_at)
     VALUES ($accountHash, $rsn, $loginState, $now, $now, $now)
     ON CONFLICT(account_hash) DO UPDATE SET
        login_state = excluded.login_state,
        last_seen = excluded.last_seen,
        updated_at = excluded.updated_at`;

export interface CurrentStateWrite {
    conn: ReturnType<typeof clanPluginDb>;
    accountHash: string;
    rsn: string | null;
    loginState: string;
    now: number;
}

function upsertCurrentState(args: CurrentStateWrite, sql: string): void {
    const { conn, accountHash, rsn, loginState, now } = args;
    conn.prepare(sql).run({ rsn: rsn ?? "", accountHash, loginState, now });
}

export function writeLoggedState(args: CurrentStateWrite): void {
    upsertCurrentState(args, LOGGED_STATE_SQL);
}

export function writeOffState(args: CurrentStateWrite): void {
    upsertCurrentState(args, OFF_STATE_SQL);
}
