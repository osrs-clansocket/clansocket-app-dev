import type { clanPluginDb } from "../../../core/database.js";

export interface SessionMeta {
    plugin_version: string;
}

export function lookupSessionMeta(conn: ReturnType<typeof clanPluginDb>, sessionId: string): SessionMeta {
    const row = conn.prepare("SELECT plugin_version FROM plugin_sessions WHERE session_id = ?").get(sessionId) as
        | SessionMeta
        | undefined;
    return { plugin_version: row?.plugin_version ?? "unknown" };
}
