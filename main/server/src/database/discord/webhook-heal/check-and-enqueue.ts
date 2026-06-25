import logger from "@clansocket/logger";
import { botApplicationId } from "../identities/get-application-id.js";
import { webhookOwnerInfo } from "../webhooks/get-application-id.js";
import { enqueueWebhookHeal } from "./enqueue.js";
import { isHealPending } from "./is-pending.js";

export interface HealWebhookInput {
    botId: string;
    clanId: string;
    guildId: string;
    webhookId: string;
}

interface HealGate {
    owner: NonNullable<ReturnType<typeof webhookOwnerInfo>>;
    botAppId: string;
}

function gateHeal(input: HealWebhookInput): HealGate | null {
    const owner = webhookOwnerInfo(input.clanId, input.guildId, input.webhookId);
    if (owner === null) return null;
    const botAppId = botApplicationId(input.botId);
    if (botAppId === null) return null;
    if (owner.applicationId === botAppId) return null;
    if (owner.name === null) {
        logger.warn(`webhook ${input.webhookId} needs heal but has no name; skipping`);
        return null;
    }
    if (isHealPending(input.webhookId)) {
        logger.info(`webhook heal already pending for ${input.webhookId}; skipping duplicate enqueue`);
        return null;
    }
    return { owner, botAppId };
}

export function maybeHealWebhook(input: HealWebhookInput): boolean {
    const gate = gateHeal(input);
    if (!gate) return false;
    enqueueWebhookHeal({
        botId: input.botId,
        botName: null,
        clanId: input.clanId,
        clanName: null,
        guildId: input.guildId,
        oldWebhookId: input.webhookId,
        channelId: gate.owner.channelId,
        name: gate.owner.name!,
        avatarUrl: gate.owner.avatarUrl,
    });
    logger.info(
        `webhook heal enqueued: ${input.webhookId} (app ${gate.owner.applicationId} → bot app ${gate.botAppId})`,
    );
    return true;
}
