import { type Request, type Response } from "express";
import { clanById } from "../../database/clans/clan-store.js";
import { hashesForAccount } from "../../database/site/site-accounts/index.js";
import { sessionsByHash, type PluginLiveSession } from "../../plugin-api/session/session-registry/index.js";
import { requireAccount } from "./oauth-session.js";
import { mountedRouter } from "./_mount-registry.js";

const router = mountedRouter();

function gatherAccountSessions(siteAccountId: string): PluginLiveSession[] {
    const boundHashes = hashesForAccount(siteAccountId);
    const byHash: PluginLiveSession[] = [];
    for (const hash of boundHashes) {
        for (const hit of sessionsByHash(hash)) byHash.push(hit);
    }
    const seen = new Set<string>();
    return byHash.filter((s) => {
        if (seen.has(s.sessionId)) return false;
        seen.add(s.sessionId);
        return true;
    });
}

function projectSession(s: PluginLiveSession) {
    const inGameClan = s.inGameClanId ? clanById(s.inGameClanId) : null;
    const managerClan = s.managerClanId ? clanById(s.managerClanId) : null;
    return {
        sessionId: s.sessionId,
        accountHash: s.accountHash,
        rsn: s.rsn,
        world: s.world,
        loginState: s.loginState,
        inGameClanId: s.inGameClanId,
        inGameClanName: inGameClan?.display_name ?? "",
        inGameClanStatus: inGameClan?.status ?? null,
        inGameClanRank: s.inGameClanRank,
        managerClanId: s.managerClanId,
        managerClanName: managerClan?.display_name ?? "",
        managerVerified: s.managerVerified,
        autoVerifyReason: s.autoVerifyReason,
        lastIdentityAt: s.lastIdentityAt,
        connectedAt: s.connectedAt,
        pingMs: s.pingMs,
    };
}

(() => {
    router.get("/sessions", (req: Request, res: Response) => {
        const siteAccountId = requireAccount(req, res);
        if (!siteAccountId) return;
        const merged = gatherAccountSessions(siteAccountId);
        res.json({ sessions: merged.map(projectSession) });
    });
})();

export default router;
