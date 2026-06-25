import { ERROR_DISCORD_OAUTH_NOT_CONFIGURED } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_SERVICE_UNAVAILABLE } from "../../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { randomBytes } from "node:crypto";
import { clanById, clanBySlug, accountById } from "../../../database/index.js";
import { installServer } from "../../../database/discord/servers/install.js";
import { resolveInstallerIdentity } from "../../../database/site/site-accounts/account-hash-binding.js";
import { botInstallUrl, exchangeInstall } from "../../oauth/discord-bot-install.js";
import {
    discordClientId,
    discordConfigured,
    publicBaseUrl,
    requireAccount,
    setStateCookie,
    validateOauthState,
} from "../oauth-session.js";
import { mountedRouter } from "../_mount-registry.js";
import { consumeClanCookie, setClanCookie } from "./bot-install-cookies.js";

const router = mountedRouter();
const DEFAULT_BOT_ID = "clansocket-default";

function gateStart(
    req: Request,
    res: Response,
): { sid: string; clan: NonNullable<ReturnType<typeof clanBySlug>> } | null {
    if (!discordConfigured()) {
        res.status(HTTP_SERVICE_UNAVAILABLE).json({ error: ERROR_DISCORD_OAUTH_NOT_CONFIGURED });
        return null;
    }
    const sid = requireAccount(req, res);
    if (!sid) return null;
    const slug = typeof req.query.slug === "string" ? req.query.slug : null;
    if (!slug) {
        res.status(HTTP_BAD_REQUEST).json({ error: "slug_required" });
        return null;
    }
    const clan = clanBySlug(slug);
    if (!clan) {
        res.status(HTTP_BAD_REQUEST).json({ error: "clan_not_found" });
        return null;
    }
    return { sid, clan };
}

interface CallbackContext {
    sid: string;
    clanId: string;
    clan: NonNullable<ReturnType<typeof clanById>>;
    code: string;
}

function gateCallback(req: Request, res: Response): CallbackContext | null {
    if (!discordConfigured()) {
        res.status(HTTP_SERVICE_UNAVAILABLE).json({ error: ERROR_DISCORD_OAUTH_NOT_CONFIGURED });
        return null;
    }
    const validated = validateOauthState(req, res);
    if (!validated.ok) return null;
    const sid = requireAccount(req, res);
    if (!sid) return null;
    const clanId = consumeClanCookie(req, res);
    if (!clanId) {
        res.status(HTTP_BAD_REQUEST).json({ error: "missing_install_clan" });
        return null;
    }
    const clan = clanById(clanId);
    if (!clan) {
        res.status(HTTP_BAD_REQUEST).json({ error: "clan_not_found" });
        return null;
    }
    return { sid, clanId, clan, code: validated.code };
}

interface InstallArgs {
    ctx: CallbackContext;
    redirectUri: string;
    result: Awaited<ReturnType<typeof exchangeInstall>>;
}

function performInstall(a: InstallArgs): void {
    const account = accountById(a.ctx.sid);
    const installer = resolveInstallerIdentity(a.ctx.sid);
    installServer({
        clanId: a.ctx.clanId,
        guildId: a.result.guildId,
        guildName: a.result.guildName,
        guildIconHash: a.result.guildIconHash,
        clanName: a.ctx.clan.display_name,
        botId: DEFAULT_BOT_ID,
        botName: null,
        installerSiteAccountId: a.ctx.sid,
        installerSiteAccountName: account?.display_name ?? null,
        installerAccountHash: installer.accountHash,
        installerRsn: installer.rsn,
        oauthScopesJson: JSON.stringify(["bot", "applications.commands"]),
        permissionsBitfield: a.result.permissions,
    });
}

(() => {
    router.get("/discord-bot-install/start", (req: Request, res: Response) => {
        const gate = gateStart(req, res);
        if (!gate) return;
        const state = randomBytes(32).toString("base64url");
        setStateCookie(res, req, state);
        setClanCookie(res, req, gate.clan.id);
        const redirectUri = `${publicBaseUrl(req)}/api/auth/site/discord-bot-install/callback`;
        res.redirect(botInstallUrl(discordClientId()!, state, redirectUri));
    });
})();

(() => {
    router.get("/discord-bot-install/callback", async (req: Request, res: Response) => {
        const ctx = gateCallback(req, res);
        if (!ctx) return;
        try {
            const redirectUri = `${publicBaseUrl(req)}/api/auth/site/discord-bot-install/callback`;
            const result = await exchangeInstall(
                discordClientId()!,
                process.env.DISCORD_CLIENT_SECRET!,
                ctx.code,
                redirectUri,
            );
            performInstall({ ctx, redirectUri, result });
            res.redirect(`/clans/${ctx.clan.slug}/manage/discord?installed=${encodeURIComponent(result.guildId)}`);
        } catch (err) {
            logger.error(`[site-auth] discord bot install callback failed: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).send("bot_install_failed");
        }
    });
})();

export default router;
