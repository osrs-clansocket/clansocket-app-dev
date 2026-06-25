import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { handleAsync } from "../../../api/middleware.js";
import { ClanAuditActions, recordClanAudit } from "../../../database/index.js";
import { ensureClanDir } from "../../../database/core/database.js";
import { requireSiteAccount } from "../../../auth/site-middleware.js";
import { loadOwnedClan } from "../../load-owned-clan.js";
import { pristineIconPath, removeCustomizedIcon, writeTransformSidecar } from "../../icon/filesystem.js";
import { SHARP_READABLE_EXTS, bakeCustomizedIcon } from "../../icon/bake.js";
import { parseTransform, type CustomizeTransform } from "../../icon/transform.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

interface PristineSource {
    path: string;
    ext: string;
}

function gateCustomizeSource(
    owned: { id: string },
    body: unknown,
    res: Response,
): { pristine: PristineSource; transform: CustomizeTransform } | null {
    const transform = parseTransform(body);
    if (!transform) {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_transform" });
        return null;
    }
    const pristine = pristineIconPath(owned.id);
    if (!pristine) {
        res.status(HTTP_BAD_REQUEST).json({ error: "no_pristine_icon" });
        return null;
    }
    if (!SHARP_READABLE_EXTS.has(pristine.ext)) {
        res.status(HTTP_BAD_REQUEST).json({ error: "source_not_tweakable", sourceExt: pristine.ext });
        return null;
    }
    return { pristine, transform };
}

interface BakeArgs {
    clanId: string;
    pristine: PristineSource;
    transform: CustomizeTransform;
}

async function bakeAndPersist(a: BakeArgs): Promise<{ outExt: ".webp" | ".png" }> {
    const pristineBuffer = await readFile(a.pristine.path);
    const outFormat: "webp" | "png" = a.pristine.ext === ".webp" ? "webp" : "png";
    const outExt: ".webp" | ".png" = outFormat === "webp" ? ".webp" : ".png";
    const baked = await bakeCustomizedIcon(pristineBuffer, a.transform, outFormat);
    removeCustomizedIcon(a.clanId);
    const dir = ensureClanDir(a.clanId);
    await writeFile(resolve(dir, `icon-customized${outExt}`), baked);
    writeTransformSidecar(a.clanId, a.transform);
    return { outExt };
}

function logBakeFailure(
    clanId: string,
    gate: NonNullable<ReturnType<typeof gateCustomizeSource>>,
    err: unknown,
): string {
    const message = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    logger.warn?.(
        `[clans] icon customize failed clanId=${clanId} sourceExt=${gate.pristine.ext} transform=${JSON.stringify(gate.transform)} err=${message}`,
    );
    return message;
}

function recordBakeSuccess(clanId: string, siteAccountId: string, ext: string, transform: CustomizeTransform): void {
    recordClanAudit(clanId, {
        actor: siteAccountId,
        action: ClanAuditActions.BrandingCustomized,
        targetId: clanId,
        payload: { customized: { ext, transform } },
    });
}

async function runCustomizeBake(
    owned: { id: string },
    siteAccountId: string,
    gate: NonNullable<ReturnType<typeof gateCustomizeSource>>,
    res: Response,
): Promise<void> {
    try {
        const { outExt } = await bakeAndPersist({
            clanId: owned.id,
            pristine: gate.pristine,
            transform: gate.transform,
        });
        recordBakeSuccess(owned.id, siteAccountId, outExt.slice(1), gate.transform);
        res.json({
            ok: true,
            iconKind: "image",
            customized: true,
            imageVersion: Date.now(),
            transform: gate.transform,
        });
    } catch (err) {
        res.status(HTTP_INTERNAL_ERROR).json({ error: "bake_failed", detail: logBakeFailure(owned.id, gate, err) });
    }
}

router.post(
    "/:slug/branding/customize",
    requireSiteAccount,
    handleAsync(async (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
        if (!owned) {
            res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
            return;
        }
        const gate = gateCustomizeSource(owned, req.body, res);
        if (!gate) return;
        await runCustomizeBake(owned, siteAccountId, gate, res);
    }),
);

router.post("/:slug/branding/customize/clear", requireSiteAccount, (req: Request, res: Response) => {
    const siteAccountId = req.siteAccountId!;
    const owned = loadOwnedClan(String(req.params.slug ?? "").toLowerCase(), siteAccountId);
    if (!owned) {
        res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
        return;
    }
    removeCustomizedIcon(owned.id);
    recordClanAudit(owned.id, {
        actor: siteAccountId,
        action: ClanAuditActions.BrandingCustomized,
        targetId: owned.id,
        payload: { customized: { cleared: true } },
    });
    res.json({ ok: true, customized: false, imageVersion: Date.now() });
});

export default router;
