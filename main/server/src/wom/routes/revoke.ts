import { type Request, type Response } from "express";
import { handleAsync } from "../../api/middleware.js";
import { deleteVaultEntry } from "../../clan-vault/index.js";
import type { Actor } from "../../clan-vault/shared/vault-types.js";
import { clanWomIdentity } from "../../database/wom/identity/get-clan-identity.js";
import { HTTP_FORBIDDEN, HTTP_NOT_FOUND } from "../../shared/http/http-status.js";
import { withClanTry } from "../../clans/preflights/with-clan-try.js";
import { isWomOwner } from "../auth/linker-gate.js";
import { mountedRouter } from "./_mount-registry.js";

const ENTRY_KEY_WOM = "wom";

const router = mountedRouter();

router.delete(
    "/:slug",
    handleAsync((req: Request, res: Response) =>
        withClanTry(req, res, { label: "wom", errorCode: "revoke_failed" }, async (ctx) => {
            const { clan, sid } = ctx;
            const existing = clanWomIdentity(clan.id);
            if (!existing) {
                res.status(HTTP_NOT_FOUND).json({ error: "no_wom_linked" });
                return;
            }
            if (!isWomOwner(sid, clan.id, existing.linker_site_account_id)) {
                res.status(HTTP_FORBIDDEN).json({ error: "not_linker_or_clan_owner" });
                return;
            }
            const actor: Actor = { kind: "user", user_id: sid };
            await deleteVaultEntry(clan.id, ENTRY_KEY_WOM, actor);
            res.json({ ok: true });
        }),
    ),
);

export default router;
