import type { Request, Response } from "express";
import { secureCookieOptions } from "../secure-cookie.js";
import { readCookie } from "./reader-oauth-cookie.js";
import {
    LINK_COOKIE,
    OAUTH_PATH,
    ROOT_PATH,
    SESSION_COOKIE,
    SESSION_TTL_MS,
    STATE_COOKIE,
    STATE_TTL_MS,
} from "./oauth-session-constants.js";

interface SecureCookieArgs {
    res: Response;
    req: Request;
    name: string;
    value: string;
    maxAge: number;
    path: string;
}

function setSecureCookie(args: SecureCookieArgs): void {
    const { res, name, value, req, maxAge, path } = args;
    res.cookie(name, value, secureCookieOptions({ req, maxAge, path }));
}

export function clearOauthCookie(res: Response, name: string): void {
    res.clearCookie(name, { path: OAUTH_PATH });
}

export function setStateCookie(res: Response, req: Request, state: string): void {
    setSecureCookie({ res, req, name: STATE_COOKIE, value: state, maxAge: STATE_TTL_MS, path: OAUTH_PATH });
}

export function setLinkCookie(res: Response, req: Request, siteAccountId: string): void {
    setSecureCookie({ res, req, name: LINK_COOKIE, value: siteAccountId, maxAge: STATE_TTL_MS, path: OAUTH_PATH });
}

export function consumeLinkCookie(req: Request, res: Response): string | null {
    const v = readCookie(req, LINK_COOKIE);
    clearOauthCookie(res, LINK_COOKIE);
    return v ?? null;
}

export function setSessionCookie(res: Response, req: Request, sessionId: string): void {
    setSecureCookie({ res, req, name: SESSION_COOKIE, value: sessionId, maxAge: SESSION_TTL_MS, path: ROOT_PATH });
}
