import type { Request, Response } from "express";
import { requireAccount } from "../../../auth/site-routes/oauth-session.js";
import { isClanManager } from "../../../database/clans/access/clan-manager-store.js";
import { serverByGuild } from "../../../database/discord/resolve-server.js";
import type { RoutedServerRow } from "../../../database/discord/types.js";
import { HTTP_BAD_REQUEST, HTTP_FORBIDDEN } from "../../../shared/http/http-status.js";
import { ERR_GUILD_NOT_BOUND } from "./route-errors.js";

export interface ManagerContext {
    server: RoutedServerRow;
    guildId: string;
    sid: string;
}

export function asClanManager(req: Request, res: Response): ManagerContext | null {
    const sid = requireAccount(req, res);
    if (!sid) return null;
    const guildId = req.params.guildId as string;
    const server = serverByGuild(guildId);
    if (!server) {
        res.status(HTTP_BAD_REQUEST).json({ ok: false, reason: ERR_GUILD_NOT_BOUND });
        return null;
    }
    if (!isClanManager(sid, server.clan_id)) {
        res.status(HTTP_FORBIDDEN).json({ ok: false, reason: "not_clan_manager" });
        return null;
    }
    return { server, guildId, sid };
}
