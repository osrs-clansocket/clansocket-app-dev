import logger from "@clansocket/logger";
import { DB_NAMES, clanPluginDb, getDb, pluginModes } from "../../database/index.js";

interface CleanupCounts {
    sessions: number;
    connections: number;
    states: number;
    prayers: number;
}

const SQL_CLOSE_SESSIONS = "UPDATE plugin_sessions SET disconnected_at = ? WHERE disconnected_at IS NULL";
const SQL_CLOSE_CONNECTIONS = `UPDATE plugin_connection_status
 SET ws_connected = 0, disconnected_at = $now, latency_ms = NULL, updated_at = $now
 WHERE ws_connected = 1`;
const SQL_CLEAR_STATES = `UPDATE plugin_current_state
 SET login_state = 'UNKNOWN', updated_at = ?
 WHERE login_state IN ('LOGGED_IN', 'LOADING', 'HOPPING', 'CONNECTION_LOST')
    OR (login_state IS NULL AND last_seen_in_game IS NOT NULL)`;
const SQL_CLEAR_PRAYERS = "UPDATE plugin_prayers SET active = 0, updated_at = ? WHERE active = 1";

function runCleanupQueries(db: ReturnType<typeof clanPluginDb>, now: number): CleanupCounts {
    return {
        sessions: db.prepare(SQL_CLOSE_SESSIONS).run(now).changes,
        connections: db.prepare(SQL_CLOSE_CONNECTIONS).run({ now }).changes,
        states: db.prepare(SQL_CLEAR_STATES).run(now).changes,
        prayers: db.prepare(SQL_CLEAR_PRAYERS).run(now).changes,
    };
}

function cleanupOneMode(clanSlug: string, clanId: string, mode: string, now: number): void {
    const counts = runCleanupQueries(clanPluginDb(clanId, mode), now);
    if (counts.sessions > 0 || counts.connections > 0 || counts.states > 0 || counts.prayers > 0) {
        logger.info(
            `[varez/boot-cleanup] clan=${clanSlug} mode=${mode} closed ${counts.sessions} sessions, ${counts.connections} connections, cleared ${counts.states} login states, cleared ${counts.prayers} active prayers from prior run`,
        );
    }
}

function cleanupClan(clan: { id: string; slug: string }, now: number): void {
    const modes = pluginModes(clan.id);
    for (const mode of modes) {
        cleanupOneMode(clan.slug, clan.id, mode, now);
    }
}

export function runPluginCleanup(): void {
    const appDb = getDb(DB_NAMES.APP);
    const clans = appDb.prepare("SELECT id, slug FROM clansocket_clans WHERE archived_at IS NULL").all() as {
        id: string;
        slug: string;
    }[];
    if (clans.length === 0) return;
    const now = Date.now();
    for (const clan of clans) {
        cleanupClan(clan, now);
    }
}
