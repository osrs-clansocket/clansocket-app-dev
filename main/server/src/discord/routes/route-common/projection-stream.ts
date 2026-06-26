import type { Request, Response } from "express";
import { subscribeProjection } from "../../../data-rights/streams/subscriber-projection.js";
import type { ProjectionTopic } from "../../../data-rights/streams/projection-types.js";
import { isClanManager } from "../../../database/clans/access/clan-manager-store.js";
import { serverByGuild } from "../../../database/discord/resolve-server.js";
import { HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import { ERR_GUILD_NOT_BOUND } from "./route-errors.js";
import { openEventStream, writeSseFrame } from "../../../shared/http/sse-stream.js";

function gateStreamServer(req: Request, res: Response): ReturnType<typeof serverByGuild> | null {
    const sid = req.siteAccountId!;
    const guildId = req.params.guildId as string;
    const server = serverByGuild(guildId);
    if (!server) {
        res.status(HTTP_NOT_FOUND).json({ error: ERR_GUILD_NOT_BOUND });
        return null;
    }
    if (!isClanManager(sid, server.clan_id)) {
        res.status(HTTP_FORBIDDEN).json({ error: "not_clan_manager" });
        return null;
    }
    return server;
}

export function streamGuildProjection(
    req: Request,
    res: Response,
    cacheKeyPrefix: string,
    buildTopic: (clanId: string, guildId: string) => ProjectionTopic,
): void {
    const server = gateStreamServer(req, res);
    if (!server) return;
    const guildId = req.params.guildId as string;
    openEventStream(res);
    const handle = subscribeProjection(
        `${cacheKeyPrefix}:${server.clan_id}:${guildId}`,
        buildTopic(server.clan_id, guildId),
        (batch) => writeSseFrame(res, batch, dispose),
    );
    function dispose(): void {
        handle.unsubscribe();
    }
    writeSseFrame(res, { snapshot: handle.baseline }, dispose);
    req.on("close", dispose);
    req.on("error", dispose);
}
