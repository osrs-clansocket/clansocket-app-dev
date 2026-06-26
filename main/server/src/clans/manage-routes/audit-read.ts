import logger from "@clansocket/logger";
import {
    listAuditEntries,
    recordClanAudit,
    registerAuditListener,
    verifyAuditChain,
    type ClanAuditEntry,
} from "../../database/index.js";
import { HTTP_INTERNAL_ERROR } from "../../shared/http/http-status.js";
import { bindStreamLifecycle, openEventStream, writeSseFrame } from "../../shared/http/sse-stream.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { withManager } from "./manager-context.js";
import { parseIntParam } from "./parser-int-param.js";
import { readActorParam, readKindPrefix } from "./reader-bounded-string.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

interface ListAuditQuery {
    before: number;
    after: number;
    limit: number;
    kindPrefix?: string;
    kindExclude?: string;
    actorSiteAccountId?: string;
}

function parseAuditQuery(query: Record<string, unknown>): ListAuditQuery {
    return {
        before: parseIntParam(query.before, Date.now()),
        after: parseIntParam(query.after, 0),
        limit: parseIntParam(query.limit, 50),
        kindPrefix: readKindPrefix(query.kindPrefix),
        kindExclude: readKindPrefix(query.kindExclude),
        actorSiteAccountId: readActorParam(query.actor),
    };
}

(() => {
    router.get(
        "/:slug/manage/audit",
        requireSiteAccount,
        withManager((ctx, req, res) => {
            try {
                const q = parseAuditQuery(req.query as Record<string, unknown>);
                const result = listAuditEntries(ctx.clanId, q);
                recordClanAudit(ctx.clanId, {
                    actor: ctx.siteAccountId,
                    action: "server:read.audit_log",
                    targetId: ctx.clanId,
                    payload: {
                        count: result.entries.length,
                        cursor: { before: q.before, limit: q.limit, kindPrefix: q.kindPrefix },
                    },
                });
                res.json(result);
            } catch (err) {
                logger.error(`[clansocket_manage] audit list failed for ${ctx.clanId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "audit_list_failed" });
            }
        }),
    );
})();

(() => {
    router.get(
        "/:slug/manage/audit/stream",
        requireSiteAccount,
        withManager((ctx, req, res) => {
            openEventStream(res);
            const unsubscribe = registerAuditListener(ctx.clanId, (entry: ClanAuditEntry) => {
                writeSseFrame(res, entry, () => {
                    logger.debug(`[audit-stream] sse write failed clanId=${ctx.clanId}`);
                    unsubscribe();
                });
            });
            bindStreamLifecycle(req, unsubscribe);
        }),
    );
})();

(() => {
    router.get(
        "/:slug/manage/audit/verify",
        requireSiteAccount,
        withManager((ctx, _req, res) => {
            try {
                const result = verifyAuditChain(ctx.clanId);
                res.json(result);
            } catch (err) {
                logger.error(`[clansocket_manage] verify failed for ${ctx.clanId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "verify_failed" });
            }
        }),
    );
})();

export default router;
