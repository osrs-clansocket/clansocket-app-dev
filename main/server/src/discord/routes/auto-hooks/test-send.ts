import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { enqueueOutboundEvent, webhookPostPayload } from "../../../database/discord/outbound/enqueue.js";
import type { RoutedServerRow } from "../../../database/discord/types.js";
import { maybeHealWebhook } from "../../../database/discord/webhook-heal/check-and-enqueue.js";
import { decryptedWebhookToken } from "../../../database/discord/webhook-tokens/get-decrypted.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { preflightGuild } from "../route-common/preflight.js";
import { MOUNT_AUTO_HOOKS } from "../route-common/route-paths.js";

import { mountedRouter } from "../_mount-registry.js";
import { TEST_PREFIX, pickWebhookId, renderEnvelope, type TestSendBody } from "./test-send-utils.js";

const RATE_LIMIT_ROUTE = "/guilds/:id";
const CLANSOCKET_PERMISSION = "discord:auto-hooks.update";
const TARGET_KIND = "webhook_post";

const router = mountedRouter(MOUNT_AUTO_HOOKS);

interface EnqueueArgs {
    server: RoutedServerRow;
    body: TestSendBody;
    guildId: string;
    webhookId: string;
    envelope: object;
    token: string;
}

function enqueueTestSend(a: EnqueueArgs): string {
    return enqueueOutboundEvent({
        botId: a.server.bot_id,
        botName: null,
        clanId: a.server.clan_id,
        targetKind: TARGET_KIND,
        targetId: a.webhookId,
        targetName: TEST_PREFIX + a.body.autoHookName,
        payload: webhookPostPayload(a.webhookId, a.envelope, a.token),
        guildId: a.guildId,
    });
}

interface TestSendOk {
    token: string;
    envelope: object;
    webhookId: string;
}

function gateTestSend(server: RoutedServerRow, guildId: string, body: TestSendBody, res: Response): TestSendOk | null {
    const webhookId = pickWebhookId(server.clan_id, guildId, body);
    maybeHealWebhook({ botId: server.bot_id, clanId: server.clan_id, webhookId, guildId });
    const token = decryptedWebhookToken(server.clan_id, guildId, webhookId);
    if (token === null) {
        res.status(HTTP_NOT_FOUND).json({ error: "webhook_token_missing" });
        return null;
    }
    const envelope = renderEnvelope(server, body, guildId, webhookId);
    if (envelope === null) {
        res.status(HTTP_BAD_REQUEST).json({ error: "unsupported_trigger" });
        return null;
    }
    return { token, envelope, webhookId };
}

function runTestSend(server: RoutedServerRow, guildId: string, body: TestSendBody, res: Response): void {
    try {
        const gate = gateTestSend(server, guildId, body, res);
        if (!gate) return;
        const queueId = enqueueTestSend({
            server,
            body,
            guildId,
            webhookId: gate.webhookId,
            envelope: gate.envelope,
            token: gate.token,
        });
        res.status(HTTP_OK).json({ ok: true, queueId });
    } catch (err) {
        logger.error(`[discord] auto-hook test-send failed for ${guildId}: ${(err as Error).message}`);
        res.status(HTTP_INTERNAL_ERROR).json({ error: "test_send_failed" });
    }
}

router.post(
    "/:guildId/test-send",
    validateGuildId,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as TestSendBody;
        const ctx = preflightGuild({
            req,
            res,
            clansocketPermission: CLANSOCKET_PERMISSION,
            rateLimitRoute: RATE_LIMIT_ROUTE,
            actorUserId: body.userId,
        });
        if (!ctx) return;
        runTestSend(ctx.server, ctx.guildId, body, res);
    }),
);

export default router;
