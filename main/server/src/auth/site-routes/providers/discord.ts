import { ERROR_DISCORD_OAUTH_NOT_CONFIGURED } from "../../../shared/error-reasons.js";
import { HTTP_INTERNAL_ERROR, HTTP_SERVICE_UNAVAILABLE } from "../../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { randomBytes } from "node:crypto";
import {
    LinkConflict,
    type OAuthLink,
    oauthShape,
    linkAccount,
    resolveAccount,
} from "../../../database/site/site-accounts/index.js";
import { mintSiteSession } from "../../site-session.js";
import { OAUTH_PROVIDER_DISCORD } from "../../oauth-providers.js";
import {
    avatarUrl as discordAvatarUrl,
    buildAuthorizeUrl as buildDiscordAuthorizeUrl,
    exchangeCodeToken as exchangeDiscordCode,
    fetchUser as fetchDiscordUser,
} from "../../oauth/discord.js";
import { consumeLinkCookie, setLinkCookie, setSessionCookie, setStateCookie } from "../writer-oauth-cookie.js";
import { discordClientId, discordConfigured, publicBaseUrl } from "../reader-oauth-config.js";
import { requireAccount } from "../requirer-oauth-account.js";
import { validateOauthState } from "../validator-oauth-state.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

function performLinkRedirect(linkSiteAccountId: string, args: OAuthLink, res: Response): void {
    try {
        linkAccount(linkSiteAccountId, args);
        res.redirect("/account?linked=discord");
    } catch (err) {
        if (err instanceof LinkConflict) {
            res.redirect(`/account?link_error=${err.conflict}`);
            return;
        }
        throw err;
    }
}

function startDiscord(req: Request, res: Response, linkMode: boolean): void {
    if (!discordConfigured()) {
        res.status(HTTP_SERVICE_UNAVAILABLE).json({ error: ERROR_DISCORD_OAUTH_NOT_CONFIGURED });
        return;
    }
    const state = randomBytes(32).toString("base64url");
    setStateCookie(res, req, state);
    if (linkMode) {
        const sid = requireAccount(req, res);
        if (!sid) return;
        setLinkCookie(res, req, sid);
    }
    const redirectUri = `${publicBaseUrl(req)}/api/auth/site/discord/callback`;
    res.redirect(buildDiscordAuthorizeUrl(discordClientId()!, state, redirectUri));
}

(() => {
    router.get("/discord/start", (req: Request, res: Response) => startDiscord(req, res, false));
})();
(() => {
    router.get("/discord/start-link", (req: Request, res: Response) => startDiscord(req, res, true));
})();

async function exchangeForLink(req: Request, code: string): Promise<OAuthLink> {
    const redirectUri = `${publicBaseUrl(req)}/api/auth/site/discord/callback`;
    const accessToken = await exchangeDiscordCode(
        discordClientId()!,
        process.env.DISCORD_CLIENT_SECRET!,
        code,
        redirectUri,
    );
    const dUser = await fetchDiscordUser(accessToken);
    return oauthShape(OAUTH_PROVIDER_DISCORD, dUser.id, dUser.global_name ?? dUser.username, discordAvatarUrl(dUser));
}

(() => {
    router.get("/discord/callback", async (req: Request, res: Response) => {
        if (!discordConfigured()) {
            res.status(HTTP_SERVICE_UNAVAILABLE).json({ error: ERROR_DISCORD_OAUTH_NOT_CONFIGURED });
            return;
        }
        const validated = validateOauthState(req, res);
        if (!validated.ok) return;
        try {
            const args = await exchangeForLink(req, validated.code);
            const linkSiteAccountId = consumeLinkCookie(req, res);
            if (linkSiteAccountId !== null) {
                performLinkRedirect(linkSiteAccountId, args, res);
                return;
            }
            const account = resolveAccount(args);
            const session = mintSiteSession(account.id);
            setSessionCookie(res, req, session.id);
            res.redirect("/");
        } catch (err) {
            logger.error(`[site-auth] discord callback failed: ${(err as Error).message}`);
            res.status(HTTP_INTERNAL_ERROR).send("oauth_exchange_failed");
        }
    });
})();

export default router;
