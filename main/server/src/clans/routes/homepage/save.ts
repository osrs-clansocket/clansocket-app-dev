import logger from "@clansocket/logger";
import { createHash } from "node:crypto";
import { type Request, type Response } from "express";
import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND, HTTP_OK } from "../../../shared/http/http-status.js";
import { ClanAuditActions, clanUiDb, recordClanAudit } from "../../../database/index.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { loadOwnedClan } from "../../load-owned-clan.js";
import { mountedRouter } from "../_mount-registry.js";
import { validateComponents, type ValidatedComponent } from "../../homepage/validate-component.js";
import { HOMEPAGE_INSERT_SQL } from "../../homepage/homepage-component-row.js";

function fingerprintComponents(components: ValidatedComponent[]): string {
    const hash = createHash("sha256");
    for (const c of components) {
        hash.update(c.componentId);
        hash.update("");
        hash.update(c.componentName);
        hash.update("");
        hash.update(JSON.stringify(c.payload));
        hash.update("");
        hash.update(JSON.stringify(c.tokenOverrides));
        hash.update("");
        hash.update(`${c.canvasX},${c.canvasY},${c.canvasW},${c.canvasH},${c.zIndex}`);
        hash.update("");
        hash.update(c.parentId ?? "");
        hash.update("");
    }
    return hash.digest("hex").slice(0, 16);
}

const router = mountedRouter();

function persistComponents(clanId: string, components: ValidatedComponent[], actorAccountHash: string): void {
    const db = clanUiDb(clanId);
    const now = Date.now();
    logger.debug(`[homepage.save] clan=${clanId} components=${components.length}`);
    db.transaction(() => {
        db.prepare("DELETE FROM clan_ui_components").run();
        const insert = db.prepare(HOMEPAGE_INSERT_SQL);
        for (const c of components) {
            insert.run(
                c.componentId,
                c.componentName,
                c.canvasX,
                c.canvasY,
                c.canvasW,
                c.canvasH,
                c.zIndex,
                JSON.stringify(c.payload),
                JSON.stringify(c.tokenOverrides),
                c.parentId,
                actorAccountHash,
                null,
                now,
            );
        }
    })();
}

(() => {
    router.put(
        "/:slug/homepage/components",
        requireSiteAccount,
        (req: Request, res: Response): void => {
        const siteAccountId = req.siteAccountId!;
        const slug = String(req.params.slug ?? "").toLowerCase();
        const owned = loadOwnedClan(slug, siteAccountId);
        if (!owned) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        const body = req.body as { components?: unknown };
        const { components, errors } = validateComponents(body?.components);
        if (errors.length > 0) {
            res.status(HTTP_BAD_REQUEST).json({ error: "validation_failed", errors });
            return;
        }
        persistComponents(owned.id, components, siteAccountId);
        const fingerprint = fingerprintComponents(components);
        recordClanAudit(owned.id, {
            actor: siteAccountId,
            action: ClanAuditActions.HomepageComponentsUpdated,
            targetId: owned.id,
            payload: { componentCount: components.length, fingerprint, errorCount: errors.length },
        });
            res.status(HTTP_OK).json({ ok: true, count: components.length, fingerprint });
        },
    );
})();

export default router;
