import { type Request, type Response } from "express";
import { streamDbChanges } from "../../data-rights/streams/db-changes-stream.js";
import { scopeKeyClan } from "../../data-rights/streams/writes-stream.js";
import { preflightClan } from "../../clans/preflights/clan-preflight.js";
import { mountedRouter } from "./_mount-registry.js";

const IDENTITY_TABLE = "clan_wom_identity";
const OUTBOUND_TABLE = "clan_wom_outbound_events";

const router = mountedRouter();

(() => {
    router.get("/:slug/stream", (req: Request, res: Response) => {
        const ctx = preflightClan(req, res);
        if (!ctx) return;
        const slug = ctx.clan.slug;
        streamDbChanges({
            req,
            res,
            scopeKey: scopeKeyClan(ctx.clan.id),
            tables: [IDENTITY_TABLE, OUTBOUND_TABLE],
            eventName: "wom",
            readyData: { slug },
            extras: { emitPayload: (event) => ({ slug, table: event.table }) },
        });
    });
})();

export default router;
