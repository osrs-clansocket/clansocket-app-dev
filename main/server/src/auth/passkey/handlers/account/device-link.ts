import { HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../../../shared/http/http-status.js";
import { type Request, type Response } from "express";
import { requireSiteAccount } from "../../../site-middleware.js";
import { LINK_CODE_DIGITS, mintLinkCode } from "../../device-link-codes.js";
import { backupCodeFile } from "../../backup-code-file.js";
import { generateBackupCodes, backupCodeMeta } from "../../backup-codes.js";
import { listPasskeysAccount, passkeyDeviceSummary, revokePasskey } from "../../passkey-store.js";
import { requireRecentAuth } from "../step-up.js";
import { OK_FLAG, audit, loadAccountOr404 } from "./account-utils.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

(() => {
    router.post("/device-link/create", requireSiteAccount, requireRecentAuth, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        try {
            const code = mintLinkCode(siteAccountId);
            audit(
                siteAccountId,
                "Link code generated",
                `A ${LINK_CODE_DIGITS}-digit device-link code was minted on ur account.`,
            );
            res.json({ ok: OK_FLAG, code });
        } catch (err) {
            res.status(HTTP_INTERNAL_ERROR).json({ error: "link_code_mint_failed", message: (err as Error).message });
        }
    });
})();

(() => {
    router.post("/backup-codes/generate", requireSiteAccount, requireRecentAuth, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        const account = loadAccountOr404(siteAccountId, res);
        if (account === null) return;
        const codes = generateBackupCodes(siteAccountId);
        const fileContent = backupCodeFile({
            siteAccountId,
            codes,
            displayName: account.display_name ?? "(no display name)",
            devices: listPasskeysAccount(siteAccountId).map(passkeyDeviceSummary),
        });
        audit(siteAccountId, "Backup codes regenerated", "A fresh set of 10 backup codes was generated.");
        res.json({ ok: OK_FLAG, codes, fileContent });
    });
})();

(() => {
    router.get("/backup-codes/meta", requireSiteAccount, (req: Request, res: Response) => {
        const meta = backupCodeMeta(req.siteAccountId!);
        res.json({ meta });
    });
})();

(() => {
    router.get("/devices", requireSiteAccount, (req: Request, res: Response) => {
        const rows = listPasskeysAccount(req.siteAccountId!);
        res.json({
            devices: rows.map((p) => ({
                id: p.id,
                deviceName: p.device_name,
                createdAt: p.created_at,
                lastUsedAt: p.last_used_at,
            })),
        });
    });
})();

(() => {
    router.delete("/devices/:id", requireSiteAccount, requireRecentAuth, (req: Request, res: Response) => {
        const siteAccountId = req.siteAccountId!;
        if (!revokePasskey(String(req.params.id ?? ""), siteAccountId)) {
            res.status(HTTP_NOT_FOUND).json({ error: "device_not_found" });
            return;
        }
        audit(siteAccountId, "Device revoked", "A passkey was revoked from ur account.");
        res.json({ ok: OK_FLAG });
    });
})();

export default router;
