import type Database from "better-sqlite3";
import logger from "@clansocket/logger";

import { isNonBlank } from "../../../../shared/validators/type-guards.js";
import { recordIdentityDrift } from "../../projection/events/identity-drifts.js";
import type { PluginIdentityRecord } from "./types.js";

interface RecordDriftArgs {
    conn: Database.Database;
    identity: PluginIdentityRecord;
    existingRsn: string;
    sessionId: string;
    now: number;
}

export function recordDrift(args: RecordDriftArgs): void {
    const { conn, identity, existingRsn, sessionId, now } = args;
    const session = conn
        .prepare("SELECT plugin_version, schema_version FROM plugin_sessions WHERE session_id = ?")
        .get(sessionId) as { plugin_version: string; schema_version: number } | undefined;
    recordIdentityDrift({
        conn,
        now,
        accountHash: identity.accountHash,
        oldRsn: existingRsn,
        newRsn: identity.rsn,
        session: {
            sessionId,
            pluginVersion: session?.plugin_version ?? "unknown",
            schemaVersion: session?.schema_version ?? 0,
            batchSeq: 0,
            batchTick: 0,
        },
    });
    logger.warn(`[varez/security] rsn_drift acct=${identity.accountHash} old=${existingRsn} new=${identity.rsn}`);
}

interface SessionMeta {
    pluginVersion: string;
    schemaVersion: number;
}

function resolveSessionMeta(identity: PluginIdentityRecord, sessionId: string): SessionMeta {
    let pluginVersion = identity.pluginVersion;
    if (!isNonBlank(pluginVersion)) {
        logger.warn(
            `[plugin/session] missing pluginVersion at Identity handshake account=${identity.accountHash} session=${sessionId} — falling back to 'unknown' (PLUGIN-PROTOCOL-ADDITIONS.md §1)`,
        );
        pluginVersion = "unknown";
    }
    let schemaVersion = identity.schemaVersion;
    if (typeof schemaVersion !== "number") {
        logger.warn(
            `[plugin/session] missing schemaVersion at Identity handshake account=${identity.accountHash} session=${sessionId} — falling back to 0 (PLUGIN-PROTOCOL-ADDITIONS.md §1)`,
        );
        schemaVersion = 0;
    }
    return { pluginVersion, schemaVersion };
}

const SESSION_UPSERT_SQL = `INSERT INTO plugin_sessions
    (session_id, account_hash, rsn, world, world_types, plugin_version, schema_version, connected_at)
 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
 ON CONFLICT(session_id) DO UPDATE SET
    account_hash = excluded.account_hash,
    rsn = excluded.rsn,
    world = excluded.world,
    world_types = excluded.world_types,
    plugin_version = excluded.plugin_version,
    schema_version = excluded.schema_version`;

export function upsertSession(
    conn: Database.Database,
    sessionId: string,
    identity: PluginIdentityRecord,
    now: number,
): void {
    const worldTypes = identity.worldTypes && identity.worldTypes.length > 0 ? identity.worldTypes.join(",") : null;
    const meta = resolveSessionMeta(identity, sessionId);
    conn.prepare(SESSION_UPSERT_SQL).run(
        sessionId,
        identity.accountHash,
        identity.rsn,
        identity.world,
        worldTypes,
        meta.pluginVersion,
        meta.schemaVersion,
        now,
    );
}

const CURRENT_STATE_UPSERT_SQL = `INSERT INTO plugin_current_state
    (account_hash, latest_rsn, world, activity, clan_name, clan_rank, login_state, last_seen_in_game, last_session_id, account_type, first_seen, last_seen, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(account_hash) DO UPDATE SET
    latest_rsn = excluded.latest_rsn,
    world = excluded.world,
    activity = COALESCE(excluded.activity, plugin_current_state.activity),
    clan_name = excluded.clan_name,
    clan_rank = excluded.clan_rank,
    login_state = excluded.login_state,
    last_seen_in_game = excluded.last_seen_in_game,
    last_session_id = excluded.last_session_id,
    account_type = COALESCE(excluded.account_type, plugin_current_state.account_type),
    last_seen = excluded.last_seen,
    updated_at = excluded.updated_at`;

export function upsertCurrentState(
    conn: Database.Database,
    sessionId: string,
    identity: PluginIdentityRecord,
    now: number,
): void {
    conn.prepare(CURRENT_STATE_UPSERT_SQL).run(
        identity.accountHash,
        identity.rsn,
        identity.world,
        identity.activity ?? null,
        identity.clanName ?? null,
        identity.clanRank ?? null,
        "LOGGED_IN",
        now,
        sessionId,
        identity.accountType ?? null,
        now,
        now,
        now,
    );
}
