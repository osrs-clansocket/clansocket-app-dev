import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync } from "../../../../api/middleware.js";
import { byoForBot } from "../../../../database/discord/byo/by-bot-id.js";
import { byGuildId } from "../../../../database/discord/servers/by-guild-id.js";
import { installServer } from "../../../../database/discord/servers/install.js";
import { resolveInstallerIdentity } from "../../../../database/site/site-accounts/account-hash-binding.js";
import { clanById } from "../../../../database/index.js";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../../shared/http/http-status.js";

import { mountedRouter } from "../../_mount-registry.js";
const ACTION_SKIPPED_NON_BYO = "skipped_non_byo_or_no_clan";
const ACTION_ALREADY_BOUND = "already_bound_same_bot";
const ACTION_BOUND = "bound";
const ACTION_CLAIMED = "routing_claimed_from_other_bot";
const DEFAULT_OAUTH_SCOPES = '["bot","applications.commands"]';
const DEFAULT_PERMISSIONS = 0;

interface AutoBindBody {
    bot_id: string;
    guild_id: string;
    guild_name: string;
}

const router = mountedRouter("/state");

interface AutoBindGate {
    identity: NonNullable<ReturnType<typeof byoForBot>>;
    clan: NonNullable<ReturnType<typeof clanById>>;
    existing: ReturnType<typeof byGuildId>;
    earlyAction: string | null;
}

function gateAutoBind(body: AutoBindBody): AutoBindGate | { earlyAction: string } {
    const identity = byoForBot(body.bot_id);
    if (!identity || !identity.clan_id) return { earlyAction: ACTION_SKIPPED_NON_BYO };
    const existing = byGuildId(body.guild_id);
    if (existing && existing.bot_id === body.bot_id) return { earlyAction: ACTION_ALREADY_BOUND };
    const clan = clanById(identity.clan_id);
    if (!clan) return { earlyAction: ACTION_SKIPPED_NON_BYO };
    return { identity, clan, existing, earlyAction: null };
}

function persistBind(
    body: AutoBindBody,
    identity: NonNullable<ReturnType<typeof byoForBot>>,
    clan: NonNullable<ReturnType<typeof clanById>>,
): void {
    const installer = resolveInstallerIdentity(identity.owner_site_account_id ?? null);
    installServer({
        guildId: body.guild_id,
        guildName: body.guild_name,
        guildIconHash: null,
        clanId: identity.clan_id!,
        clanName: clan.display_name,
        botId: body.bot_id,
        botName: identity.bot_name,
        installerSiteAccountId: identity.owner_site_account_id ?? "",
        installerSiteAccountName: null,
        installerAccountHash: installer.accountHash,
        installerRsn: installer.rsn,
        oauthScopesJson: DEFAULT_OAUTH_SCOPES,
        permissionsBitfield: DEFAULT_PERMISSIONS,
    });
}

router.post(
    "/servers/auto-bind",
    authenticate,
    handleAsync(async (req: Request, res: Response) => {
        const body = req.body as AutoBindBody;
        try {
            const gate = gateAutoBind(body);
            if (gate.earlyAction !== null) {
                res.status(HTTP_OK).json({ ok: true, action: gate.earlyAction });
                return;
            }
            const g = gate as AutoBindGate;
            persistBind(body, g.identity, g.clan);
            const action = g.existing ? ACTION_CLAIMED : ACTION_BOUND;
            logger.info(`[discord] auto-bind ${action}: bot=${body.bot_id} guild=${body.guild_id}`);
            res.status(HTTP_OK).json({ ok: true, action });
        } catch (err) {
            logger.error(
                `[discord] auto-bind failed bot=${body.bot_id} guild=${body.guild_id}: ${(err as Error).message}`,
            );
            res.status(HTTP_INTERNAL_ERROR).json({ error: "auto_bind_failed" });
        }
    }),
);

export default router;
