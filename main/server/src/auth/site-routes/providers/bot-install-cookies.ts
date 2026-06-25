import type { Request, Response } from "express";
import { TEN_MINUTES_MS } from "../../../shared/time.js";
import { isHttps, readCookie } from "../oauth-session.js";

const INSTALL_CLAN_COOKIE = "bot_install_clan_id";
const COOKIE_MAX_AGE_MS = TEN_MINUTES_MS;

export function setClanCookie(res: Response, req: Request, clanId: string): void {
    res.cookie(INSTALL_CLAN_COOKIE, clanId, {
        httpOnly: true,
        sameSite: "lax",
        secure: isHttps(req),
        maxAge: COOKIE_MAX_AGE_MS,
    });
}

export function consumeClanCookie(req: Request, res: Response): string | null {
    const clanId = readCookie(req, INSTALL_CLAN_COOKIE);
    if (!clanId) return null;
    res.clearCookie(INSTALL_CLAN_COOKIE);
    return clanId;
}
