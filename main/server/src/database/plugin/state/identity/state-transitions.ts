import { clanPluginDb } from "../../../core/database.js";
import { lookupRsnHash } from "../../rsn-lookup.js";
import { rowDedupHash } from "../../projection/envelope.js";
import { clearActivePrayers } from "../../projection/prayers.js";

const IN_WORLD_LOGIN_STATES_DB: ReadonlySet<string> = new Set(["LOGGED_IN", "LOADING", "HOPPING", "CONNECTION_LOST"]);

export function recordPluginDisconnect(clanId: string, mode: string, sessionId: string): void {
    clanPluginDb(clanId, mode)
        .prepare(
            "UPDATE plugin_sessions SET disconnected_at = $now WHERE session_id = $sessionId AND disconnected_at IS NULL",
        )
        .run({ now: Date.now(), sessionId });
}

interface SessionMeta {
    plugin_version: string;
}

function lookupSessionMeta(conn: ReturnType<typeof clanPluginDb>, sessionId: string): SessionMeta {
    const row = conn.prepare("SELECT plugin_version FROM plugin_sessions WHERE session_id = ?").get(sessionId) as
        | SessionMeta
        | undefined;
    return { plugin_version: row?.plugin_version ?? "unknown" };
}

export interface LoginStateArgs {
    clanId: string;
    mode: string;
    sessionId: string;
    accountHash: string;
    stateBefore: string;
    loginState: string;
}

interface TransitionWriteArgs {
    conn: ReturnType<typeof clanPluginDb>;
    accountHash: string;
    sessionId: string;
    rsn: string | null;
    stateBefore: string;
    loginState: string;
    pluginVersion: string;
    now: number;
}

function writeTransitionRow(args: TransitionWriteArgs): void {
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

interface CurrentStateWrite {
    conn: ReturnType<typeof clanPluginDb>;
    accountHash: string;
    rsn: string | null;
    loginState: string;
    now: number;
}

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

function upsertCurrentState(args: CurrentStateWrite, sql: string): void {
    const { conn, accountHash, rsn, loginState, now } = args;
    conn.prepare(sql).run({ rsn: rsn ?? "", accountHash, loginState, now });
}

function writeLoggedState(args: CurrentStateWrite): void {
    upsertCurrentState(args, LOGGED_STATE_SQL);
}

function writeOffState(args: CurrentStateWrite): void {
    upsertCurrentState(args, OFF_STATE_SQL);
}

export function recordPluginLogin(args: LoginStateArgs): void {
    const { clanId, mode, sessionId, accountHash, stateBefore, loginState } = args;
    const conn = clanPluginDb(clanId, mode);
    const now = Date.now();
    const rsn = lookupRsnHash(clanId, accountHash);
    const meta = lookupSessionMeta(conn, sessionId);
    conn.transaction(() => {
        if (stateBefore !== loginState) {
            writeTransitionRow({
                conn,
                accountHash,
                sessionId,
                rsn,
                stateBefore,
                loginState,
                now,
                pluginVersion: meta.plugin_version,
            });
        }
        if (!IN_WORLD_LOGIN_STATES_DB.has(loginState)) clearActivePrayers(conn, accountHash, now);
        const stateArgs: CurrentStateWrite = { conn, accountHash, rsn, loginState, now };
        if (loginState === "LOGGED_IN") writeLoggedState(stateArgs);
        else writeOffState(stateArgs);
    })();
}

export function touchPluginCurrent(clanId: string, mode: string, accountHash: string, inWorld: boolean): void {
    const now = Date.now();
    const conn = clanPluginDb(clanId, mode);
    if (inWorld) {
        conn.prepare(
            "UPDATE plugin_current_state SET last_seen_in_game = $now, last_seen = $now, updated_at = $now WHERE account_hash = $accountHash",
        ).run({ now, accountHash });
    } else {
        conn.prepare("UPDATE plugin_current_state SET last_seen = ? WHERE account_hash = ?").run(now, accountHash);
    }
}
