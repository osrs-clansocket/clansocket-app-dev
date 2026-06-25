import type { Client, PermissionResolvable } from "discord.js";
import type { PendingPublishRow } from "../loaders/publish-queue-loader.js";

interface PublishResult {
    snowflakeResolved?: string | null;
}

type PublishHandler = (client: Client, row: PendingPublishRow) => Promise<PublishResult>;

export interface PublisherRegistration {
    handler: PublishHandler;
    requiredBotPermission?: PermissionResolvable;
}
