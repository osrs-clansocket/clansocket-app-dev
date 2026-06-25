import type { Instance, ReorderEvent } from "../../../../../../factory";
import type { DiscordChannel, DiscordWebhook } from "../../../../../../../state/discord/client.js";

export interface BuildOrchestration {
    expanded: Set<string>;
    toggle: (key: string) => void;
    guildId: string;
    onReorder: (event: ReorderEvent) => void;
    treeHost: Instance;
}

export interface TreeContext extends BuildOrchestration {
    threadsByParent: ReadonlyMap<string, readonly DiscordChannel[]>;
    webhooksByChannel: ReadonlyMap<string, readonly DiscordWebhook[]>;
}
