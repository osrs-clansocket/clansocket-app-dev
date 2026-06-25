import { ERROR_CLAN_NOT_FOUND } from "../../../shared/error-reasons.js";
import { HTTP_BAD_REQUEST, HTTP_NOT_FOUND } from "../../../shared/http/http-status.js";
import logger from "@clansocket/logger";
import { type Request, type Response } from "express";
import { clanBySlug, getClanDb, seoBySlug, getPluginPresence, titleLadder } from "../../../database/index.js";
import { canonicalRsn } from "../../../database/site/rsn/canonicalize.js";
import { projectPublicClan, type PublicClanMember, type PublicClanRoster } from "../../projectors/public-projector.js";
import { mountedRouter } from "../_mount-registry.js";

const router = mountedRouter();

function loadActiveClan(slug: string, res: Response): NonNullable<ReturnType<typeof clanBySlug>> | null {
    const clan = clanBySlug(slug);
    if (!clan || clan.archived_at !== null) {
        res.status(HTTP_NOT_FOUND).json({ error: ERROR_CLAN_NOT_FOUND });
        return null;
    }
    return clan;
}

interface RawRosterMember {
    name: string;
    rank: string | null;
    joinedAt: string | null;
    accountHash?: string | null;
}

interface RosterRow {
    fingerprint: string;
    captured_at: number;
    member_count: number;
    members_json: string;
}

function projectMember(
    m: RawRosterMember,
    presence: Record<string, { hasPlugin?: boolean; isLive?: boolean } | undefined>,
): PublicClanMember {
    const p = presence[m.name.toLowerCase()];
    return {
        name: canonicalRsn(m.name),
        rank: m.rank,
        joinedAt: m.joinedAt,
        hasPlugin: p?.hasPlugin === true,
        isLive: p?.isLive === true,
    };
}

function loadPublicRoster(clanId: string): PublicClanRoster | null {
    try {
        const row = getClanDb(clanId)
            .prepare(
                `SELECT fingerprint, captured_at, member_count, members_json
                 FROM clan_rosters ORDER BY captured_at DESC LIMIT 1`,
            )
            .get() as RosterRow | undefined;
        if (!row) return null;
        const rawMembers = JSON.parse(row.members_json) as RawRosterMember[];
        const presence = getPluginPresence(clanId, rawMembers);
        return {
            capturedAt: row.captured_at,
            memberCount: row.member_count,
            members: rawMembers.map((m) => projectMember(m, presence)),
        };
    } catch (err) {
        logger.error(`[clansocket_clans] roster lookup failed for ${clanId}: ${(err as Error).message}`);
        return null;
    }
}

(() => {
    router.get("/:slug", (req: Request, res: Response) => {
        const slug = String(req.params.slug ?? "").toLowerCase();
        if (!slug) {
            res.status(HTTP_BAD_REQUEST).json({ error: "bad_slug" });
            return;
        }
        const clan = loadActiveClan(slug, res);
        if (!clan) return;
        res.json(projectPublicClan(clan, loadPublicRoster(clan.id)));
    });
})();

(() => {
    router.get("/:slug/clan-titles", (req: Request, res: Response) => {
        const clan = loadActiveClan(String(req.params.slug ?? "").toLowerCase(), res);
        if (!clan) return;
        res.json({ entries: titleLadder(clan.id) });
    });
})();

const PUBLIC_FLAG_TRUE = 1;

(() => {
    router.get("/:slug/seo", (req: Request, res: Response) => {
        const slug = String(req.params.slug ?? "").toLowerCase();
        const row = seoBySlug(slug);
        if (row === null || row.is_public !== PUBLIC_FLAG_TRUE) {
            res.status(HTTP_NOT_FOUND).json({ error: "clan_not_public" });
            return;
        }
        res.json({
            title: row.seo_title ?? row.display_name,
            description: row.seo_description ?? `${row.display_name} on ClanSocket.`,
            image: row.seo_image ?? undefined,
        });
    });
})();

export default router;
