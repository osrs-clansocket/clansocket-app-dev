import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { handleAsync } from "../../../api/middleware.js";
import { ClanAuditActions, DB_NAMES, getDb, recordClanAudit } from "../../../database/index.js";
import { ensureClanDir } from "../../../database/core/database.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { loadOwnedClan } from "../../load-owned-clan.js";
import { removeExistingIcons } from "../../icon/filesystem.js";
import { ICON_MIME_EXT, handleUpload } from "../../icon/upload-middleware.js";
import { normalizeUploadedIcon } from "../../icon/normalize.js";
import { mountedRouter } from "../_mount-registry.js";
import { brandingSnapshot } from "../../branding-snapshot.js";

const router = mountedRouter();

interface PriorIcon {
    icon_kind: string | null;
    icon_value: string | null;
    color: string | null;
}

interface FileGate {
    storedBuffer: Buffer;
    ext: string;
}

async function gateUploadFile(
    file: Express.Multer.File | undefined,
    clanId: string,
    res: Response,
): Promise<FileGate | null> {
    if (!file) {
        res.status(HTTP_BAD_REQUEST).json({ error: "no_file" });
        return null;
    }
    const ext = ICON_MIME_EXT[file.mimetype];
    if (!ext) {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_mime", mime: file.mimetype });
        return null;
    }
    try {
        const storedBuffer = await normalizeUploadedIcon(file.buffer, ext);
        return { storedBuffer, ext };
    } catch (err) {
        logger.warn?.(`[clans] icon upload normalize failed clanId=${clanId} mime=${file.mimetype} err=${String(err)}`);
        res.status(HTTP_BAD_REQUEST).json({ error: "process_failed" });
        return null;
    }
}

interface PersistArgs {
    clanId: string;
    ext: string;
    storedBuffer: Buffer;
}

async function persistIcon(a: PersistArgs): Promise<PriorIcon | undefined> {
    const db = getDb(DB_NAMES.APP);
    const prior = db.prepare(`SELECT icon_kind, icon_value, color FROM clansocket_clans WHERE id = ?`).get(a.clanId) as
        | PriorIcon
        | undefined;
    removeExistingIcons(a.clanId);
    const dir = ensureClanDir(a.clanId);
    await writeFile(resolve(dir, `icon${a.ext}`), a.storedBuffer);
    db.prepare(`UPDATE clansocket_clans SET icon_kind = 'image', icon_value = ? WHERE id = ?`).run(
        a.ext.slice(1),
        a.clanId,
    );
    return prior;
}

function auditIconUpload(clanId: string, siteAccountId: string, ext: string, prior: PriorIcon | undefined): void {
    recordClanAudit(clanId, {
        actor: siteAccountId,
        action: ClanAuditActions.BrandingUpdated,
        targetId: clanId,
        payload: {
            before: prior ? brandingSnapshot(prior.icon_kind, prior.icon_value, prior.color) : null,
            after: brandingSnapshot("image", ext.slice(1), prior?.color ?? null),
        },
    });
}

router.post(
    "/:slug/branding/upload",
    requireSiteAccount,
    handleUpload,
    handleAsync(async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
        if (!owned) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        const gate = await gateUploadFile(req.file, owned.id, res);
        if (!gate) return;
        const prior = await persistIcon({ clanId: owned.id, ext: gate.ext, storedBuffer: gate.storedBuffer });
        auditIconUpload(owned.id, siteAccountId, gate.ext, prior);
        res.json({ ok: true, iconKind: "image", iconValue: gate.ext.slice(1) });
    }),
);

export default router;
