import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { handleAsync } from "../../../api/middleware.js";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { ClanAuditActions, DB_NAMES, getDb, recordClanAudit } from "../../../database/index.js";
import { ensureClanDir } from "../../../database/core/database.js";
import { extractEnvelope, thumbnailUploader } from "../../../shared/http/envelope-upload.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { loadOwnedClan } from "../../load-owned-clan.js";
import { removeExistingIcons } from "../../icon/filesystem.js";
import { mountedRouter } from "../_mount-registry.js";
import { brandingSnapshot } from "../../branding-snapshot.js";

const VERSION_HEX_LEN = 16;

const handleVoxlabUploadMulter = thumbnailUploader("thumbnail");

const router = mountedRouter();

interface PriorBranding {
    icon_kind: string | null;
    icon_value: string | null;
    icon_voxlab_record: string | null;
    color: string | null;
}

async function writeThumbnail(clanId: string, buffer: Buffer, res: Response): Promise<boolean> {
    const thumbnailPath = resolve(ensureClanDir(clanId), "icon.png");
    try {
        await writeFile(thumbnailPath, buffer);
        return true;
    } catch (err) {
        logger.warn?.(`[clans] voxlab thumbnail write failed clanId=${clanId} err=${String(err)}`);
        res.status(HTTP_BAD_REQUEST).json({ error: "thumbnail_write_failed" });
        return false;
    }
}

interface PersistArgs {
    clanId: string;
    recordId: string;
    envelopeRaw: string;
}

function persistBranding(a: PersistArgs): PriorBranding | undefined {
    const db = getDb(DB_NAMES.APP);
    const prior = db
        .prepare(`SELECT icon_kind, icon_value, icon_voxlab_record, color FROM clansocket_clans WHERE id = ?`)
        .get(a.clanId) as PriorBranding | undefined;
    const recordBr = zlib.brotliCompressSync(Buffer.from(a.envelopeRaw, "utf8"));
    const recordVersion = crypto.createHash("sha256").update(a.envelopeRaw).digest("hex").slice(0, VERSION_HEX_LEN);
    db.prepare(
        `UPDATE clansocket_clans SET icon_kind = 'voxlab', icon_value = ?, icon_voxlab_record = ?, icon_voxlab_record_br = ?, icon_voxlab_record_version = ? WHERE id = ?`,
    ).run(a.recordId, a.envelopeRaw, recordBr, recordVersion, a.clanId);
    return prior;
}

interface AuditArgs {
    clanId: string;
    siteAccountId: string;
    recordId: string;
    prior: PriorBranding | undefined;
}

function auditBrandingUpdate(a: AuditArgs): void {
    recordClanAudit(a.clanId, {
        actor: a.siteAccountId,
        action: ClanAuditActions.BrandingUpdated,
        targetId: a.clanId,
        payload: {
            before: a.prior ? brandingSnapshot(a.prior.icon_kind, a.prior.icon_value, a.prior.color) : null,
            after: brandingSnapshot("voxlab", a.recordId, a.prior?.color ?? null),
        },
    });
}

router.post(
    "/:slug/branding/voxlab-publish",
    requireSiteAccount,
    handleVoxlabUploadMulter,
    handleAsync(async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
        if (!owned) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        const envelopeRaw = extractEnvelope(req, res);
        if (envelopeRaw === null) return;
        const thumbnail = req.file;
        if (!thumbnail) {
            res.status(HTTP_BAD_REQUEST).json({ error: "no_thumbnail" });
            return;
        }
        removeExistingIcons(owned.id);
        if (!(await writeThumbnail(owned.id, thumbnail.buffer, res))) return;
        const recordId = `voxlab-${Date.now().toString(36)}`;
        const prior = persistBranding({ clanId: owned.id, recordId, envelopeRaw });
        auditBrandingUpdate({ clanId: owned.id, siteAccountId, recordId, prior });
        res.json({ ok: true, iconKind: "voxlab", iconValue: recordId });
    }),
);

export default router;
