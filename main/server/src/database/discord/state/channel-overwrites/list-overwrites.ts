import { discordGuildDb } from "../../discord.js";
import type { ChannelOverwriteRow } from "../types.js";

const LIST_SQL = `
SELECT 'role' AS kind, channel_id, channel_name, role_id AS target_id, role_name AS target_name, guild_id, allow, deny
FROM discord_channel_role_overwrites
WHERE guild_id = ?
UNION ALL
SELECT 'member' AS kind, channel_id, channel_name, user_id AS target_id, NULL AS target_name, guild_id, allow, deny
FROM discord_channel_member_overwrites
WHERE guild_id = ?
ORDER BY channel_id, kind, target_id
`;

interface OverwriteSqlRow {
    kind: "role" | "member";
    channel_id: string;
    channel_name: string | null;
    target_id: string;
    target_name: string | null;
    guild_id: string;
    allow: string;
    deny: string;
}

function toOverwriteRow(r: OverwriteSqlRow): ChannelOverwriteRow {
    if (r.kind === "role") {
        return {
            kind: "role",
            channel_id: r.channel_id,
            channel_name: r.channel_name,
            role_id: r.target_id,
            role_name: r.target_name,
            guild_id: r.guild_id,
            allow: r.allow,
            deny: r.deny,
        };
    }
    return {
        kind: "member",
        channel_id: r.channel_id,
        channel_name: r.channel_name,
        user_id: r.target_id,
        guild_id: r.guild_id,
        allow: r.allow,
        deny: r.deny,
    };
}

export function overwritesByGuild(clanId: string, guildId: string): ChannelOverwriteRow[] {
    const db = discordGuildDb(clanId, guildId);
    const rows = db.prepare(LIST_SQL).all(guildId, guildId) as OverwriteSqlRow[];
    return rows.map(toOverwriteRow);
}
