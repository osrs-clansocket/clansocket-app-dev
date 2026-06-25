import { Router } from "express";
import { DB_NAMES, clanPluginMetrics, getDb } from "../database/index.js";
import { requireSiteAccount } from "../auth/site-middleware.js";
import { pluginConnectedCount } from "./session/session-registry/index.js";
import { registerApi } from "../api-registry.js";

const router = Router();

(() => {
    router.get("/metrics", requireSiteAccount, (_req, res) => {
        const appDb = getDb(DB_NAMES.APP);
        const clans = appDb.prepare("SELECT id FROM clansocket_clans WHERE archived_at IS NULL").all() as {
            id: string;
        }[];
        let totalSessions = 0;
        let uniqueAccounts = 0;
        let rsnChanges = 0;
        for (const clan of clans) {
            const m = clanPluginMetrics(clan.id);
            totalSessions += m.totalSessions;
            uniqueAccounts += m.uniqueAccounts;
            rsnChanges += m.rsnChanges;
        }
        res.json({
            connected: pluginConnectedCount(),
            totalSessions,
            uniqueAccounts,
            rsnChanges,
        });
    });
})();

registerApi("/api/clansocket", router);
export default router;
