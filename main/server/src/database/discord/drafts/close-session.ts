import { discordGuildDb } from "../../core/database.js";

const CLOSE_SQL = `UPDATE discord_draft_sessions
    SET closed_at = ?, closed_reason = ?, updated_at = ?
    WHERE session_id = ? AND closed_at IS NULL`;

export type CloseDraftReason = "applied" | "abandoned" | "timeout" | "error";

export interface CloseSessionInput {
    clanId: string;
    guildId: string;
    sessionId: string;
    reason: CloseDraftReason;
}

export function closeDraftSession(input: CloseSessionInput): boolean {
    const db = discordGuildDb(input.clanId, input.guildId);
    const now = Date.now();
    const result = db.prepare(CLOSE_SQL).run(now, input.reason, now, input.sessionId);
    return result.changes > 0;
}
