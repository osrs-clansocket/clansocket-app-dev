import { apiRequest } from "../../fetchers/api-fetcher.js";
import type { WebhookRow } from "../types.js";
import type { WebhookTokenSync } from "./extract-token.js";

interface WebhookReplacement {
    oldWebhookId: string;
    newWebhookId: string;
}

export interface PostWebhooksReplace {
    guildId: string;
    channelId: string;
    webhooks: readonly WebhookRow[];
    tokens: readonly WebhookTokenSync[];
    replacement?: WebhookReplacement;
}

export function replaceWebhooks(args: PostWebhooksReplace): Promise<{ ok: boolean; count: number } | null> {
    const path = `/api/discord/state/webhooks/${encodeURIComponent(args.guildId)}/sync`;
    const body: object = args.replacement
        ? { channelId: args.channelId, webhooks: args.webhooks, tokens: args.tokens, replacement: args.replacement }
        : { channelId: args.channelId, webhooks: args.webhooks, tokens: args.tokens };
    return apiRequest<{ ok: boolean; count: number }>("POST", path, body);
}
