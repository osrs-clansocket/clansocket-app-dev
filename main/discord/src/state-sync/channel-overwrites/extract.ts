import { OverwriteType, type GuildBasedChannel } from "discord.js";
import type { ChannelOverwriteRow } from "../types.js";

interface OverwriteBitfields {
    allow: string;
    deny: string;
}

function buildRoleRow(channel: GuildBasedChannel, overwriteId: string, bits: OverwriteBitfields): ChannelOverwriteRow {
    return {
        kind: "role",
        channel_id: channel.id,
        channel_name: channel.name ?? null,
        role_id: overwriteId,
        role_name: channel.guild.roles.cache.get(overwriteId)?.name ?? null,
        guild_id: channel.guild.id,
        allow: bits.allow,
        deny: bits.deny,
    };
}

function buildMemberRow(
    channel: GuildBasedChannel,
    overwriteId: string,
    bits: OverwriteBitfields,
): ChannelOverwriteRow {
    return {
        kind: "member",
        channel_id: channel.id,
        channel_name: channel.name ?? null,
        user_id: overwriteId,
        guild_id: channel.guild.id,
        allow: bits.allow,
        deny: bits.deny,
    };
}

export function extractChannelOverwrites(channel: GuildBasedChannel): ChannelOverwriteRow[] {
    if (!("permissionOverwrites" in channel)) return [];
    const out: ChannelOverwriteRow[] = [];
    for (const overwrite of channel.permissionOverwrites.cache.values()) {
        const bits = { allow: overwrite.allow.bitfield.toString(), deny: overwrite.deny.bitfield.toString() };
        out.push(
            overwrite.type === OverwriteType.Role
                ? buildRoleRow(channel, overwrite.id, bits)
                : buildMemberRow(channel, overwrite.id, bits),
        );
    }
    return out;
}
