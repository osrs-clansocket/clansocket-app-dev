import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import https from "node:https";
import { handleAsync, validateGuildId } from "../../../api/middleware.js";
import { upsertWebhookToken } from "../../../database/discord/webhook-tokens/upsert.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import { parseWebhookUrl } from "../../../shared/parsers/webhook-url-parser.js";
import { asClanManager, type ManagerContext } from "../route-common/preflight.js";

import { mountedRouter } from "../_mount-registry.js";
const HTTP_STATUS_OK = 200;

interface BindBody {
    webhook_url: string;
}

interface DiscordWebhookMetadata {
    id: string;
    token: string;
    guild_id: string | null;
    channel_id: string;
    name: string | null;
}

function fetchWebhookMetadata(webhookId: string, webhookToken: string): Promise<DiscordWebhookMetadata | null> {
    return new Promise((resolve, reject) => {
        const url = `https://discord.com/api/v10/webhooks/${webhookId}/${webhookToken}`;
        const req = https.get(url, (res) => {
            let body = "";
            res.on("data", (chunk: string) => {
                body += chunk;
            });
            res.on("end", () => {
                if (res.statusCode !== HTTP_STATUS_OK) {
                    resolve(null);
                    return;
                }
                try {
                    resolve(JSON.parse(body) as DiscordWebhookMetadata);
                } catch (err) {
                    reject(err);
                }
            });
        });
        req.on("error", reject);
    });
}

const router = mountedRouter("/webhook-tokens");

interface PersistArgs {
    ctx: ManagerContext;
    webhookId: string;
    webhookToken: string;
    metadata: DiscordWebhookMetadata;
}

function persistWebhookBinding(a: PersistArgs): void {
    upsertWebhookToken({
        clanId: a.ctx.server.clan_id,
        webhookId: a.webhookId,
        webhookName: a.metadata.name,
        channelId: a.metadata.channel_id,
        channelName: null,
        plaintextToken: a.webhookToken,
        acquiredByBotId: null,
        acquiredByBotName: null,
        boundBySiteAccountId: a.ctx.sid,
        boundBySiteAccountName: null,
        guildId: a.ctx.guildId,
    });
}

async function resolveWebhook(
    webhookUrl: string,
    guildId: string,
    res: Response,
): Promise<{ webhookId: string; webhookToken: string; metadata: DiscordWebhookMetadata } | null> {
    const parsed = parseWebhookUrl(webhookUrl);
    if (!parsed) {
        res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "invalid_url_format" });
        return null;
    }
    const metadata = await fetchWebhookMetadata(parsed.webhookId, parsed.webhookToken);
    if (!metadata) {
        res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "webhook_unreachable" });
        return null;
    }
    if (metadata.guild_id !== guildId) {
        res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "webhook_belongs_to_other_guild" });
        return null;
    }
    return { webhookId: parsed.webhookId, webhookToken: parsed.webhookToken, metadata };
}

async function runBind(ctx: ManagerContext, webhookUrl: string, res: Response): Promise<void> {
    try {
        const resolved = await resolveWebhook(webhookUrl, ctx.guildId, res);
        if (!resolved) return;
        persistWebhookBinding({
            ctx,
            webhookId: resolved.webhookId,
            webhookToken: resolved.webhookToken,
            metadata: resolved.metadata,
        });
        res.status(HTTP_OK).json({
            ok: true,
            bound: { webhook_id: resolved.webhookId, guild_id: ctx.guildId, channel_id: resolved.metadata.channel_id },
        });
    } catch (err) {
        logger.error(`[discord] webhook-token bind failed guildId=${ctx.guildId}: ${(err as Error).message}`);
        res.status(HTTP_INTERNAL_ERROR).json({ error: "webhook_token_bind_failed" });
    }
}

router.post(
    "/:guildId/bind",
    validateGuildId,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as BindBody;
        if (typeof body?.webhook_url !== "string") {
            res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "missing_url" });
            return;
        }
        const ctx = asClanManager(req, res);
        if (!ctx) return;
        await runBind(ctx, body.webhook_url, res);
    }),
);

export default router;
