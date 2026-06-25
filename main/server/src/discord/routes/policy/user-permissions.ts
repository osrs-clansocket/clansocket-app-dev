import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { authenticate, handleAsync, validateGuildId } from "../../../api/middleware.js";
import { resolveClanId } from "../../../database/discord/audit/resolve-clan.js";
import { listForUser } from "../../../database/discord/user-permissions/list.js";
import { setForUser } from "../../../database/discord/user-permissions/set.js";
import { HTTP_BAD_REQUEST, HTTP_INTERNAL_ERROR, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";

import { mountedRouter } from "../_mount-registry.js";
const SYSTEM_GRANTER = "_system";

const router = mountedRouter("/permissions");

(() => {
    router.get(
        "/:guildId/:userId",
        authenticate,
        validateGuildId,
        handleAsync(async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const userId = req.params.userId as string;
            try {
                const clanId = resolveClanId(guildId);
                if (!clanId) {
                    res.status(HTTP_NOT_FOUND).json({ error: "guild_not_registered" });
                    return;
                }
                const permissions = listForUser(clanId, guildId, userId);
                res.json({ permissions });
            } catch (err) {
                logger.error(`[discord] list permissions failed for ${guildId}/${userId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "list_permissions_failed" });
            }
        }),
    );
})();

interface SetPermsArgs {
    clanId: string;
    guildId: string;
    userId: string;
    permissions: string[];
}

function applySetPermissions(a: SetPermsArgs): void {
    setForUser({
        clanId: a.clanId,
        guildId: a.guildId,
        userId: a.userId,
        permissions: a.permissions,
        grantedBySiteAccountId: SYSTEM_GRANTER,
        grantedBySiteAccountName: null,
    });
}

function gateSetPerms(req: Request, res: Response, guildId: string): { permissions: string[]; clanId: string } | null {
    const permissions = Array.isArray(req.body?.permissions) ? req.body.permissions : null;
    if (!permissions) {
        res.status(HTTP_BAD_REQUEST).json({ error: "permissions_array_required" });
        return null;
    }
    const clanId = resolveClanId(guildId);
    if (!clanId) {
        res.status(HTTP_NOT_FOUND).json({ error: "guild_not_registered" });
        return null;
    }
    return { permissions, clanId };
}

(() => {
    router.put(
        "/:guildId/:userId",
        authenticate,
        validateGuildId,
        handleAsync(async (req: Request, res: Response) => {
            const guildId = req.params.guildId as string;
            const userId = req.params.userId as string;
            try {
                const gate = gateSetPerms(req, res, guildId);
                if (!gate) return;
                applySetPermissions({ guildId, userId, clanId: gate.clanId, permissions: gate.permissions });
                res.json({ ok: true });
            } catch (err) {
                logger.error(`[discord] set permissions failed for ${guildId}/${userId}: ${(err as Error).message}`);
                res.status(HTTP_INTERNAL_ERROR).json({ error: "set_permissions_failed" });
            }
        }),
    );
})();

export default router;
