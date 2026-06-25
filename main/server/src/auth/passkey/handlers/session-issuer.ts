import type { Request, Response } from "express";
import { mintSiteSession } from "../../site-session.js";
import { COOKIE_SITE_SESSION } from "../../oauth-providers.js";
import { secureCookieOptions } from "../../secure-cookie.js";
import { MS_PER_DAY } from "../../../shared/time.js";

const SESSION_COOKIE_MAX_AGE_DAYS = 30;

export function issueSession(res: Response, req: Request, siteAccountId: string): string {
    const session = mintSiteSession(siteAccountId);
    res.cookie(
        COOKIE_SITE_SESSION,
        session.id,
        secureCookieOptions({
            req,
            maxAge: SESSION_COOKIE_MAX_AGE_DAYS * MS_PER_DAY,
        }),
    );
    return session.id;
}
