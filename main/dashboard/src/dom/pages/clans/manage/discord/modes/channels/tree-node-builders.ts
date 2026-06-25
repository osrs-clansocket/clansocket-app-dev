import type { TreeNode } from "../../../../../../factory";
import { selectDiscordItem } from "../../../../../../../state/discord/inspector-selection.js";
import type { DiscordChannel, DiscordWebhook } from "../../../../../../../state/discord/client.js";
import { buildSubFolder, isWebhookCapable } from "./webhook-tree-builder.js";
import {
    UNNAMED_FALLBACK,
    acceptFolder,
    acceptLeaf,
    dragKind,
    iconForType,
    sortedByPosition,
} from "./mode-constants.js";
import { channelRenameHandler, confirmDelete } from "./mode-actions.js";
import type { TreeContext } from "./mode-tree-types.js";

function leafFor(channel: DiscordChannel, ctx: TreeContext): TreeNode {
    const name = channel.name ?? UNNAMED_FALLBACK;
    return {
        kind: "leaf",
        key: channel.channel_id,
        label: name,
        icon: iconForType(channel.type),
        title: channel.topic ?? name,
        onClick: () => selectDiscordItem({ kind: "channel", data: channel }),
        onLabelEdit: channelRenameHandler(channel, ctx.guildId),
        actions: [
            {
                iconName: "trash",
                title: `Delete ${name}`,
                onClick: (host) => void confirmDelete(host, channel, ctx.guildId),
                danger: true,
            },
        ],
        dragKind: dragKind(channel),
        acceptDrops: acceptLeaf(channel),
        onReorder: ctx.onReorder,
    };
}

function pushWebhookSubfolder(
    parent: DiscordChannel,
    webhooks: readonly DiscordWebhook[],
    ctx: TreeContext,
    children: TreeNode[],
): void {
    if (webhooks.length === 0 || !isWebhookCapable(parent.type)) return;
    children.push(
        buildSubFolder({
            webhooks,
            channel: parent,
            expanded: ctx.expanded,
            toggle: ctx.toggle,
            guildId: ctx.guildId,
            host: ctx.treeHost,
        }),
    );
}

function folderActions(parent: DiscordChannel, name: string, ctx: TreeContext): TreeNode["actions"] {
    return [
        {
            iconName: "trash",
            title: `Delete ${name}`,
            onClick: (host) => void confirmDelete(host, parent, ctx.guildId),
            danger: true,
        },
    ];
}

function folderToggle(parent: DiscordChannel, ctx: TreeContext): () => void {
    return () => {
        selectDiscordItem({ kind: "channel", data: parent });
        ctx.toggle(parent.channel_id);
    };
}

function folderFor(
    parent: DiscordChannel,
    children: TreeNode[],
    webhooks: readonly DiscordWebhook[],
    ctx: TreeContext,
): TreeNode {
    const name = parent.name ?? UNNAMED_FALLBACK;
    pushWebhookSubfolder(parent, webhooks, ctx, children);
    return {
        children,
        kind: "folder",
        key: parent.channel_id,
        label: name,
        icon: iconForType(parent.type),
        isExpanded: ctx.expanded.has(parent.channel_id),
        onLabelEdit: channelRenameHandler(parent, ctx.guildId),
        actions: folderActions(parent, name, ctx),
        onToggle: folderToggle(parent, ctx),
        dragKind: dragKind(parent),
        acceptDrops: acceptFolder(parent),
        onReorder: ctx.onReorder,
    };
}

export function nodeForChannel(channel: DiscordChannel, ctx: TreeContext): TreeNode {
    const threads = ctx.threadsByParent.get(channel.channel_id) ?? [];
    const webhooks = ctx.webhooksByChannel.get(channel.channel_id) ?? [];
    const hasWebhooks = webhooks.length > 0 && isWebhookCapable(channel.type);
    if (threads.length === 0 && !hasWebhooks) return leafFor(channel, ctx);
    const childNodes: TreeNode[] = sortedByPosition(threads).map((c) => nodeForChannel(c, ctx));
    return folderFor(channel, childNodes, webhooks, ctx);
}

export { folderFor };
