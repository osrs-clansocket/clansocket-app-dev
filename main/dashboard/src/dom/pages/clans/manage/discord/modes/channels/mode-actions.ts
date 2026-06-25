import { inlineConfirm, type Instance } from "../../../../../../factory";
import { channelStateOf } from "../../../../../../../state/discord/channels/mappers/channel-mapper.js";
import { identityStore } from "../../../../../../../state/identity/stores/identity-store.js";
import {
    deleteDiscordChannel,
    updateDiscordChannel,
    type DiscordChannel,
} from "../../../../../../../state/discord/client.js";
import { CATEGORY_TYPE, UNNAMED_FALLBACK } from "./mode-constants.js";

export { computeNewPlacement, isInvalidReorder } from "./mode-reorder.js";

export function channelRenameHandler(channel: DiscordChannel, guildId: string): (next: string) => Promise<boolean> {
    return async (next) => {
        const session = identityStore.session$();
        if (session === null) return false;
        const before = channelStateOf(channel);
        return updateDiscordChannel(guildId, channel.channel_id, {
            before,
            userId: session.id,
            after: { ...before, name: next },
        });
    };
}

export async function confirmDelete(host: Instance, channel: DiscordChannel, guildId: string): Promise<void> {
    const channelName = channel.name ?? UNNAMED_FALLBACK;
    const isCategory = channel.type === CATEGORY_TYPE;
    const ok = await inlineConfirm(host, {
        cancelLabel: "Cancel",
        confirmLabel: "Delete",
        danger: true,
        cancelContext: isCategory ? `keep category "${channelName}"` : `keep channel #${channelName}`,
        confirmContext: isCategory
            ? `confirm deleting category "${channelName}"`
            : `confirm deleting channel #${channelName}`,
    });
    if (!ok) return;
    const session = identityStore.session$();
    if (session === null) return;
    await deleteDiscordChannel(guildId, channel.channel_id, {
        channelName,
        userId: session.id,
        channelType: channel.type,
    });
}

export function commitParentMove(guildId: string, dragged: DiscordChannel, newParentId: string | null): void {
    const session = identityStore.session$();
    if (session === null) return;
    const before = channelStateOf(dragged);
    void updateDiscordChannel(guildId, dragged.channel_id, {
        before,
        userId: session.id,
        after: { ...before, parentId: newParentId },
    });
}
