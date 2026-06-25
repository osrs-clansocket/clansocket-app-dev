import { identityStore } from "../../../identity/stores/identity-store.js";
import { createDiscordChannel, createDiscordWebhook } from "../../client.js";
import {
    DEFAULT_CHANNEL_NAME,
    DEFAULT_WEBHOOK_NAME,
} from "../../../../dom/pages/clans/manage/discord/modes/channels/create-dropdown/create-dropdown-constants.js";

export async function submitChannelCreate(
    guildId: string,
    channelType: number,
    parentId: string | null,
    name: string,
): Promise<boolean> {
    const session = identityStore.session$();
    if (session === null) return false;
    const result = await createDiscordChannel(guildId, {
        userId: session.id,
        name: name.length > 0 ? name : DEFAULT_CHANNEL_NAME,
        channelType,
        parentId,
    });
    return !("error" in result);
}

export async function submitWebhookCreate(guildId: string, channelId: string, name: string): Promise<boolean> {
    const session = identityStore.session$();
    if (session === null) return false;
    return createDiscordWebhook(guildId, {
        channelId,
        userId: session.id,
        name: name.length > 0 ? name : DEFAULT_WEBHOOK_NAME,
    });
}
