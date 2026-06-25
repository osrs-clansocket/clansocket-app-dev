import logger from "@clansocket/logger";
import type { Request, Response } from "express";
import { HTTP_INTERNAL_ERROR } from "../../shared/http/http-status.js";
import { preflightClan, type ClanManagerContext } from "./clan-preflight.js";

export interface ClanTryOptions {
    label: string;
    errorCode: string;
}

export async function withClanTry(
    req: Request,
    res: Response,
    opts: ClanTryOptions,
    work: (ctx: ClanManagerContext) => Promise<void> | void,
): Promise<void> {
    const ctx = preflightClan(req, res);
    if (!ctx) return;
    try {
        await work(ctx);
    } catch (err) {
        logger.error(`[${opts.label}] failed slug=${ctx.clan.slug}: ${(err as Error).message}`);
        res.status(HTTP_INTERNAL_ERROR).json({ error: opts.errorCode });
    }
}
