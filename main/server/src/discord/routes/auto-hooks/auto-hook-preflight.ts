import type { Request, Response } from "express";
import { preflightGuild, type PreflightContext } from "../route-common/preflight.js";

const RATE_LIMIT_ROUTE = "/guilds/:id";

export function autoHookPreflight(
    req: Request,
    res: Response,
    action: string,
    actorUserId: string,
): PreflightContext | null {
    return preflightGuild({
        req,
        res,
        actorUserId,
        clansocketPermission: `discord:auto-hooks.${action}`,
        rateLimitRoute: RATE_LIMIT_ROUTE,
    });
}
