import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync } from "../../../api/middleware.js";
import { byoForClan } from "../../../database/discord/byo/byo-identity.js";
import { updateServerBot } from "../../../database/discord/servers/update-bot.js";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN, HTTP_INTERNAL_ERROR } from "../../../shared/http/http-status.js";
import { isPlainObject } from "../../../shared/validators/type-guards.js";
import { isLinker } from "../../byo-bot/auth/linker-gate.js";
import type { DiscordBotPayload } from "../../byo-bot/types/payload-type.js";
import { validateDiscordBot } from "../../byo-bot/validators/payload-validator.js";
import { verifyCreds } from "../../byo-bot/verifiers/token-verifier.js";

import { mountedRouter } from "../_mount-registry.js";
import { preflightClan } from "../route-common/preflight.js";
import { MOUNT_BYO_BOT } from "../route-common/route-paths.js";
import { persistLinkIdentity, type VerifyMetadata } from "./link-persist.js";

function guildIdOf(body: unknown): string | null {
    if (!isPlainObject(body)) return null;
    const value = body.guild_id;
    return typeof value === "string" && value.length > 0 ? value : null;
}

function authorizeExistingLinker(clanId: string, sid: string): boolean {
    const existing = byoForClan(clanId);
    if (!existing) return true;
    return isLinker(sid, clanId, existing.owner_site_account_id ?? "");
}

function maybeBindGuild(clanId: string, body: unknown, botId: string, botName: string): string | null {
    const requestedGuildId = guildIdOf(body);
    if (requestedGuildId === null) return null;
    const bound = updateServerBot(clanId, requestedGuildId, botId, botName);
    return bound ? requestedGuildId : null;
}

const router = mountedRouter(MOUNT_BYO_BOT);

interface PreVerifyGate {
    payload: DiscordBotPayload;
    metadata: VerifyMetadata;
}

interface VerifyGate {
    body: unknown;
    res: Response;
    clanId: string;
    sid: string;
}

async function gatePreVerify(a: VerifyGate): Promise<PreVerifyGate | null> {
    if (!validateDiscordBot(a.body)) {
        a.res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: "invalid_payload" });
        return null;
    }
    if (!authorizeExistingLinker(a.clanId, a.sid)) {
        a.res.status(HTTP_FORBIDDEN).json({ error: "not_linker_or_clan_owner" });
        return null;
    }
    const verifyResult = await verifyCreds(a.body);
    if (verifyResult.status !== "ok" || !verifyResult.public_metadata) {
        a.res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: verifyResult.status });
        return null;
    }
    return { payload: a.body as DiscordBotPayload, metadata: verifyResult.public_metadata as VerifyMetadata };
}

function respondLinked(
    res: Response,
    linked: { botId: string },
    metadata: VerifyMetadata,
    boundGuildId: string | null,
): void {
    res.json({
        ok: true,
        linked: {
            bot_id: linked.botId,
            username: metadata.username,
            application_id: metadata.application_id,
        },
        bound_guild_id: boundGuildId,
    });
}

router.post(
    "/:slug",
    handleAsync(async (req: Request, res: Response) => {
        const preflight = preflightClan(req, res);
        if (!preflight) return;
        const { clan, sid } = preflight;
        try {
            const gate = await gatePreVerify({ res, sid, body: req.body, clanId: clan.id });
            if (!gate) return;
            const linked = await persistLinkIdentity({ clan, sid, payload: gate.payload }, gate.metadata);
            if (!linked.ok) {
                res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: linked.reason });
                return;
            }
            const boundGuildId = maybeBindGuild(clan.id, req.body, linked.botId, gate.metadata.username);
            respondLinked(res, linked, gate.metadata, boundGuildId);
        } catch (err) {
            logger.error(`[discord-byo] link failed slug=${clan.slug}: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).json({ error: "link_failed" });
        }
    }),
);

export default router;
