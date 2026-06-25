import { discordGuildDb } from "../../discord.js";
import type { RoleOverwriteRow } from "../types.js";

const UPSERT_SQL = `
INSERT INTO discord_channel_role_overwrites (channel_id, channel_name, role_id, role_name, guild_id, allow, deny, updated_at)
VALUES (?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(channel_id, role_id) DO UPDATE SET
    channel_name = excluded.channel_name,
    role_name = excluded.role_name,
    guild_id = excluded.guild_id,
    allow = excluded.allow,
    deny = excluded.deny,
    updated_at = excluded.updated_at
`;

export function upsertRoleOverwrite(clanId: string, guildId: string, row: RoleOverwriteRow): void {
    const db = discordGuildDb(clanId, guildId);
    db.prepare(UPSERT_SQL).run(
        row.channel_id,
        row.channel_name,
        row.role_id,
        row.role_name,
        row.guild_id,
        row.allow,
        row.deny,
        Date.now(),
    );
}
