import { HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import {
    acceptsBrotli,
    applyVersionedCache,
    handledNotModified,
    setRevalidateCache,
} from "../../../shared/http/cache-headers.js";
import { type Request, type Response } from "express";
import { DB_NAMES, clanBySlug, getDb } from "../../../database/index.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

interface IconRecordRow {
    icon_voxlab_record: string | null;
    icon_voxlab_record_br: Buffer | null;
    icon_voxlab_record_version: string | null;
}

function loadIconRow(clanId: string): IconRecordRow | undefined {
    return getDb(DB_NAMES.APP)
        .prepare(
            `SELECT icon_voxlab_record, icon_voxlab_record_br, icon_voxlab_record_version FROM clansocket_clans WHERE id = ?`,
        )
        .get(clanId) as IconRecordRow | undefined;
}

function applyVersionCache(req: Request, res: Response, version: string | null): boolean {
    if (version === null) {
        setRevalidateCache(res);
        return false;
    }
    const etag = applyVersionedCache(req, res, version);
    return handledNotModified(req, res, etag);
}

function sendIconRecord(req: Request, res: Response, row: IconRecordRow): void {
    if (acceptsBrotli(req) && row.icon_voxlab_record_br !== null) {
        res.setHeader("Content-Encoding", "br");
        res.send(row.icon_voxlab_record_br);
        return;
    }
    res.send(row.icon_voxlab_record);
}

(() => {
    router.get("/:slug/icon-record", (req: Request, res: Response) => {
        const slug = String(req.params.slug ?? "").toLowerCase();
        const clan = clanBySlug(slug);
        if (!clan || clan.archived_at !== null) {
            res.status(HTTP_NOT_FOUND).end();
            return;
        }
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Vary", "Accept-Encoding");
        if (clan.icon_kind !== "voxlab") {
            setRevalidateCache(res);
            res.send("null");
            return;
        }
        const row = loadIconRow(clan.id);
        if (!row?.icon_voxlab_record) {
            setRevalidateCache(res);
            res.send("null");
            return;
        }
        if (applyVersionCache(req, res, row.icon_voxlab_record_version)) return;
        sendIconRecord(req, res, row);
    });
})();

export default router;
