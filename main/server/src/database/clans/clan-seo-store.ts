import { getDb, DB_NAMES } from "../core/database.js";
import { getOne, execMutation } from "../core/db-ops.js";
import { selectColumns } from "../../shared/loaders/db-rows.js";

export interface ClanSeoRow {
    slug: string;
    display_name: string;
    seo_title: string | null;
    seo_description: string | null;
    seo_image: string | null;
    is_public: number;
    public_toggled_at: number | null;
}

export interface ClanSeoPatch {
    title?: string | null;
    description?: string | null;
    image?: string | null;
    isPublic?: boolean;
}

const CLAN_SEO_COLUMNS = "slug, display_name, seo_title, seo_description, seo_image, is_public, public_toggled_at";

export function seoBySlug(slug: string): ClanSeoRow | null {
    return getOne<ClanSeoRow>(
        getDb(DB_NAMES.APP),
        `SELECT ${CLAN_SEO_COLUMNS} FROM clansocket_clans WHERE slug = ? AND archived_at IS NULL`,
        slug,
    );
}

export function seoById(clanId: string): ClanSeoRow | null {
    return getOne<ClanSeoRow>(
        getDb(DB_NAMES.APP),
        `SELECT ${CLAN_SEO_COLUMNS} FROM clansocket_clans WHERE id = ? AND archived_at IS NULL`,
        clanId,
    );
}

export function listPublicSlugs(): readonly string[] {
    return selectColumns<string>(
        DB_NAMES.APP,
        `SELECT slug FROM clansocket_clans WHERE is_public = 1 AND archived_at IS NULL ORDER BY slug ASC`,
    );
}

interface SeoFieldUpdate {
    readonly column: string;
    readonly value: string | number | null;
}

export function updateClanSeo(clanId: string, patch: ClanSeoPatch, publicFlipAtMs?: number): boolean {
    const ops: SeoFieldUpdate[] = [];
    if (patch.title !== undefined) ops.push({ column: "seo_title", value: patch.title });
    if (patch.description !== undefined) ops.push({ column: "seo_description", value: patch.description });
    if (patch.image !== undefined) ops.push({ column: "seo_image", value: patch.image });
    if (patch.isPublic !== undefined) ops.push({ column: "is_public", value: patch.isPublic ? 1 : 0 });
    if (ops.length === 0) return false;
    if (publicFlipAtMs !== undefined) ops.push({ column: "public_toggled_at", value: publicFlipAtMs });
    const setClause = ops.map((o) => `${o.column} = ?`).join(", ");
    const params = ops.map((o) => o.value);
    execMutation(getDb(DB_NAMES.APP), `UPDATE clansocket_clans SET ${setClause} WHERE id = ?`, ...params, clanId);
    return true;
}
