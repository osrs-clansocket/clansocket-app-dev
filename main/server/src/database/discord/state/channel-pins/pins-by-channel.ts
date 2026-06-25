import { selectGuildRows } from "../list-guild-rows.js";
import type { ChannelPinRow } from "../types.js";

const LIST_SQL = `
SELECT message_id, channel_id, channel_name, guild_id, author_user_id, author_user_name,
       content, timestamp, attachments_json
FROM discord_channel_pins
WHERE channel_id = ?
ORDER BY timestamp DESC
`;

interface PinSqlRow {
    message_id: string;
    channel_id: string;
    channel_name: string | null;
    guild_id: string;
    author_user_id: string | null;
    author_user_name: string | null;
    content: string | null;
    timestamp: number;
    attachments_json: string;
}

function parseAttachments(json: string): string[] {
    try {
        const parsed = JSON.parse(json) as unknown;
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((v): v is string => typeof v === "string");
    } catch {
        return [];
    }
}

function toPinRow(r: PinSqlRow): ChannelPinRow {
    return {
        message_id: r.message_id,
        channel_id: r.channel_id,
        channel_name: r.channel_name,
        guild_id: r.guild_id,
        author_user_id: r.author_user_id,
        author_user_name: r.author_user_name,
        content: r.content,
        timestamp: r.timestamp,
        attachments: parseAttachments(r.attachments_json),
    };
}

export function listPinsChannel(clanId: string, guildId: string, channelId: string): ChannelPinRow[] {
    return selectGuildRows<PinSqlRow>(clanId, guildId, LIST_SQL, channelId).map(toPinRow);
}
