import type { Request, Response } from "express";
import { HTTP_BAD_REQUEST } from "../../shared/http/http-status.js";
import { STATE_COOKIE } from "./oauth-session-constants.js";
import { readCookie } from "./reader-oauth-cookie.js";
import { clearOauthCookie } from "./writer-oauth-cookie.js";

export function validateOauthState(req: Request, res: Response): { code: string; ok: boolean } {
    const code = req.query.code;
    const state = req.query.state;
    const expected = readCookie(req, STATE_COOKIE);
    if (typeof code !== "string" || typeof state !== "string" || !expected || state !== expected) {
        clearOauthCookie(res, STATE_COOKIE);
        res.status(HTTP_BAD_REQUEST).send("invalid_oauth_state");
        return { code: "", ok: false };
    }
    clearOauthCookie(res, STATE_COOKIE);
    return { code, ok: true };
}
