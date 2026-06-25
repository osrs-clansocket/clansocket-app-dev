import { HTTP_BAD_REQUEST } from "../../shared/http/http-status.js";
import {
    deleteGlobalPreset,
    deleteOverride,
    getGlobalPreset,
    getOverride,
    listOverrides,
    setGlobalPreset,
    setOverride,
} from "../../database/index.js";
import { requireSiteAccount } from "../../auth/site-middleware.js";
import { broadcastClan, broadcastMember } from "../../plugin-api/handlers/clan-config.js";
import { withManager } from "./manager-context.js";
import { pluginRosterMembers } from "./plugin-config-roster.js";
import { parseBodyValues, type PluginConfigValues } from "./plugin-config-sanitize.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

(() => {
    router.get(
        "/:slug/manage/plugin-config",
        requireSiteAccount,
        withManager((ctx, _req, res) => {
            const global = getGlobalPreset(ctx.clanId);
            const overrides = listOverrides(ctx.clanId);
            res.json({
                global,
                overrides,
                members: pluginRosterMembers(ctx.clanId),
            });
        }),
    );
})();

(() => {
    router.put(
        "/:slug/manage/plugin-config/global",
        requireSiteAccount,
        withManager((ctx, req, res) => {
            const values = parseBodyValues(req.body);
            if (values === null) {
                res.status(HTTP_BAD_REQUEST).json({ error: "bad_preset" });
                return;
            }
            setGlobalPreset(ctx.clanId, values, ctx.siteAccountId, Date.now());
            broadcastClan(ctx.clanId);
            res.json({ ok: true });
        }),
    );
})();

(() => {
    router.delete(
        "/:slug/manage/plugin-config/global",
        requireSiteAccount,
        withManager((ctx, _req, res) => {
            deleteGlobalPreset(ctx.clanId);
            res.json({ ok: true });
        }),
    );
})();

function gateOverrideUpsert(
    req: { params: { accountHash?: string }; body: unknown },
    res: { status: (n: number) => { json: (b: unknown) => void } },
): { accountHash: string; values: PluginConfigValues } | null {
    const accountHash = String(req.params.accountHash ?? "");
    if (accountHash.length === 0) {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_account_hash" });
        return null;
    }
    const values = parseBodyValues(req.body);
    if (values === null) {
        res.status(HTTP_BAD_REQUEST).json({ error: "bad_preset" });
        return null;
    }
    return { accountHash, values };
}

(() => {
    router.put(
        "/:slug/manage/plugin-config/members/:accountHash",
        requireSiteAccount,
        withManager((ctx, req, res) => {
            const gate = gateOverrideUpsert(req, res);
            if (!gate) return;
            setOverride({
                accountHash: gate.accountHash,
                values: gate.values,
                clanId: ctx.clanId,
                siteAccountId: ctx.siteAccountId,
                nowMs: Date.now(),
            });
            broadcastMember(ctx.clanId, gate.accountHash);
            res.json({ ok: true });
        }),
    );
})();

(() => {
    router.delete(
        "/:slug/manage/plugin-config/members/:accountHash",
        requireSiteAccount,
        withManager((ctx, req, res) => {
            const accountHash = String(req.params.accountHash ?? "");
            if (accountHash.length === 0) {
                res.status(HTTP_BAD_REQUEST).json({ error: "bad_account_hash" });
                return;
            }
            const existed = getOverride(ctx.clanId, accountHash) !== null;
            deleteOverride(ctx.clanId, accountHash);
            if (existed) {
                broadcastMember(ctx.clanId, accountHash);
            }
            res.json({ ok: true });
        }),
    );
})();

export default router;
