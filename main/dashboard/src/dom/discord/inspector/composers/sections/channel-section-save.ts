import { identityStore } from "../../../../../state/identity/stores/identity-store.js";
import {
    updateDiscordChannel,
    type DiscordChannel,
    type DiscordChannelState,
} from "../../../../../state/discord/client.js";
import { channelStateOf } from "../../../../../state/discord/channels/mappers/channel-mapper.js";

export async function saveChannelPatch(channel: DiscordChannel, patch: Partial<DiscordChannelState>): Promise<void> {
    const session = identityStore.session$();
    if (session === null) return;
    const before = channelStateOf(channel);
    const after: DiscordChannelState = { ...before, ...patch };
    await updateDiscordChannel(channel.guild_id, channel.channel_id, {
        userId: session.id,
        before,
        after,
    });
}
