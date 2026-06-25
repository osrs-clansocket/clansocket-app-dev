import type { Request, Response } from "express";
import { resolveClanId } from "../../../database/discord/audit/resolve-clan.js";
import { serverByGuild } from "../../../database/discord/resolve-server.js";
import type { RoutedServerRow } from "../../../database/discord/types.js";
import { validateOperation } from "../../../database/discord/validators/validate-operation.js";
import { preflightClan } from "../../../clans/preflights/clan-preflight.js";
import type { ClanManagerContext } from "../../../clans/preflights/clan-preflight.js";
import {
    HTTP_BAD_REQUEST,
    HTTP_FORBIDDEN,
    HTTP_INTERNAL_ERROR,
    HTTP_NOT_FOUND,
} from "../../../shared/http/http-status.js";
import { ERR_GUILD_NOT_BOUND } from "./route-errors.js";

export { asClanManager } from "./manager-context.js";
export type { ManagerContext } from "./manager-context.js";

export { preflightClan };

export interface PreflightContext {
    server: RoutedServerRow;
    guildId: string;
}

export type PreflightClanContext = ClanManagerContext;

export interface PreflightGuildArgs {
    req: Request;
    res: Response;
    clansocketPermission: string;
    rateLimitRoute: string;
    actorUserId: string;
}

export function preflightGuild(args: PreflightGuildArgs): PreflightContext | null {
    const { req, res, clansocketPermission, rateLimitRoute, actorUserId } = args;
    const guildId = req.params.guildId as string;
    const server = serverByGuild(guildId);
    if (!server) {
        res.status(HTTP_BAD_REQUEST).json({ error: ERR_GUILD_NOT_BOUND });
        return null;
    }
    const validation = validateOperation(
        { requiredClansocketPermission: clansocketPermission, rateLimitRoute },
        { guildId, botId: server.bot_id, clanId: server.clan_id, userId: actorUserId },
    );
    if (!validation.ok) {
        res.status(HTTP_FORBIDDEN).json({ error: "validation_failed", failures: validation.failures });
        return null;
    }
    return { server, guildId };
}

export function preflightServer(req: Request, res: Response): PreflightContext | null {
    const guildId = req.params.guildId as string;
    const server = serverByGuild(guildId);
    if (!server) {
        res.status(HTTP_BAD_REQUEST).json({ error: ERR_GUILD_NOT_BOUND });
        return null;
    }
    return { server, guildId };
}

export interface ClanIdContext {
    clanId: string;
    guildId: string;
}

export function clanByGuild(req: Request, res: Response): ClanIdContext | null {
    const guildId = req.params.guildId as string;
    const clanId = resolveClanId(guildId);
    if (!clanId) {
        res.status(HTTP_NOT_FOUND).json({ error: ERR_GUILD_NOT_BOUND });
        return null;
    }
    return { clanId, guildId };
}

type CtxHandler<T> = (ctx: T, req: Request, res: Response) => Promise<void> | void;

function withPreflight<T>(
    preflightFn: (req: Request, res: Response) => T | null,
    handler: CtxHandler<T>,
): (req: Request, res: Response) => Promise<void> {
    return async (req: Request, res: Response): Promise<void> => {
        try {
            const ctx = preflightFn(req, res);
            if (!ctx) return;
            await handler(ctx, req, res);
        } catch (err) {
            if (!res.headersSent) res.status(HTTP_INTERNAL_ERROR).json({ error: "internal" });
            throw err;
        }
    };
}

type ClanCtxHandler = CtxHandler<ClanIdContext>;
type ServerHandler = CtxHandler<PreflightContext>;
type ClanHandler = CtxHandler<PreflightClanContext>;

export function withClanCtx(handler: ClanCtxHandler): (req: Request, res: Response) => Promise<void> {
    return withPreflight(clanByGuild, handler);
}

export function withServer(handler: ServerHandler): (req: Request, res: Response) => Promise<void> {
    return withPreflight(preflightServer, handler);
}

export function withClan(handler: ClanHandler): (req: Request, res: Response) => Promise<void> {
    return withPreflight(preflightClan, handler);
}
