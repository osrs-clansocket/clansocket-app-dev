import { randomUUID } from "node:crypto";
import { discordGuildDb } from "../discord.js";

const INSERT_SQL = `INSERT INTO discord_draft_sessions (
    session_id, guild_id, owner_site_account_id, opened_at, base_snapshot_id,
    conflict_count, last_activity_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

const INITIAL_CONFLICTS = 0;

export interface OpenSessionInput {
    clanId: string;
    guildId: string;
    ownerSiteAccountId: string;
    baseSnapshotId?: string | null;
}

export function openDraftSession(input: OpenSessionInput): string {
    const now = Date.now();
    const sessionId = randomUUID();
    const db = discordGuildDb(input.clanId, input.guildId);
    db.prepare(INSERT_SQL).run(
        sessionId,
        input.guildId,
        input.ownerSiteAccountId,
        now,
        input.baseSnapshotId ?? null,
        INITIAL_CONFLICTS,
        now,
        now,
    );
    return sessionId;
}
