import { type Request, type RequestHandler, type Response } from "express";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { pluginModes } from "../../database/index.js";
import { subscribeProjection } from "../../data-rights/streams/projection.js";
import { positionsTopic } from "../../data-rights/streams/topics/positions-topic.js";
import { getMapMeta, listMapPlanes } from "../../map-assets/world-map-db.js";
import { HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { bindStreamLifecycle, openEventStream, writeSseFrame } from "../../shared/http/sse-stream.js";
import { withClanMember, type ClanMemberContext } from "../require-clan-member.js";
import { mountedRouter } from "./_mount-registry.js";

interface ModeResolution {
    mode: string | null;
    available: string[];
    badRequest: boolean;
}

function resolvePluginMode(clanId: string, requested: unknown): ModeResolution {
    const available = pluginModes(clanId);
    const explicit = typeof requested === "string" && requested.length > 0 ? requested : "";
    const badRequest = explicit.length > 0 && !available.includes(explicit);
    const resolved = badRequest ? "" : explicit || available[0] || "";
    return { mode: resolved.length > 0 ? resolved : null, available, badRequest };
}

function clanMemberHandler(fn: (ctx: ClanMemberContext, req: Request, res: Response) => void): RequestHandler {
    return (req, res) => withClanMember(req, res, req.siteAccountId!, (ctx) => fn(ctx, req, res));
}

const router = mountedRouter();

(() => {
    router.get(
        "/:slug/positions",
        requireSiteAccount,
        clanMemberHandler((ctx, req, res) => {
            const { mode, available, badRequest } = resolvePluginMode(ctx.clanId, req.query.mode);
            if (badRequest) {
                res.status(HTTP_NOT_FOUND).json({ error: "mode_not_found", availableModes: available });
                return;
            }
            const rows = mode ? positionsTopic(ctx.clanId, mode).query() : [];
            res.json({ rows, mode, availableModes: available, mapMeta: getMapMeta(), planes: listMapPlanes() });
        }),
    );
})();

interface PositionsStreamArgs {
    clanId: string;
    mode: string;
    available: string[];
    req: Request;
    res: Response;
}

function streamPositions(a: PositionsStreamArgs): void {
    openEventStream(a.res);
    const handle = subscribeProjection(
        `clan_positions:${a.clanId}:${a.mode}`,
        positionsTopic(a.clanId, a.mode),
        (batch) => writeSseFrame(a.res, batch, dispose),
    );
    function dispose(): void {
        handle.unsubscribe();
    }
    writeSseFrame(
        a.res,
        {
            mode: a.mode,
            snapshot: handle.baseline,
            availableModes: a.available,
            mapMeta: getMapMeta(),
            planes: listMapPlanes(),
        },
        dispose,
    );
    bindStreamLifecycle(a.req, dispose);
}

(() => {
    router.get(
        "/:slug/positions/stream",
        requireSiteAccount,
        clanMemberHandler((ctx, req, res) => {
            const { mode, available, badRequest } = resolvePluginMode(ctx.clanId, req.query.mode);
            if (badRequest || !mode) {
                res.status(HTTP_NOT_FOUND).json({ error: "mode_not_found", availableModes: available });
                return;
            }
            streamPositions({ clanId: ctx.clanId, mode, available, req, res });
        }),
    );
})();

export default router;
