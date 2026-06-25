import logger from "@clansocket/logger";
import type { Response } from "express";
import { HTTP_INTERNAL_ERROR, HTTP_OK } from "../../../shared/http/http-status.js";
import type { PreflightContext } from "./preflight.js";

export interface RespondListArgs<T> {
    res: Response;
    ctx: PreflightContext;
    routeName: string;
    responseKey: string;
    errorCode: string;
    loader: (clanId: string, guildId: string) => T;
}

export function respondGuildList<T>(args: RespondListArgs<T>): void {
    const { res, ctx, routeName, responseKey, errorCode, loader } = args;
    try {
        const data = loader(ctx.server.clan_id, ctx.guildId);
        res.status(HTTP_OK).json({ [responseKey]: data });
    } catch (err) {
        logger.error(`[discord] ${routeName} failed for ${ctx.guildId}: ${(err as Error).message}`);
        res.status(HTTP_INTERNAL_ERROR).json({ error: errorCode });
    }
}
