import { type Request, type Response } from "express";
import { COOKIE_SITE_SESSION } from "../../auth/oauth-providers.js";
import { readCookie } from "../../auth/site-routes/oauth-session.js";
import { verifySiteSession } from "../../auth/site-session.js";
import { isSiteOwner } from "../site-owner.js";
import { logoVersion } from "../site-logo-derivation.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

(() => {
    router.get("/me", (req: Request, res: Response) => {
        const sessionId = readCookie(req, COOKIE_SITE_SESSION);
        const session = verifySiteSession(sessionId);
        res.json({ isOwner: isSiteOwner(session?.siteAccountId), logoVersion: logoVersion() });
    });
})();

export default router;
