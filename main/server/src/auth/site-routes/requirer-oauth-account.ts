import type { Request, Response } from "express";
import { ERROR_NOT_AUTHENTICATED } from "../../shared/error-reasons.js";
import { HTTP_UNAUTHORIZED } from "../../shared/http/http-status.js";
import { verifySiteSession } from "../site-session.js";
import { SESSION_COOKIE } from "./oauth-session-constants.js";
import { readCookie } from "./reader-oauth-cookie.js";

export function requireAccount(req: Request, res: Response): string | null {
    const sessionId = readCookie(req, SESSION_COOKIE);
    const session = verifySiteSession(sessionId);
    if (!session) {
        res.status(HTTP_UNAUTHORIZED).json({ error: ERROR_NOT_AUTHENTICATED });
        return null;
    }
    return session.siteAccountId;
}
