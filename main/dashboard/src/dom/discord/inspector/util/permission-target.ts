import type { DiscordChannelOverwrite } from "../../../../state/discord/client.js";
import { channelNameOr, memberDisplayOr, roleNameOr } from "../../../../state/discord/guild-state-cache.js";

export function targetIdOf(o: DiscordChannelOverwrite): string {
    return o.kind === "role" ? o.role_id : o.user_id;
}

export function targetNameOf(o: DiscordChannelOverwrite): string {
    const tid = targetIdOf(o);
    return o.kind === "role" ? roleNameOr(o.guild_id, tid, tid) : memberDisplayOr(o.guild_id, tid, tid);
}

export function channelNameFor(o: DiscordChannelOverwrite): string {
    return channelNameOr(o.guild_id, o.channel_id, o.channel_id);
}
