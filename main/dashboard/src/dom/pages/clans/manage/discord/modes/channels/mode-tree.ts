import type { TreeNode } from "../../../../../../factory";
import type { DiscordChannel, DiscordWebhook } from "../../../../../../../state/discord/client.js";
import { sortedByPosition } from "./mode-constants.js";
import type { BuildOrchestration, TreeContext } from "./mode-tree-types.js";
import { folderFor, nodeForChannel } from "./tree-node-builders.js";
import { groupTreeChannels } from "../../../../../../../state/discord/channels/mode-tree-grouper.js";

export { groupWebhooks } from "../../../../../../../state/discord/channels/mode-tree-grouper.js";

export function buildTreeNodes(
    channels: readonly DiscordChannel[],
    webhooksByChannel: ReadonlyMap<string, readonly DiscordWebhook[]>,
    orchestration: BuildOrchestration,
): TreeNode[] {
    const { categories, childrenByCat, threadsByParent, orphans } = groupTreeChannels(channels);
    const ctx: TreeContext = { ...orchestration, threadsByParent, webhooksByChannel };
    const out: TreeNode[] = [];
    for (const orphan of sortedByPosition(orphans)) out.push(nodeForChannel(orphan, ctx));
    for (const cat of sortedByPosition(categories)) {
        const catChildren = childrenByCat.get(cat.channel_id) ?? [];
        const childNodes: TreeNode[] = sortedByPosition(catChildren).map((c) => nodeForChannel(c, ctx));
        out.push(folderFor(cat, childNodes, [], ctx));
    }
    return out;
}
